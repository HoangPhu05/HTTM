"""
Fuzzy Logic Control Module for Air Quality Management System
Implements fuzzy inference system for ventilation control
"""

import numpy as np


class MembershipFunction:
    """Triangular membership function"""
    
    def __init__(self, a, b, c):
        """
        Initialize triangular membership function
        a, b, c: left, peak, right points
        """
        self.a = a
        self.b = b
        self.c = c
    
    def membership(self, x):
        """Calculate membership value for input x"""
        if x < self.a or x > self.c:
            return 0.0
        elif x <= self.b:
            if self.a == self.b:
                return 1.0 if x == self.a else 0.0
            return (x - self.a) / (self.b - self.a)
        else:
            if self.b == self.c:
                return 1.0 if x == self.b else 0.0
            return (self.c - x) / (self.c - self.b)


class FuzzyVariable:
    """Fuzzy variable with membership functions"""
    
    def __init__(self, name, min_val, max_val):
        self.name = name
        self.min_val = min_val
        self.max_val = max_val
        self.membership_funcs = {}
    
    def add_membership(self, label, mf):
        """Add membership function"""
        self.membership_funcs[label] = mf
    
    def fuzzify(self, value):
        """Convert crisp value to fuzzy values"""
        # Clamp value within bounds
        value = max(self.min_val, min(self.max_val, value))
        
        fuzzy_values = {}
        for label, mf in self.membership_funcs.items():
            fuzzy_values[label] = mf.membership(value)
        return fuzzy_values


