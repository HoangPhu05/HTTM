"""
Main FastAPI Application for Air Quality Monitoring System with IoT Control
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import threading
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
    "enabled": True,       # Thread vẫn chạy để cập nhật data hiển thị
    "manual_mode": False,  # True = KHÔNG gửi MQTT (user điều khiển tay)
    "interval": 5,
    "cycle_count": 0,
    "last_run": None,
    "last_error": None,
    "task": None
}


def _auto_loop_thread():
    """
    Background THREAD: reads CSV rows, runs Fuzzy Logic,
    publishes MQTT command to ESP32 every N seconds.
    Uses threading.Thread to be independent of the asyncio event loop.
    ASCII-only prints to avoid Windows CP1252 encoding errors.
    """
    import time
    global auto_loop_state
    print(f"[AutoLoop] Thread started - interval={auto_loop_state['interval']}s", flush=True)

    while True:
        time.sleep(auto_loop_state["interval"])
        try:
            # Luôn đọc data để dashboard cập nhật
            # Chỉ gửi MQTT khi KHÔNG phải manual mode
            send_mqtt = not auto_loop_state["manual_mode"]
            update_current_state(auto_control=send_mqtt)
            auto_loop_state["cycle_count"] += 1
            auto_loop_state["last_run"] = datetime.now().isoformat()
            auto_loop_state["last_error"] = None
            ctrl   = current_state.get("control_output") or {}
            level  = ctrl.get("ventilation_level", 0)
            status = ctrl.get("fan_status", "?")
            mode   = "MANUAL" if auto_loop_state["manual_mode"] else "AUTO"
            mqtt_ok = "OK" if iot_controller.is_connected() else "DISCONNECTED"
            print(
                f"[AutoLoop] #{auto_loop_state['cycle_count']} [{mode}] "
                f"-> {level:.0f}% ({status}) | MQTT={mqtt_ok}",
                flush=True
            )
        except Exception as exc:
            auto_loop_state["last_error"] = str(exc)
            print(f"[AutoLoop] Error: {exc}", flush=True)


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    global current_state, auto_loop_state
    print("Air Quality Monitoring System started", flush=True)
    # Get initial data
    update_current_state()
    # Start background thread (daemon=True so it exits when server stops)
    t = threading.Thread(target=_auto_loop_thread, daemon=True, name="AutoLoop")
    t.start()
    auto_loop_state["task"] = t
    print(f"[AutoLoop] Background thread launched (alive={t.is_alive()})", flush=True)


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
    Automatically control IoT devices based on fuzzy control output.

    Logic:
      - Fan   : speed = ventilation_level (0-100%)
      - Door  : open only when CO2 > 1000 ppm (DANGER level needs fresh air)
      - Light : on when occupancy_count > 0 (someone in room)
    """
    try:
        ventilation_level = control_output.get("ventilation_level", 0)
        data = current_state.get("current_data", {})
        co2  = data.get("co2", 0)
        occupancy = data.get("occupancy_count", 0)

        # 1. Quat: toc do = muc thong gio tu Fuzzy Logic
        iot_controller.control_fan(int(ventilation_level))

        # 2. Cua: chi mo khi CO2 vuot nguong nguy hiem (> 1000 ppm)
        #    Tang nguong de khong mo lien tuc khi luon co nhieu nguoi
        should_open_door = co2 > 1000
        iot_controller.control_door(should_open_door)

        # 3. Den phong: bat khi co nguoi trong phong
        iot_controller.control_light(occupancy > 0)

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
    """Get current data. Không gửi MQTT khi đang ở manual mode."""
    send_mqtt = not auto_loop_state["manual_mode"]
    update_current_state(auto_control=send_mqtt)
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
    """Xem trạng thái auto-loop"""
    return {
        "enabled":     auto_loop_state["enabled"],
        "manual_mode": auto_loop_state["manual_mode"],
        "interval_s":  auto_loop_state["interval"],
        "cycle_count": auto_loop_state["cycle_count"],
        "last_run":    auto_loop_state["last_run"],
        "last_error":  auto_loop_state["last_error"],
        "mqtt_connected": iot_controller.is_connected(),
    }


@app.post("/api/devices/manual-mode")
async def set_manual_mode(
    enabled: bool = Query(False, description="True = thủ công, False = tự động")
):
    """
    Bật/tắt chế độ thủ công.
    - True:  MQTT bị khóa, user điều khiển bằng tay
    - False: Fuzzy Logic tự gửi lệnh mỗi 5s
    """
    auto_loop_state["manual_mode"] = enabled
    mode = "MANUAL" if enabled else "AUTO"
    print(f"[Mode] Switched to {mode}", flush=True)
    return {
        "status": "ok",
        "manual_mode": enabled,
        "mode": mode,
    }


@app.post("/api/devices/auto-loop")
async def set_auto_loop(
    enabled: bool = Query(True, description="Bật/tắt auto-loop thread"),
    interval: int = Query(5, ge=1, le=60, description="Giây giữa mỗi vòng lặp")
):
    """Điều chỉnh tốc độ auto-loop (không liên quan đến manual mode)"""
    auto_loop_state["enabled"]  = enabled
    auto_loop_state["interval"] = interval
    return {
        "status": "ok",
        "enabled":    enabled,
        "interval_s": interval,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
