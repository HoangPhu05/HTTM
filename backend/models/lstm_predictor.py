"""
LSTM and ARIMA prediction helpers for air-quality forecasting.
"""

from pathlib import Path
import pickle

import numpy as np
import pandas as pd

try:
    import tensorflow as tf
    from tensorflow.keras.layers import Dense, Dropout, LSTM
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.optimizers import Adam

    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow not installed. Install with: pip install tensorflow")


class LSTMPredictor:
    """
    LSTM-based time-series forecaster for multi-step air-quality prediction.
    """

    def __init__(self, sequence_length=20, num_features=8, model_path=None):
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow is required. Install with: pip install tensorflow")

        self.sequence_length = sequence_length
        self.num_features = num_features
        self.model_path = model_path or str(Path(__file__).parent / "lstm_model.h5")
        self.scaler_path = Path(self.model_path).parent / "scaler.pkl"

        self.model = None
        self.scaler = None
        self.feature_names = [
            "CO2",
            "PM2.5",
            "PM10",
            "Humidity",
            "Temperature",
            "Occupancy_Count",
            "TVOC",
            "CO",
        ]

    def build_model(self):
        """Build LSTM architecture."""
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow required")

        self.model = Sequential(
            [
                LSTM(
                    64,
                    activation="relu",
                    input_shape=(self.sequence_length, self.num_features),
                    return_sequences=True,
                ),
                Dropout(0.2),
                LSTM(32, activation="relu", return_sequences=False),
                Dropout(0.2),
                Dense(16, activation="relu"),
                Dropout(0.1),
                Dense(self.num_features),
            ]
        )

        self.model.compile(optimizer=Adam(learning_rate=0.001), loss="mse", metrics=["mae"])
        print("LSTM Model built successfully")
        print(self.model.summary())

    def normalize(self, data):
        """Normalize data to 0-1 range."""
        from sklearn.preprocessing import MinMaxScaler

        if self.scaler is None:
            self.scaler = MinMaxScaler(feature_range=(0, 1))
            normalized = self.scaler.fit_transform(data)
            with open(self.scaler_path, "wb") as f:
                pickle.dump(self.scaler, f)
        else:
            normalized = self.scaler.transform(data)

        return normalized

    def denormalize(self, data):
        """Convert normalized data back to original scale."""
        if self.scaler is None:
            with open(self.scaler_path, "rb") as f:
                self.scaler = pickle.load(f)

        return self.scaler.inverse_transform(data)

    def create_sequences(self, data, labels=None):
        """Create sequences for LSTM training."""
        X, y = [], []

        for i in range(len(data) - self.sequence_length):
            X.append(data[i : i + self.sequence_length])
            if labels is not None:
                y.append(labels[i + self.sequence_length])
            else:
                y.append(data[i + self.sequence_length])

        return np.array(X), np.array(y)

    def train(self, data_df, epochs=50, batch_size=32, validation_split=0.2):
        """Train LSTM on historical dataset."""
        if self.model is None:
            self.build_model()

        df_subset = data_df[self.feature_names].copy()

        print("Normalizing data...")
        data_normalized = self.normalize(df_subset.values)

        print(f"Creating sequences (sequence_length={self.sequence_length})...")
        X, y = self.create_sequences(data_normalized)

        print(f"   X shape: {X.shape} (samples, timesteps, features)")
        print(f"   y shape: {y.shape} (samples, features)")

        print(f"\nTraining LSTM for {epochs} epochs...")
        history = self.model.fit(
            X,
            y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1,
        )

        self.save()
        return history

    def predict_next(self, last_sequence):
        """Predict next timestep given last sequence."""
        if self.model is None:
            self.load()

        X = last_sequence.reshape(1, self.sequence_length, self.num_features)
        prediction_normalized = self.model.predict(X, verbose=0)
        return prediction_normalized[0]

    def predict_next_denormalized(self, last_sequence):
        """Predict and return denormalized values in original scale."""
        pred_normalized = self.predict_next(last_sequence)
        pred_reshaped = pred_normalized.reshape(1, -1)
        pred_denormalized = self.denormalize(pred_reshaped)[0]

        return {
            self.feature_names[i]: float(pred_denormalized[i]) for i in range(self.num_features)
        }

    def save(self):
        """Save model weights."""
        if self.model is not None:
            self.model.save(self.model_path)
            print(f"Model saved to {self.model_path}")

    def load(self):
        """Load model weights."""
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow required")

        if Path(self.model_path).exists():
            self.model = load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
            if Path(self.scaler_path).exists():
                with open(self.scaler_path, "rb") as f:
                    self.scaler = pickle.load(f)
        else:
            raise FileNotFoundError(f"Model not found at {self.model_path}")


class SimpleARIMAPredictor:
    """
    Fallback ARIMA predictor using statsmodels.
    """

    def __init__(self):
        try:
            from statsmodels.tsa.arima.model import ARIMA

            self.ARIMA = ARIMA
            self.models = {}
            self.feature_names = [
                "CO2",
                "PM2.5",
                "PM10",
                "Humidity",
                "Temperature",
                "Occupancy_Count",
                "TVOC",
                "CO",
            ]
        except ImportError:
            raise ImportError("statsmodels required. Install with: pip install statsmodels")

    def train(self, data_df, order=(2, 1, 2)):
        """Train ARIMA model for each feature."""
        print("Training ARIMA models...")
        for col in self.feature_names:
            if col in data_df.columns:
                print(f"   Training {col}...")
                model = self.ARIMA(data_df[col], order=order)
                self.models[col] = model.fit()

        print("ARIMA models trained")

    def predict_next_denormalized(self, data_df=None):
        """
        Predict next values using fast EWM (no refit).

        Falls back to last-known value if ARIMA model not available.
        When a recent window is provided, uses a lightweight exponential
        weighted mean so it responds to the live stream without the cost
        of re-fitting ARIMA every call.
        """
        predictions = {}
        for col in self.feature_names:
            if data_df is not None and col in data_df.columns:
                series = data_df[col].astype(float)
                if len(series) < 2:
                    predictions[col] = float(series.iloc[-1])
                    continue
                # Fast EWM prediction: no model fitting required
                ewm_val = series.ewm(alpha=0.3, adjust=False).mean().iloc[-1]
                predictions[col] = float(ewm_val)
                continue

            if col in self.models:
                pred = self.models[col].get_forecast(steps=1).predicted_mean.values[0]
                predictions[col] = float(pred)

        return predictions


predictor = None


if __name__ == "__main__":
    print("LSTM Predictor Module")
    print("=" * 50)

    np.random.seed(42)
    dummy_data = pd.DataFrame(
        {
            "CO2": np.random.randint(400, 1000, 1000),
            "PM2.5": np.random.randint(10, 100, 1000),
            "PM10": np.random.randint(20, 150, 1000),
            "Humidity": np.random.randint(30, 80, 1000),
            "Temperature": np.random.randint(15, 30, 1000),
            "Occupancy_Count": np.random.randint(0, 50, 1000),
            "TVOC": np.random.randint(50, 400, 1000),
            "CO": np.random.randint(1, 10, 1000),
        }
    )

    print("\nSample data:")
    print(dummy_data.head())

    if TF_AVAILABLE:
        predictor = LSTMPredictor()
        predictor.build_model()
        print("\nLSTM Predictor ready")
