# 🏠 Hướng dẫn Kết nối Thiết bị IoT với MQTT

## 📋 Nội dung

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt MQTT Broker](#cài-đặt-mqtt-broker)
3. [Cấu hình Backend](#cấu-hình-backend)
4. [Kết nối Thiết bị IoT](#kết-nối-thiết-bị-iot)
5. [Test và Debug](#test-và-debug)

---

## 🔧 Yêu cầu hệ thống

- MQTT Broker (Mosquitto hoặc tương đương)
- Python 3.9+ với paho-mqtt
- Thiết bị IoT hỗ trợ MQTT (Arduino, ESP32, Raspberry Pi, etc)

---

## 📦 Cài đặt MQTT Broker

### Cách 1: Windows (Mosquitto)

#### Download và cài đặt
```bash
# Tải từ: https://mosquitto.org/download/
# Hoặc dùng chocolatey
choco install mosquitto
```

#### Khởi động broker
```bash
# Mặc định, Mosquitto chạy trên localhost:1883
net start mosquitto
# hoặc
mosquitto -v
```

#### Kiểm tra kết nối
```bash
mosquitto_sub -h localhost -t "devices/#"
```

---

### Cách 2: Docker

```bash
docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto
```

---

### Cách 3: Linux/Mac

```bash
# Linux
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto

# Mac
brew install mosquitto
brew services start mosquitto
```

---

## ⚙️ Cấu hình Backend

### Step 1: Cập nhật Requirements

```bash
cd backend
pip install paho-mqtt
# hoặc
pip install -r requirements.txt
```

### Step 2: Cấu hình Broker Address

Tạo file `.env` trong thư mục `backend/`:

```bash
MQTT_BROKER=localhost
MQTT_PORT=1883
```

Nếu dùng broker từ máy khác:
```bash
MQTT_BROKER=192.168.1.100
MQTT_PORT=1883
```

### Step 3: Khởi động Backend

```bash
cd backend
python main.py
```

Bạn sẽ thấy:
```
Air Quality Monitoring System started
MQTT Client initialized for localhost:1883
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 📱 Kết nối Thiết bị IoT

### MQTT Topics

Ứng dụng sử dụng các topic sau:

**Nhận lệnh từ Backend:**
- `devices/control/fan/command` - Điều khiển quạt
- `devices/control/door/command` - Điều khiển cửa
- `devices/control/light/command` - Điều khiển đèn

**Gửi trạng thái lên Backend:**
- `devices/status/fan` - Trạng thái quạt
- `devices/status/door` - Trạng thái cửa
- `devices/status/light` - Trạng thái đèn

---

### Ví dụ: Kết nối Arduino/ESP32

#### Arduino Code (Quạt)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// MQTT Broker
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Fan pin
const int FAN_PIN = 5;
const int FAN_PWM_CHANNEL = 0;

void setup_wifi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Xử lý lệnh từ MQTT
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  Serial.println(message);
  
  // Xử lý lệnh quạt
  if (String(topic) == "devices/control/fan/command") {
    // Parse JSON: {"command": "set_speed", "value": 75}
    int speed = parseSpeed(message);
    ledcWrite(FAN_PWM_CHANNEL, speed * 2.55);
    
    Serial.print("Fan speed set to: ");
    Serial.println(speed);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT");
      client.subscribe("devices/control/fan/command");
      client.subscribe("devices/control/door/command");
      client.subscribe("devices/control/light/command");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Setup PWM
  ledcSetup(FAN_PWM_CHANNEL, 5000, 8);
  ledcAttachPin(FAN_PIN, FAN_PWM_CHANNEL);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

int parseSpeed(String message) {
  // Đơn giản: extract số từ JSON
  int startIdx = message.indexOf("value") + 8;
  int endIdx = message.indexOf("}", startIdx);
  return message.substring(startIdx, endIdx).toInt();
}
```

---

### Ví dụ: Kết nối Python Client

```python
import paho.mqtt.client as mqtt
import json
import time

# Cấu hình MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker")
        client.subscribe("devices/control/#")
    else:
        print(f"Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"Received message on {msg.topic}: {msg.payload.decode()}")
    
    # Xử lý lệnh quạt
    if msg.topic == "devices/control/fan/command":
        data = json.loads(msg.payload.decode())
        speed = data.get("value", 0)
        print(f"Setting fan speed to {speed}%")
        # Điều khiển thiết bị thật ở đây
        control_fan(speed)

def control_fan(speed):
    # To: GPIO control, relay, PWM, etc
    print(f"Fan running at {speed}%")

client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()
```

---

## 🧪 Test và Debug

### Từ Browser (Frontend)

1. Mở http://localhost:5173
2. Đi tới Dashboard
3. Scroll xuống phần "🏠 Điều khiển Thiết bị IoT"
4. Nhấn nút "Chạy Quạt" hoặc điều chỉnh slider

### Từ Command Line

#### Subscribe các topic để xem lệnh

```bash
mosquitto_sub -h localhost -t "devices/#" -v
```

#### Publish test command

```bash
mosquitto_pub -h localhost -t "devices/control/fan/command" -m '{"device":"fan","command":"set_speed","value":50}'
```

### Từ API (cURL)

```bash
# Điều khiển quạt
curl -X POST "http://localhost:8000/api/devices/fan/control?speed=75"

# Mở cửa
curl -X POST "http://localhost:8000/api/devices/door/control?open=true"

# Bật đèn
curl -X POST "http://localhost:8000/api/devices/light/control?on=true"

# Xem trạng thái
curl http://localhost:8000/api/devices/status

# Xem thông tin MQTT
curl http://localhost:8000/api/devices/mqtt-info
```

---

## 🐛 Troubleshooting

### Problem: MQTT not connected

```
⚠️ Chưa kết nối MQTT
```

**Giải pháp:**
1. Kiểm tra MQTT broker chạy
   ```bash
   netstat -an | grep 1883  # Linux/Mac
   netstat -ano | findstr 1883  # Windows
   ```

2. Kiểm tra firewall
   ```bash
   # Windows
   netsh advfirewall firewall add rule name="MQTT" dir=in action=allow protocol=tcp localport=1883
   ```

3. Cấu hình broker address trong `.env`
   ```bash
   MQTT_BROKER=192.168.1.100  # IP chính xác của broker
   ```

### Problem: Device không nhận lệnh

- Kiểm tra device subscribe đúng topic
- Kiểm tra JSON format đúng
- Monitor topic: `mosquitto_sub -h localhost -t "devices/control/fan/command"`

### Problem: Port 1883 bị sử dụng

```bash
# Windows
netstat -ano | findstr 1883
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :1883
kill -9 <PID>
```

---

## 📚 Tài liệu Thêm

- [Mosquitto Docs](https://mosquitto.org/)
- [PahoMQTT Python](https://github.com/eclipse/paho.mqtt.python)
- [MQTT Protocol](https://mqtt.org/)
- [Arduino MQTT](https://create.arduino.cc/cloud/things)

---

## 💡 Tips

- Dùng MQTT Explorer GUI để debug: https://mqtt-explorer.com/
- Lưu log device để debug: `client.setDefaultMessageCallback()`
- Test với delay nhỏ trước: `time.sleep(0.1)`
- Dùng QoS=1 cho lệnh quan trọng

---

**Chúc bạn thành công! 🚀**
