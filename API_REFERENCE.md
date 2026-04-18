# API Endpoints Reference

## Base URL
- **Development:** `http://localhost:8000`
- **Production:** `https://yourdomain.com`

## Authentication
Currently no authentication required. (Can be added in future versions)

---

## Health & Status Endpoints

### Get System Health
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45Z",
  "version": "1.0.0"
}
```

### Get System Info
```
GET /api/system-info
```
**Response:**
```json
{
  "name": "Air Quality Monitoring System",
  "version": "1.0.0",
  "description": "Real-time classroom air quality monitoring with fuzzy logic control",
  "dataPoints": 1000,
  "parameterMonitored": 8
}
```

---

## Data Endpoints

### Get Current Data
```
GET /api/current-data
```
**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:45Z",
  "temperature": 22.5,
  "humidity": 55,
  "co2": 650,
  "pm25": 35,
  "pm10": 50,
  "tvoc": 200,
  "co": 5,
  "occupancy_count": 20,
  "ventilation_level": 45,
  "fan_status": "medium",
  "alerts": []
}
```

### Get Historical Data
```
GET /api/data/history?limit=100
```
**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100)

**Response:**
```json
{
  "records": [
    {
      "Timestamp": "2024-01-15T10:30:00Z",
      "Temperature": 22.5,
      "Humidity": 55,
      "CO2": 650,
      "PM2.5": 35,
      "PM10": 50,
      "TVOC": 200,
      "CO": 5,
      "Occupancy_Count": 20
    }
  ],
  "count": 100
}
```

### Get Latest Records for Chart
```
GET /api/data/latest?count=50
```
**Query Parameters:**
- `count` (optional): Number of records to return (default: 50)

**Response:**
```json
{
  "records": [...],
  "count": 50
}
```

---

## Fuzzy Logic Control Endpoints

### Get Fuzzy Control Output
```
GET /api/control-output
```
**Response:**
```json
{
  "ventilation_level": 65,
  "fan_status": "high",
  "explanation": "High CO2 and occupancy require increased ventilation",
  "fuzzification": {
    "co2": {
      "low": 0.0,
      "medium": 0.3,
      "high": 0.8
    },
    "pm25": {
      "low": 0.5,
      "medium": 0.3,
      "high": 0.0
    }
  },
  "applied_rules": [
    "IF CO2 is HIGH THEN Fan should be HIGH"
  ]
}
```

### Fuzzy Control Calculation
```
POST /api/fuzzy-control
```
**Request Body:**
```json
{
  "co2": 1200,
  "pm25": 45,
  "humidity": 60,
  "occupancy": 35
}
```

**Response:**
```json
{
  "ventilation_level": 75,
  "fan_status": "high",
  "explanation": "Elevated CO2 and particle levels require increased ventilation",
  "fuzzification": {
    "co2": {"low": 0.0, "medium": 0.4, "high": 0.7},
    "pm25": {"low": 0.3, "medium": 0.6, "high": 0.1},
    "humidity": {"low": 0.0, "medium": 0.8, "high": 0.1},
    "occupancy": {"low": 0.0, "medium": 0.4, "high": 0.6}
  }
}
```

---

## Alert Endpoints

### Get Current Alerts
```
GET /api/alerts
```
**Response:**
```json
{
  "alerts": [
    {
      "parameter": "CO2",
      "value": 1200,
      "level": "warning",
      "message": "CO2 concentration is high (>1000 ppm)",
      "normalRange": [0, 1000]
    }
  ],
  "count": 1,
  "hasAlerts": true
}
```

### Get Alert Summary
```
GET /api/alerts/summary
```
**Response:**
```json
{
  "total": 3,
  "danger": 1,
  "warning": 2,
  "normal": 5,
  "hasAlerts": true
}
```

### Get Threshold Info
```
GET /api/thresholds
```
**Response:**
```json
{
  "thresholds": {
    "CO2": {
      "parameter": "CO2",
      "unit": "ppm",
      "normal": [0, 1000],
      "warning": [1000, 1500],
      "danger": [1500, 2000]
    },
    "PM2.5": {
      "parameter": "PM2.5",
      "unit": "µg/m³",
      "normal": [0, 75],
      "warning": [75, 150],
      "danger": [150, 200]
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid parameters provided"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred"
}
```

---

## Rate Limiting
- Currently no rate limiting implemented
- Frontend polls every 5-10 seconds
- Recommended to avoid more than 1 request per second

---

## CORS Policy
All endpoints allow cross-origin requests from:
- `http://localhost:5173` (Development)
- `http://localhost:3000` (Alternative frontend)
- Add more origins in `backend/main.py`

---

## Testing API Endpoints

### Using cURL
```bash
# Get current data
curl http://localhost:8000/api/current-data

# Get alerts
curl http://localhost:8000/api/alerts

# Test fuzzy control
curl -X POST http://localhost:8000/api/fuzzy-control \
  -H "Content-Type: application/json" \
  -d '{"co2": 1200, "pm25": 45, "humidity": 60, "occupancy": 35}'
```

### Using Swagger UI
Visit: `http://localhost:8000/docs`

### Using Python requests
```python
import requests

# Get current data
response = requests.get('http://localhost:8000/api/current-data')
print(response.json())

# Test fuzzy control
response = requests.post('http://localhost:8000/api/fuzzy-control',
  json={"co2": 1200, "pm25": 45, "humidity": 60, "occupancy": 35})
print(response.json())
```

---

## WebSocket Endpoints (Future)
- Real-time data streaming: `ws://localhost:8000/ws/data`
- Real-time alerts: `ws://localhost:8000/ws/alerts`
- (Not implemented in v1.0)
