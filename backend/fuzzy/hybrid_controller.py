"""
Hybrid Fuzzy Logic Controller
Combines current sensor readings with predicted values for proactive control
"""

from typing import Dict, Tuple, Any
import numpy as np


class HybridFuzzyController:
    """
    Integrates fuzzy logic with predictive model
    
    Flow:
    1. Get current sensor values → Apply fuzzy logic → Current decision (50%)
    2. Get predicted values (5 min ahead) → Apply fuzzy logic → Predicted decision (70%)
    3. Combine both → Final decision (e.g., max for proactive control)
    4. Generate alert if significant change detected
    """
    
    def __init__(self, fuzzy_controller):
        """
        Args:
            fuzzy_controller: Existing FuzzyController instance
        """
        self.fuzzy = fuzzy_controller
        self.last_current_decision = 0
        self.last_predicted_decision = 0
    
    def make_decision_hybrid(self, 
                            current_sensors: Dict[str, float],
                            predicted_sensors: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Make control decision using both current and predicted values
        
        Args:
            current_sensors: dict with current CO2, PM2.5, Humidity, Occupancy
            predicted_sensors: dict with predicted values (optional)
        
        Returns:
            dict containing:
                - ventilation_level: float (0-100%) - final decision
                - current_reading: float - ventilation from current values
                - predicted_reading: float - ventilation from predicted values
                - change_detected: bool - if prediction differs significantly
                - alert_message: str - human-readable alert
                - reasoning: str - why decision was made
        """
        
        # Step 1: Fuzzy logic on current values
        current_control = self.fuzzy.control(
            co2=current_sensors.get('co2', 800),
            pm25=current_sensors.get('pm25', 30),
            humidity=current_sensors.get('humidity', 55),
            occupancy=current_sensors.get('occupancy_count', 20)
        )
        current_ventilation = current_control.get('ventilation_level', 0)
        
        # Step 2: Fuzzy logic on predicted values
        predicted_ventilation = 0
        alert_message = ""
        change_detected = False
        
        if predicted_sensors:
            predicted_control = self.fuzzy.control(
                co2=predicted_sensors.get('CO2', current_sensors.get('co2', 800)),
                pm25=predicted_sensors.get('PM2.5', current_sensors.get('pm25', 30)),
                humidity=predicted_sensors.get('Humidity', current_sensors.get('humidity', 55)),
                occupancy=predicted_sensors.get('Occupancy_Count', current_sensors.get('occupancy_count', 20))
            )
            predicted_ventilation = predicted_control.get('ventilation_level', 0)
            
            # Check for significant change
            ventilation_change = abs(predicted_ventilation - current_ventilation)
            if ventilation_change > 15:  # More than 15% change
                change_detected = True
                
                if predicted_ventilation > current_ventilation:
                    alert_message = (
                        f"⚠️ Alert: Air quality will worsen! "
                        f"Predicted ventilation: {predicted_ventilation:.0f}% "
                        f"(+{ventilation_change:.0f}%)"
                    )
                else:
                    alert_message = (
                        f"✓ Good: Air quality will improve! "
                        f"Predicted ventilation: {predicted_ventilation:.0f}% "
                        f"({ventilation_change:.0f}%)"
                    )
        
        # Step 3: Combine decisions
        # Strategy: Take maximum for proactive control (open fan before air gets bad)
        final_ventilation = max(current_ventilation, predicted_ventilation)
        
        # Step 4: Generate reasoning
        reasoning = self._generate_reasoning(
            current_ventilation, 
            predicted_ventilation, 
            final_ventilation,
            current_sensors,
            predicted_sensors
        )
        
        # Store for tracking
        self.last_current_decision = current_ventilation
        self.last_predicted_decision = predicted_ventilation
        
        return {
            "ventilation_level": final_ventilation,
            "current_reading": current_ventilation,
            "predicted_reading": predicted_ventilation,
            "change_detected": change_detected,
            "alert_message": alert_message,
            "reasoning": reasoning,
            "decision_strategy": "MAX(current, predicted) - Proactive control"
        }
    
    def _generate_reasoning(self, 
                           current_vent: float,
                           predicted_vent: float, 
                           final_vent: float,
                           current_sensors: Dict,
                           predicted_sensors: Dict = None) -> str:
        """Generate human-readable explanation for decision"""
        
        reasons = []
        
        # Current situation
        co2_current = current_sensors.get('co2', 0)
        pm25_current = current_sensors.get('pm25', 0)
        occ_current = current_sensors.get('occupancy_count', 0)
        
        if co2_current > 900:
            reasons.append(f"Current CO2 high ({co2_current:.0f} ppm)")
        if pm25_current > 50:
            reasons.append(f"Current PM2.5 high ({pm25_current:.0f} µg/m³)")
        if occ_current > 35:
            reasons.append(f"High occupancy ({occ_current:.0f} people)")
        
        # Predicted changes
        if predicted_sensors:
            co2_pred = predicted_sensors.get('CO2', co2_current)
            pm25_pred = predicted_sensors.get('PM2.5', pm25_current)
            
            if co2_pred > co2_current:
                reasons.append(f"🔴 Predicted CO2 will increase to {co2_pred:.0f} ppm")
            if pm25_pred > pm25_current:
                reasons.append(f"🔴 Predicted PM2.5 will increase to {pm25_pred:.0f} µg/m³")
        
        # Decision
        if final_vent > 75:
            reasons.append("→ Opening ventilation to MAXIMUM")
        elif final_vent > 50:
            reasons.append("→ Opening ventilation to MEDIUM")
        else:
            reasons.append("→ Keeping ventilation at LOW (good conditions)")
        
        return " | ".join(reasons) if reasons else "Stable conditions"
    
    def get_device_commands(self, ventilation_level: float) -> Dict[str, Any]:
        """
        Convert ventilation level to actual device commands
        
        Args:
            ventilation_level: float (0-100%)
        
        Returns:
            dict with fan_speed, door_status, light_mode
        """
        
        # 0-33%: Fan off, door closed
        # 34-66%: Fan medium, door semi-open
        # 67-100%: Fan high, door fully open
        
        if ventilation_level < 33:
            return {
                "fan_speed": 0,
                "fan_status": "OFF",
                "door_status": "CLOSED",
                "light_mode": "OFF"
            }
        elif ventilation_level < 67:
            return {
                "fan_speed": int(ventilation_level),
                "fan_status": "MEDIUM",
                "door_status": "SEMI-OPEN",
                "light_mode": "AUTO"
            }
        else:
            return {
                "fan_speed": 100,
                "fan_status": "HIGH",
                "door_status": "FULLY-OPEN",
                "light_mode": "ON"
            }
