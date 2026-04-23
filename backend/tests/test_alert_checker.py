"""
Test suite for Alert Checker
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.alert_checker import AlertChecker


def test_normal_conditions():
    """Test that no alerts are generated for normal conditions"""
    record = {
        'temperature': 22,
        'humidity': 50,
        'co2': 600,
        'pm25': 20,
        'pm10': 40,
        'tvoc': 150,
        'co': 2,
    }

    alerts = AlertChecker.generate_alerts(record)
    assert len(alerts) == 0


def test_high_co2_alert():
    """Test that high CO2 generates warning alert"""
    record = {
        'temperature': 22,
        'humidity': 50,
        'co2': 1000,
        'pm25': 20,
        'pm10': 40,
        'tvoc': 150,
        'co': 2,
    }

    alerts = AlertChecker.generate_alerts(record)
    assert len(alerts) > 0
    assert any('CO2' in alert['parameter'] for alert in alerts)


def test_dangerous_conditions():
    """Test that dangerous conditions generate danger alerts"""
    record = {
        'temperature': 35,
        'humidity': 85,
        'co2': 1800,
        'pm25': 180,
        'pm10': 300,
        'tvoc': 5000,
        'co': 50,
    }

    alerts = AlertChecker.generate_alerts(record)
    assert len(alerts) > 5
    assert any(alert['status'] == 'danger' for alert in alerts)


def test_status_colors():
    """Test that status colors are correct"""
    # Normal CO2
    color = AlertChecker.get_status_color(600, 'co2')
    assert color == 'green'

    # Warning CO2
    color = AlertChecker.get_status_color(1000, 'co2')
    assert color == 'yellow'

    # Danger CO2
    color = AlertChecker.get_status_color(1800, 'co2')
    assert color == 'red'

    # Normal temperature should not be yellow
    color = AlertChecker.get_status_color(22, 'temperature')
    assert color == 'green'


if __name__ == "__main__":
    test_normal_conditions()
    print("✅ Normal conditions test passed")

    test_high_co2_alert()
    print("✅ High CO2 alert test passed")

    test_dangerous_conditions()
    print("✅ Dangerous conditions test passed")

    test_status_colors()
    print("✅ Status colors test passed")

    print("\n✅ All alert checker tests passed!")
