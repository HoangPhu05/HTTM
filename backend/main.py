"""
Main FastAPI Application for Air Quality Monitoring System with IoT Control
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.data_service import DataService
from fuzzy.fuzzy_controller import FuzzyController
from utils.alert_checker import AlertChecker
from utils.iot_controller import get_iot_controller

# Initialize FastAPI app
app = FastAPI(
    title="Air Quality Monitoring System",
    description="Real-time air quality monitoring with Fuzzy Logic Control",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
csv_path = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
data_service = DataService(csv_path)
fuzzy_controller = FuzzyController()

# Initialize IoT Controller (MQTT)
# Configure with your MQTT broker address and port
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
iot_controller = get_iot_controller(MQTT_BROKER, MQTT_PORT)

# Store current state
current_state = {
    "current_data": None,
    "control_output": None,
    "alerts": [],
    "device_states": {},
    "last_update": None
}

# Auto-loop state
auto_loop_state = {
    "enabled": True,    # Tự động bật khi khởi động
    "interval": 5,      # Giây giữa mỗi lần publish
    "cycle_count": 0,   # Số lần đã chạy
    "last_run": None,
    "task": None        # asyncio.Task reference
}


async def _auto_loop_task():
    """
    Background task: đọc từng dòng CSV, chạy Fuzzy Logic,
    publish MQTT command đến ESP32 mỗi N giây.
    """
    global auto_loop_state
    print(f"[AutoLoop] Bắt đầu — interval={auto_loop_state['interval']}s")

    while True:
        try:
            if auto_loop_state["enabled"]:
                update_current_state(auto_control=True)
                auto_loop_state["cycle_count"] += 1
                auto_loop_state["last_run"] = datetime.now().isoformat()
                ctrl = current_state.get("control_output") or {}
                level = ctrl.get("ventilation_level", 0)
                status = ctrl.get("fan_status", "?")
                print(
                    f"[AutoLoop] #{auto_loop_state['cycle_count']} "
                    f"→ {level:.0f}% ({status}) "
                    f"| MQTT: {'✓' if iot_controller.is_connected() else '✗'}"
                )
        except Exception as exc:
            print(f"[AutoLoop] Lỗi: {exc}")

        await asyncio.sleep(auto_loop_state["interval"])


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    global current_state, auto_loop_state
    print("Air Quality Monitoring System started")
    # Get initial data
    update_current_state()
    # Start background loop
    task = asyncio.create_task(_auto_loop_task())
    auto_loop_state["task"] = task


def update_current_state(auto_control: bool = False):
    """
    Update current system state
    
    Args:
        auto_control: If True, automatically control devices based on fuzzy output
    """
    global current_state
    
    # Get current data
    data = data_service.get_current_record()
    current_state["current_data"] = data
    
    # Run fuzzy control
    control = fuzzy_controller.control(
        data["co2"],
        data["pm25"],
        data["humidity"],
        data["occupancy_count"]
    )
    current_state["control_output"] = control
    
    # Check alerts
    alerts = AlertChecker.generate_alerts(data)
    current_state["alerts"] = alerts
    
    # Auto-control devices based on fuzzy output (only if enabled)
    if auto_control:
        auto_control_devices(control)
    
    # Update device states
    current_state["device_states"] = iot_controller.get_device_states()
    current_state["last_update"] = datetime.now().isoformat()


def auto_control_devices(control_output: dict):
    """
    Automatically control IoT devices based on fuzzy control output
    
    Args:
        control_output: Output from fuzzy controller containing ventilation_level
    """
    try:
        ventilation_level = control_output.get("ventilation_level", 0)
        
        # Convert ventilation level (0-100) to fan speed
        fan_speed = int(ventilation_level)
        
        # Control fan
        if fan_speed > 0:
            iot_controller.control_fan(fan_speed)
        else:
            iot_controller.control_fan(0)
        
        # Open/close door based on ventilation need
        # Open if ventilation level > 60 (High)
        should_open = ventilation_level > 60
        iot_controller.control_door(should_open)
        
        # Turn on light if occupancy > 0 and quality is poor
        # (This would be based on actual occupancy and air quality)
        
    except Exception as e:
        print(f"Error controlling devices: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Air Quality Monitoring System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/current-data")
async def get_current_data():
    """Get current environmental data with auto-control enabled"""
    update_current_state(auto_control=True)
    return {
        "data": current_state["current_data"],
        "control": current_state["control_output"],
        "alerts": current_state["alerts"],
        "timestamp": current_state["last_update"]
    }


@app.get("/api/data-history/{count}")
async def get_data_history(count: int = 20):
    """Get historical data"""
    records = data_service.get_latest_records(count)
    return {
        "records": records,
        "count": len(records)
    }


@app.get("/api/all-data")
async def get_all_data(skip: int = 0, limit: int = 1000):
    """Get all historical data with pagination"""
    all_records = data_service.get_all_records()
    total = len(all_records)
    
    # Apply pagination
    paginated_records = all_records[skip:skip + limit]
    
    return {
        "records": paginated_records,
        "total": total,
        "skip": skip,
        "limit": limit,
        "returned": len(paginated_records)
    }


@app.get("/api/alerts")
async def get_alerts():
    """Get current alerts"""
    update_current_state()
    if not current_state["alerts"]:
        return {
            "alerts": [],
            "message": "Môi trường đang ổn định",
            "status": "normal"
        }
    return {
        "alerts": current_state["alerts"],
        "total": len(current_state["alerts"]),
        "status": "warning"
    }


@app.get("/api/control-output")
async def get_control_output():
    """Get fuzzy control output"""
    update_current_state()
    control = current_state["control_output"]
    
    return {
        "ventilation_level": control["ventilation_level"],
        "fan_status": control["fan_status"],
        "explanation": control["explanation"],
        "fuzzification": control["fuzzification"],
        "active_rules": control["active_rules"],
        "rule_count": control["rule_count"]
    }


@app.post("/api/fuzzy-control")
async def fuzzy_control(
    co2: float = 800,
    pm25: float = 30,
    humidity: float = 55,
    occupancy: int = 20,
    apply_control: bool = Query(False, description="If True, apply control to devices")
):
    """
    Run fuzzy control with custom parameters
    
    Args:
        apply_control: If True, automatically control devices based on result
    """
    control = fuzzy_controller.control(co2, pm25, humidity, occupancy)
    
    # Optional: Apply control to devices
    if apply_control:
        auto_control_devices(control)
    
    return {
        "input": {
            "co2": co2,
            "pm25": pm25,
            "humidity": humidity,
            "occupancy": occupancy
        },
        "output": {
            "ventilation_level": control["ventilation_level"],
            "fan_status": control["fan_status"],
            "explanation": control["explanation"]
        },
        "fuzzification": control["fuzzification"],
        "active_rules": control["active_rules"],
        "applied_to_devices": apply_control,
        "device_states": iot_controller.get_device_states() if apply_control else None
    }


@app.get("/api/system-info")
async def get_system_info():
    """Get system information"""
    return {
        "name": "Hệ thống giám sát chất lượng không khí trong phòng học",
        "version": "1.0.0",
        "description": "Điều khiển thiết bị thông gió bằng Fuzzy Logic Control",
        "features": [
            "Giám sát chỉ số môi trường theo thời gian thực",
            "Cảnh báo khi vượt ngưỡng",
            "Điều khiển quạt thông gió tự động",
            "Hiển thị dashboard trực quan",
            "Hỗ trợ dữ liệu mô phỏng từ CSV"
        ],
        "parameters": [
            "Nhiệt độ (°C)",
            "Độ ẩm (%)",
            "CO2 (ppm)",
            "PM2.5 (µg/m³)",
            "PM10 (µg/m³)",
            "TVOC (ppb)",
            "CO (ppm)",
            "Lượng người viên"
        ]
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


# ==================== IoT DEVICE CONTROL ENDPOINTS ====================

@app.get("/api/devices/status")
async def get_devices_status():
    """Get current status of all IoT devices"""
    return {
        "mqtt_connected": iot_controller.is_connected(),
        "devices": iot_controller.get_device_states(),
        "mqtt_broker": MQTT_BROKER,
        "mqtt_port": MQTT_PORT
    }


@app.post("/api/devices/fan/control")
async def control_fan(speed: int = Query(0, ge=0, le=100)):
    """
    Control fan speed (0-100)
    
    Args:
        speed: Fan speed from 0 (off) to 100 (max)
    """
    success = iot_controller.control_fan(speed)
    return {
        "device": "fan",
        "command": f"set_speed:{speed}",
        "success": success,
        "mqtt_connected": iot_controller.is_connected(),
        "fan_speed": speed if success else 0
    }


@app.post("/api/devices/door/control")
async def control_door(open: bool = Query(False)):
    """
    Control door lock
    
    Args:
        open: True to open, False to close/lock
    """
    success = iot_controller.control_door(open)
    return {
        "device": "door",
        "command": "open" if open else "close",
        "success": success,
        "mqtt_connected": iot_controller.is_connected(),
        "door_open": open if success else False
    }


@app.post("/api/devices/light/control")
async def control_light(on: bool = Query(False)):
    """
    Control light
    
    Args:
        on: True to turn on, False to turn off
    """
    success = iot_controller.control_light(on)
    return {
        "device": "light",
        "command": "on" if on else "off",
        "success": success,
        "mqtt_connected": iot_controller.is_connected(),
        "light_on": on if success else False
    }


@app.post("/api/devices/auto-control")
async def activate_auto_control():
    """
    Activate automatic device control based on air quality
    This uses fuzzy logic to automatically control ventilation
    """
    try:
        update_current_state()
        control_output = current_state.get("control_output")
        
        if control_output:
            return {
                "status": "activated",
                "message": "Automatic control activated based on current air quality",
                "ventilation_level": control_output.get("ventilation_level"),
                "fan_status": control_output.get("fan_status"),
                "explanation": control_output.get("explanation"),
                "mqtt_connected": iot_controller.is_connected(),
                "device_states": iot_controller.get_device_states()
            }
        else:
            return {
                "status": "error",
                "message": "Could not get control output",
                "mqtt_connected": iot_controller.is_connected()
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "mqtt_connected": iot_controller.is_connected()
        }


@app.get("/api/devices/mqtt-info")
async def get_mqtt_info():
    """Get MQTT connection information"""
    return {
        "broker": MQTT_BROKER,
        "port": MQTT_PORT,
        "connected": iot_controller.is_connected(),
        "topics": {
            "fan": "devices/control/fan/command",
            "door": "devices/control/door/command",
            "light": "devices/control/light/command",
            "status": "devices/status/#"
        },
        "guide": {
            "description": "Sử dụng MQTT để điều khiển thiết bị IoT",
            "setup": [
                "1. Cài đặt MQTT Broker (Mosquitto)",
                "2. Cấu hình địa chỉ broker trong .env",
                "3. Kết nối thiết bị IoT vào các topic tương ứng",
                "4. Sử dụng các endpoint này để gửi lệnh"
            ]
        }
    }


@app.get("/api/devices/auto-loop")
async def get_auto_loop_status():
    """Xem trạng thái auto-loop (tự động publish MQTT)"""
    return {
        "enabled":     auto_loop_state["enabled"],
        "interval_s":  auto_loop_state["interval"],
        "cycle_count": auto_loop_state["cycle_count"],
        "last_run":    auto_loop_state["last_run"],
        "mqtt_connected": iot_controller.is_connected(),
    }


@app.post("/api/devices/auto-loop")
async def set_auto_loop(
    enabled: bool = Query(True, description="Bật/tắt auto-loop"),
    interval: int = Query(5, ge=1, le=60, description="Giây giữa mỗi vòng lặp (1-60)")
):
    """Bật/tắt hoặc thay đổi tốc độ auto-loop"""
    auto_loop_state["enabled"]  = enabled
    auto_loop_state["interval"] = interval
    return {
        "status": "ok",
        "enabled":    enabled,
        "interval_s": interval,
        "message": f"Auto-loop {'BẬT' if enabled else 'TẮT'}, interval={interval}s"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
