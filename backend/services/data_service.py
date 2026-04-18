"""
Data Service for reading and managing environmental data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os


class DataService:
    """Handle data loading and simulation"""
    
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.data = None
        self.current_index = 0
        self.load_data()
    
    def load_data(self):
        """Load data from CSV file"""
        try:
            self.data = pd.read_csv(self.csv_path)
            # Clean data - replace empty strings with NaN
            self.data = self.data.replace('', np.nan)
            # Forward fill missing values
            self.data = self.data.ffill().bfill()
            # Reset index
            self.current_index = 0
            print(f"Loaded {len(self.data)} rows from {self.csv_path}")
        except Exception as e:
            print(f"Error loading data: {e}")
            self.data = None
    
    def get_current_record(self) -> Dict[str, Any]:
        """Get current record and advance index"""
        if self.data is None or len(self.data) == 0:
            return self._default_record()
        
        # Get current record
        record = self.data.iloc[self.current_index]
        
        # Advance index
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
            "ventilation_status": str(record.get("Ventilation_Status", "Closed"))
        }
    
    def get_latest_records(self, count: int = 20) -> List[Dict[str, Any]]:
        """Get latest N records"""
        if self.data is None or len(self.data) == 0:
            return []
        
        start_idx = max(0, self.current_index - count)
        records = []
        
        for i in range(start_idx, min(self.current_index, len(self.data))):
            record = self.data.iloc[i]
            records.append({
                "timestamp": str(record.get("Timestamp", datetime.now())),
                "temperature": float(record.get("Temperature", 23.0)),
                "humidity": float(record.get("Humidity", 55.0)),
                "co2": float(record.get("CO2", 800.0)),
                "pm25": float(record.get("PM2.5", 30.0)),
                "pm10": float(record.get("PM10", 50.0)),
                "tvoc": float(record.get("TVOC", 150.0)),
                "co": float(record.get("CO", 1.0)),
                "occupancy_count": int(record.get("Occupancy_Count", 20)),
                "ventilation_status": str(record.get("Ventilation_Status", "Closed"))
            })
        
        return records
    
    def get_all_records(self) -> List[Dict[str, Any]]:
        """Get all records"""
        if self.data is None or len(self.data) == 0:
            return []
        
        records = []
        for _, record in self.data.iterrows():
            records.append({
                "timestamp": str(record.get("Timestamp", datetime.now())),
                "temperature": float(record.get("Temperature", 23.0)),
                "humidity": float(record.get("Humidity", 55.0)),
                "co2": float(record.get("CO2", 800.0)),
                "pm25": float(record.get("PM2.5", 30.0)),
                "pm10": float(record.get("PM10", 50.0)),
                "tvoc": float(record.get("TVOC", 150.0)),
                "co": float(record.get("CO", 1.0)),
                "occupancy_count": int(record.get("Occupancy_Count", 20)),
                "ventilation_status": str(record.get("Ventilation_Status", "Closed"))
            })
        
        return records
    
    def _default_record(self) -> Dict[str, Any]:
        """Return default record if data unavailable"""
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
            "ventilation_status": "Closed"
        }
