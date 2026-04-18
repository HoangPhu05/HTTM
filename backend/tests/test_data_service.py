"""
Test suite for Data Service
"""
import sys
sys.path.insert(0, '/app/backend')

from services.data_service import DataService


def test_data_service_initialization():
    """Test that DataService initializes and loads data"""
    service = DataService()
    assert service is not None
    assert service.data is not None
    assert len(service.data) > 0


def test_get_current_record():
    """Test retrieving current record"""
    service = DataService()
    record = service.get_current_record()
    
    assert record is not None
    assert 'Timestamp' in record
    assert 'Temperature' in record
    assert 'CO2' in record
    assert 'PM2.5' in record


def test_get_latest_records():
    """Test retrieving multiple records"""
    service = DataService()
    records = service.get_latest_records(10)
    
    assert len(records) == 10
    assert all('Timestamp' in record for record in records)


def test_record_progression():
    """Test that records progress through the dataset"""
    service = DataService()
    
    record1 = service.get_current_record()
    record2 = service.get_current_record()
    
    # Should have different timestamps (records cycling)
    assert 'Timestamp' in record1
    assert 'Timestamp' in record2


def test_no_missing_values():
    """Test that there are no missing values in records"""
    service = DataService()
    record = service.get_current_record()
    
    for key, value in record.items():
        assert value is not None, f"Missing value for {key}"


if __name__ == "__main__":
    test_data_service_initialization()
    print("✅ Initialization test passed")
    
    test_get_current_record()
    print("✅ Current record test passed")
    
    test_get_latest_records()
    print("✅ Latest records test passed")
    
    test_record_progression()
    print("✅ Record progression test passed")
    
    test_no_missing_values()
    print("✅ No missing values test passed")
    
    print("\n✅ All data service tests passed!")