class FuzzyController:
    """Fuzzy Logic Control System for Ventilation Management"""
    
    def __init__(self):
        self.create_input_variables()
        self.create_output_variable()
        self.create_rules()
    
    def create_input_variables(self):
        """Create input fuzzy variables"""
        
        # CO2 Level (ppm)
        self.co2 = FuzzyVariable("CO2", 0, 2000)
        self.co2.add_membership("Low", MembershipFunction(0, 0, 800))
        self.co2.add_membership("Medium", MembershipFunction(600, 1200, 1800))
        self.co2.add_membership("High", MembershipFunction(1000, 1500, 2000))
        
        # PM2.5 Level (µg/m³)
        self.pm25 = FuzzyVariable("PM2.5", 0, 200)
        self.pm25.add_membership("Low", MembershipFunction(0, 0, 35))
        self.pm25.add_membership("Medium", MembershipFunction(25, 55, 100))
        self.pm25.add_membership("High", MembershipFunction(75, 140, 200))
        
        # Humidity (%)
        self.humidity = FuzzyVariable("Humidity", 0, 100)
        self.humidity.add_membership("Low", MembershipFunction(0, 0, 40))
        self.humidity.add_membership("Normal", MembershipFunction(35, 55, 70))
        self.humidity.add_membership("High", MembershipFunction(65, 85, 100))
        
        # Occupancy Count (people)
        self.occupancy = FuzzyVariable("Occupancy", 0, 60)
        self.occupancy.add_membership("Low", MembershipFunction(0, 0, 15))
        self.occupancy.add_membership("Medium", MembershipFunction(10, 30, 45))
        self.occupancy.add_membership("High", MembershipFunction(35, 50, 60))
    
    def create_output_variable(self):
        """Create output fuzzy variable"""
        
        # Ventilation Level (0-100)
        self.ventilation = FuzzyVariable("VentilationLevel", 0, 100)
        self.ventilation.add_membership("Low", MembershipFunction(0, 0, 33))
        self.ventilation.add_membership("Medium", MembershipFunction(25, 50, 75))
        self.ventilation.add_membership("High", MembershipFunction(67, 100, 100))
    
    def create_rules(self):
        """Define fuzzy rules"""
        self.rules = [
            # High CO2 + High Occupancy = High Ventilation
            {
                "conditions": [("CO2", "High", "OR"), ("PM2.5", "High", "OR")],
                "output": ("VentilationLevel", "High", 1.0)
            },
            # Medium CO2 + High Humidity = Medium Ventilation
            {
                "conditions": [("CO2", "Medium", "AND"), ("Humidity", "High", "AND")],
                "output": ("VentilationLevel", "Medium", 0.8)
            },
            # Low all + Low occupancy = Low Ventilation
            {
                "conditions": [("CO2", "Low", "AND"), ("PM2.5", "Low", "AND"), 
                             ("Occupancy", "Low", "AND")],
                "output": ("VentilationLevel", "Low", 0.9)
            },
            # High Occupancy = increase ventilation
            {
                "conditions": [("Occupancy", "High", "AND")],
                "output": ("VentilationLevel", "High", 0.7)
            },
            # PM2.5 high = High ventilation
            {
                "conditions": [("PM2.5", "High", "OR")],
                "output": ("VentilationLevel", "High", 0.85)
            },
            # Default medium rule
            {
                "conditions": [("CO2", "Medium", "OR"), ("Occupancy", "Medium", "OR")],
                "output": ("VentilationLevel", "Medium", 0.6)
            }
        ]
    
    def fuzzify_inputs(self, co2, pm25, humidity, occupancy):
        """Fuzzify input values"""
        return {
            "CO2": self.co2.fuzzify(co2),
            "PM2.5": self.pm25.fuzzify(pm25),
            "Humidity": self.humidity.fuzzify(humidity),
            "Occupancy": self.occupancy.fuzzify(occupancy)
        }
    
    def check_condition(self, condition, fuzzified):
        """Check a single condition"""
        var_name, label, operator = condition
        if var_name == "CO2":
            return fuzzified["CO2"].get(label, 0)
        elif var_name == "PM2.5":
            return fuzzified["PM2.5"].get(label, 0)
        elif var_name == "Humidity":
            return fuzzified["Humidity"].get(label, 0)
        elif var_name == "Occupancy":
            return fuzzified["Occupancy"].get(label, 0)
        return 0
    
    def evaluate_rule(self, rule, fuzzified):
        """Evaluate a single rule"""
        conditions = rule["conditions"]
        
        if not conditions:
            return 0, rule["output"]
        
        # Evaluate conditions with AND/OR operators
        strength = None
        operator = "AND"
        
        for i, condition in enumerate(conditions):
            var_name, label, cond_operator = condition
            cond_strength = self.check_condition((var_name, label, None), fuzzified)
            
            if strength is None:
                strength = cond_strength
                operator = cond_operator
            else:
                if operator == "AND":
                    strength = min(strength, cond_strength)
                elif operator == "OR":
                    strength = max(strength, cond_strength)
                operator = cond_operator
        
        return strength if strength is not None else 0, rule["output"]
    
    def defuzzify(self, output_strengths):
        """Defuzzify output using centroid method"""
        if not output_strengths:
            return 50
        
        numerator = 0
        denominator = 0
        
        for strength, output_label in output_strengths:
            if output_label == "Low":
                centroid = 15
            elif output_label == "Medium":
                centroid = 50
            elif output_label == "High":
                centroid = 85
            else:
                centroid = 50
            
            numerator += strength * centroid
            denominator += strength
        
        if denominator == 0:
            return 50
        
        return numerator / denominator
    
    def get_fan_status(self, ventilation_level):
        """Convert ventilation level to fan status"""
        if ventilation_level < 25:
            return "Off"
        elif ventilation_level < 50:
            return "Low"
        elif ventilation_level < 75:
            return "Medium"
        else:
            return "High"
    
    def control(self, co2, pm25, humidity, occupancy):
        """
        Main control function
        Returns: ventilation_level, fan_status, explanation, fuzzification_info
        """
        # Fuzzify inputs
        fuzzified = self.fuzzify_inputs(co2, pm25, humidity, occupancy)
        
        # Evaluate rules
        output_strengths = []
        active_rules = []
        
        for rule in self.rules:
            strength, output = self.evaluate_rule(rule, fuzzified)
            if strength > 0.1:  # Only consider significant rules
                output_strengths.append((strength, output[1]))
                active_rules.append({
                    "strength": strength,
                    "output": output[1]
                })
        
        # Defuzzify
        if output_strengths:
            ventilation_level = self.defuzzify(output_strengths)
        else:
            # Default to medium if no rules triggered
            ventilation_level = 50
        
        # Generate fan status
        fan_status = self.get_fan_status(ventilation_level)
        
        # Generate explanation
        explanation = self._generate_explanation(co2, pm25, humidity, occupancy, 
                                                  ventilation_level, active_rules)
        
        return {
            "ventilation_level": round(ventilation_level, 2),
            "fan_status": fan_status,
            "explanation": explanation,
            "fuzzification": {
                "co2": fuzzified["CO2"],
                "pm25": fuzzified["PM2.5"],
                "humidity": fuzzified["Humidity"],
                "occupancy": fuzzified["Occupancy"]
            },
            "active_rules": [ayr for ayr in active_rules],
            "rule_count": len(active_rules)
        }
    
    def _generate_explanation(self, co2, pm25, humidity, occupancy, 
                             ventilation_level, active_rules):
        """Generate human-readable explanation"""
        reasons = []
        
        if co2 > 1200:
            reasons.append("Mức CO2 rất cao, cần thông gió mạnh")
        elif co2 > 800:
            reasons.append("Mức CO2 vượt ngưỡng, tăng thông gió")
        
        if pm25 > 75:
            reasons.append("PM2.5 nguy hiểm, kích hoạt quạt cao")
        elif pm25 > 35:
            reasons.append("PM2.5 nâng cao, tăng thông gió")
        
        if occupancy > 35:
            reasons.append("Lớp học đông, tăng thông gió")
        
        if humidity > 70:
            reasons.append("Độ ẩm cao, cần thông gió")
        elif humidity < 40:
            reasons.append("Độ ẩm thấp, giảm thông gió")
        
        if not reasons:
            reasons.append("Môi trường ổn định, giữ mức thông gió tối thiểu")
        
        return " | ".join(reasons)
