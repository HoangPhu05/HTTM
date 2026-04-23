"""
Data Service for reading and managing environmental data.
Includes time-series prediction support.
"""

from datetime import datetime
from typing import Any, Dict, List

import numpy as np
import pandas as pd

try:
    from models.lstm_predictor import SimpleARIMAPredictor

    ARIMA_AVAILABLE = True
except ImportError:
    ARIMA_AVAILABLE = False
    print("ARIMA not available. Install statsmodels: pip install statsmodels")


FEATURE_COLS = [
    "CO2",
    "PM2.5",
    "PM10",
    "Humidity",
    "Temperature",
    "Occupancy_Count",
    "TVOC",
    "CO",
]


class DataService:
    """Handle data loading, simulation, and prediction."""

    def __init__(self, csv_path: str, enable_prediction: bool = True):
        self.csv_path = csv_path
        self.data = None
        self.current_index = 0

        self.enable_prediction = enable_prediction and ARIMA_AVAILABLE
        self.predictor = None
        self.data_normalized = None
        self.scaler = None

        self.load_data()

        if self.enable_prediction:
            self._init_predictor()

    def load_data(self):
        """Load data from CSV file."""
        try:
            self.data = pd.read_csv(self.csv_path)
            self.data = self.data.replace("", np.nan)
            self.data = self.data.ffill().bfill()
            self.current_index = 0
            print(f"Loaded {len(self.data)} rows from {self.csv_path}")
        except Exception as e:
            print(f"Error loading data: {e}")
            self.data = None

    def get_current_record(self) -> Dict[str, Any]:
        """Get current record and advance index."""
        if self.data is None or len(self.data) == 0:
            return self._default_record()

        record = self.data.iloc[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.data)

        return {
            "timestamp": str(record.get("Timestamp", datetime.now())),
            "temperature": float(record.get("Temperature", 23.0)),
            "humidity": float(record.get("Humidity", 55.0)),
            "co2": float(record.get("CO2", 800.0)),
            "pm25": float(record.get("PM2.5", 30.0)),
            "pm10": float(record.get("PM10", 50.0)),
            "tvoc": float(record.get("TVOC", 150.0)),
            "co": float(record.get("CO", 1.0)),
            "occupancy_count": int(record.get("Occupancy_Count", 20)),
            "ventilation_status": str(record.get("Ventilation_Status", "Closed")),
        }

    def get_latest_records(self, count: int = 20) -> List[Dict[str, Any]]:
        """Get latest N records."""
        if self.data is None or len(self.data) == 0:
            return []

        start_idx = max(0, self.current_index - count)
        records = []

        for i in range(start_idx, min(self.current_index, len(self.data))):
            record = self.data.iloc[i]
            records.append(
                {
                    "timestamp": str(record.get("Timestamp", datetime.now())),
                    "temperature": float(record.get("Temperature", 23.0)),
                    "humidity": float(record.get("Humidity", 55.0)),
                    "co2": float(record.get("CO2", 800.0)),
                    "pm25": float(record.get("PM2.5", 30.0)),
                    "pm10": float(record.get("PM10", 50.0)),
                    "tvoc": float(record.get("TVOC", 150.0)),
                    "co": float(record.get("CO", 1.0)),
                    "occupancy_count": int(record.get("Occupancy_Count", 20)),
                    "ventilation_status": str(record.get("Ventilation_Status", "Closed")),
                }
            )

        return records

    def _init_predictor(self):
        """Initialize and train ARIMA predictor."""
        if not ARIMA_AVAILABLE or not self.enable_prediction:
            return

        try:
            print("\nInitializing ARIMA Predictor...")
            self.predictor = SimpleARIMAPredictor()

            print("   Training ARIMA on dataset...")
            train_data = self.data[FEATURE_COLS].copy()
            self.predictor.train(train_data, order=(2, 1, 2))

            print("ARIMA Predictor ready for predictions\n")
            self.enable_prediction = True
        except Exception as e:
            print(f"Predictor initialization failed: {e}")
            self.enable_prediction = False

    def get_last_20_rows_normalized(self) -> np.ndarray:
        """Get last 20 rows for model input."""
        if self.data is None or self.predictor is None:
            return None

        last_idx = min(self.current_index, len(self.data))
        start_idx = max(0, last_idx - 20)
        last_data = self.data.iloc[start_idx:last_idx][FEATURE_COLS].values

        if len(last_data) < 20:
            padding = np.repeat(last_data[0:1], 20 - len(last_data), axis=0)
            last_data = np.vstack([padding, last_data])

        return last_data

    def predict_next_5min(self) -> Dict[str, float]:
        """
        Predict air quality values for the next 5 minutes.

        The original ARIMA forecast alone tends to stay almost unchanged because it
        is fit once on the full dataset. We blend that baseline forecast with the
        latest rolling window and short-term trend so the output follows the
        simulated stream as current_index advances.
        """
        if not self.enable_prediction or self.predictor is None:
            return None

        try:
            if self.data is None or len(self.data) == 0:
                return None

            last_idx = min(self.current_index, len(self.data))
            if last_idx <= 0:
                last_idx = 1

            start_idx = max(0, last_idx - 20)
            recent_df = self.data.iloc[start_idx:last_idx][FEATURE_COLS].copy()
            if recent_df.empty:
                return None

            base_prediction = self.predictor.predict_next_denormalized(recent_df)
            if not base_prediction:
                return None

            latest = recent_df.iloc[-1]
            previous = recent_df.iloc[-2] if len(recent_df) > 1 else latest
            recent_mean = recent_df.mean()

            prediction = {}
            for col in FEATURE_COLS:
                baseline = float(base_prediction.get(col, latest[col]))
                latest_val = float(latest[col])
                previous_val = float(previous[col])
                mean_val = float(recent_mean[col])
                short_trend = latest_val - previous_val

                adjusted = (baseline * 0.45) + (latest_val * 0.35) + (mean_val * 0.20) + (short_trend * 0.80)

                if col == "Occupancy_Count":
                    prediction[col] = max(0, round(adjusted))
                else:
                    prediction[col] = round(max(0.0, adjusted), 2)

            return prediction
        except Exception as e:
            print(f"Prediction failed: {e}")
            return None

    def get_all_records(self) -> List[Dict[str, Any]]:
        """Get all records."""
        if self.data is None or len(self.data) == 0:
            return []

        records = []
        for _, record in self.data.iterrows():
            records.append(
                {
                    "timestamp": str(record.get("Timestamp", datetime.now())),
                    "temperature": float(record.get("Temperature", 23.0)),
                    "humidity": float(record.get("Humidity", 55.0)),
                    "co2": float(record.get("CO2", 800.0)),
                    "pm25": float(record.get("PM2.5", 30.0)),
                    "pm10": float(record.get("PM10", 50.0)),
                    "tvoc": float(record.get("TVOC", 150.0)),
                    "co": float(record.get("CO", 1.0)),
                    "occupancy_count": int(record.get("Occupancy_Count", 20)),
                    "ventilation_status": str(record.get("Ventilation_Status", "Closed")),
                }
            )

        return records

    def _default_record(self) -> Dict[str, Any]:
        """Return default record if data unavailable."""
        return {
            "timestamp": datetime.now().isoformat(),
            "temperature": 23.0,
            "humidity": 55.0,
            "co2": 800.0,
            "pm25": 30.0,
            "pm10": 50.0,
            "tvoc": 150.0,
            "co": 1.0,
            "occupancy_count": 20,
            "ventilation_status": "Closed",
        }
