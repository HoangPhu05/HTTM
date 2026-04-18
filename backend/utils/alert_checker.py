"""
Alert Checking Module for Air Quality Thresholds
"""

from typing import List, Dict, Any


class AlertChecker:
    """Check environmental parameters against thresholds"""
    
    # Define thresholds
    THRESHOLDS = {
        "temperature": {
            "normal": (16, 28),  # Normal range in Celsius
            "warning": (14, 30),
            "danger": None
        },
        "humidity": {
            "normal": (40, 70),   # Normal range in percentage
            "warning": (30, 80),
            "danger": None
        },
        "co2": {
            "normal": (0, 800),   # ppm
            "warning": (800, 1200),
            "danger": (1200, 10000)
        },
        "pm25": {
            "normal": (0, 35),    # µg/m³
            "warning": (35, 75),
            "danger": (75, 1000)
        },
        "pm10": {
            "normal": (0, 50),    # µg/m³
            "warning": (50, 150),
            "danger": (150, 500)
        },
        "tvoc": {
            "normal": (0, 200),   # ppb
            "warning": (200, 400),
            "danger": (400, 10000)
        },
        "co": {
            "normal": (0, 4),     # ppm
            "warning": (4, 9),
            "danger": (9, 100)
        }
    }
    
    @classmethod
    def get_status_color(cls, value: float, parameter: str) -> str:
        """Get status color based on parameter value"""
        thresholds = cls.THRESHOLDS.get(parameter, {})
        
        # Check danger zone
        if "danger" in thresholds and thresholds["danger"]:
            min_val, max_val = thresholds["danger"]
            if min_val <= value <= max_val:
                return "red"
        
        # Check warning zone
        if "warning" in thresholds:
            min_val, max_val = thresholds["warning"]
            if min_val <= value <= max_val:
                return "yellow"
        
        # Check normal zone
        if "normal" in thresholds:
            min_val, max_val = thresholds["normal"]
            if min_val <= value <= max_val:
                return "green"
        
        return "green"
    
    @classmethod
    def check_parameter(cls, value: float, parameter: str) -> str:
        """Check single parameter and return status"""
        return cls.get_status_color(value, parameter)
    
    @classmethod
    def generate_alerts(cls, data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate list of current alerts"""
        alerts = []
        
        parameters = {
            "temperature": ("nhiệt độ", "°C"),
            "humidity": ("độ ẩm", "%"),
            "co2": ("CO2", "ppm"),
            "pm25": ("PM2.5", "µg/m³"),
            "pm10": ("PM10", "µg/m³"),
            "tvoc": ("TVOC", "ppb"),
            "co": ("CO", "ppm")
        }
        
        for param, (label, unit) in parameters.items():
            if param in data:
                value = data[param]
                status = cls.check_parameter(value, param)
                
                if status == "red":
                    alerts.append({
                        "parameter": label,
                        "value": round(value, 2),
                        "unit": unit,
                        "status": "danger",
                        "message": f"{label} ({value:.2f} {unit}) đã đạt mức nguy hiểm!"
                    })
                elif status == "yellow":
                    alerts.append({
                        "parameter": label,
                        "value": round(value, 2),
                        "unit": unit,
                        "status": "warning",
                        "message": f"{label} ({value:.2f} {unit}) ở mức cảnh báo"
                    })
        
        return alerts
    
    @classmethod
    def summarize_status(cls, data: Dict[str, Any]) -> Dict[str, str]:
        """Get overall status summary"""
        parameters = {
            "temperature": "Nhiệt độ",
            "humidity": "Độ ẩm",
            "co2": "CO2",
            "pm25": "PM2.5",
            "pm10": "PM10",
            "tvoc": "TVOC",
            "co": "CO"
        }
        
        status_map = {}
        for param, label in parameters.items():
            if param in data:
                status = cls.check_parameter(data[param], param)
                status_map[param] = status
        
        return status_map
