"""
Test suite for Alert Checker
"""
import sys
sys.path.insert(0, '/app/backend')

from utils.alert_checker import AlertChecker


def test_alert_checker_initialization():
    """Test that AlertChecker initializes correctly"""
    checker = AlertChecker()
    assert checker is not None


def test_normal_conditions():
    """Test that no alerts are generated for normal conditions"""
    checker = AlertChecker()
    record = {
        'Temperature': 22,
        'Humidity': 50,
        'CO2': 600,
        'PM2.5': 35,
        'PM10': 50,
        'TVOC': 200,
        'CO': 5,
        'Occupancy_Count': 20
    }
    
    alerts = checker.generate_alerts(record)
    assert len(alerts) == 0


def test_high_co2_alert():
    """Test that high CO2 generates warning alert"""
    checker = AlertChecker()
    record = {
        'Temperature': 22,
        'Humidity': 50,
        'CO2': 1200,  # Warning level
        'PM2.5': 35,
        'PM10': 50,
        'TVOC': 200,
        'CO': 5,
        'Occupancy_Count': 20
    }
    
    alerts = checker.generate_alerts(record)
    assert len(alerts) > 0
    assert any('CO2' in alert['parameter'] for alert in alerts)


def test_dangerous_conditions():
    """Test that dangerous conditions generate danger alerts"""
    checker = AlertChecker()
    record = {
        'Temperature': 35,  # Danger
        'Humidity': 80,     # Danger
        'CO2': 1800,        # Danger
        'PM2.5': 180,       # Danger
        'PM10': 300,        # Danger
        'TVOC': 5000,       # Danger
        'CO': 50,           # Danger
        'Occupancy_Count': 60
    }
    
    alerts = checker.generate_alerts(record)
    assert len(alerts) > 5
    assert any(alert['level'] == 'danger' for alert in alerts)


def test_status_colors():
    """Test that status colors are correct"""
    checker = AlertChecker()
    
    # Normal
    color = checker.get_status_color('CO2', 600)
    assert color == 'green'
    
    # Warning
    color = checker.get_status_color('CO2', 1200)
    assert color == 'yellow'
    
    # Danger
    color = checker.get_status_color('CO2', 1800)
    assert color == 'red'


if __name__ == "__main__":
    test_alert_checker_initialization()
    print("✅ Initialization test passed")
    
    test_normal_conditions()
    print("✅ Normal conditions test passed")
    
    test_high_co2_alert()
    print("✅ High CO2 alert test passed")
    
    test_dangerous_conditions()
    print("✅ Dangerous conditions test passed")
    
    test_status_colors()
    print("✅ Status colors test passed")
    
    print("\n✅ All alert checker tests passed!")
