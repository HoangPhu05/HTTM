"""
Test suite for Fuzzy Controller
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fuzzy.fuzzy_controller import FuzzyController


def test_fuzzy_controller_initialization():
    """Test that FuzzyController initializes correctly"""
    controller = FuzzyController()
    assert controller is not None
    assert controller.co2 is not None
    assert controller.pm25 is not None


def test_fuzzy_control_normal_conditions():
    """Test fuzzy control with normal air quality conditions"""
    controller = FuzzyController()

    result = controller.control(
        co2=600,
        pm25=35,
        humidity=55,
        occupancy=20
    )

    assert 'ventilation_level' in result
    assert 'fan_status' in result
    assert 0 <= result['ventilation_level'] <= 100


def test_fuzzy_control_high_co2():
    """Test fuzzy control with high CO2 levels"""
    controller = FuzzyController()

    result = controller.control(
        co2=1500,
        pm25=35,
        humidity=55,
        occupancy=40
    )

    assert result['ventilation_level'] > 30


def test_fuzzy_control_high_pm25():
    """Test fuzzy control with high PM2.5 levels"""
    controller = FuzzyController()

    result = controller.control(
        co2=600,
        pm25=150,
        humidity=55,
        occupancy=20
    )

    assert result['ventilation_level'] > 30


def test_fuzzy_control_extreme_conditions():
    """Test fuzzy control with extreme conditions"""
    controller = FuzzyController()

    result = controller.control(
        co2=1900,
        pm25=200,
        humidity=25,
        occupancy=60
    )

    assert result['ventilation_level'] >= 70


if __name__ == "__main__":
    test_fuzzy_controller_initialization()
    print("✅ Initialization test passed")

    test_fuzzy_control_normal_conditions()
    print("✅ Normal conditions test passed")

    test_fuzzy_control_high_co2()
    print("✅ High CO2 test passed")

    test_fuzzy_control_high_pm25()
    print("✅ High PM2.5 test passed")

    test_fuzzy_control_extreme_conditions()
    print("✅ Extreme conditions test passed")

    print("\n✅ All tests passed!")
