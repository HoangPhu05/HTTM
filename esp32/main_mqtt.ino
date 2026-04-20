// ============================================================
// MAIN MQTT - Hệ thống IoT Giám sát Chất lượng Không khí
// ------------------------------------------------------------
// ESP32 kết nối WiFi + MQTT Broker, nhận lệnh từ Backend
// (Fuzzy Logic Control) và điều khiển 3 đèn LED:
//
//   GPIO 25 = LED Xanh  → Thông gió Thấp   (0 – 33%)
//   GPIO 26 = LED Vàng  → Thông gió Trung  (34 – 66%)
//   GPIO 27 = LED Đỏ   → Thông gió Cao    (67 – 100%)
//
// Libraries cần cài (Arduino Library Manager):
//   - PubSubClient  by Nick O'Leary  (MQTT)
//   - ArduinoJson   by Benoit Blanchon (JSON parsing)
// ============================================================

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ─── CẤU HÌNH WiFi ────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";      // ← đổi thành tên WiFi của bạn
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";  // ← đổi thành mật khẩu WiFi

// ─── CẤU HÌNH MQTT ────────────────────────────────────────
const char* MQTT_BROKER   = "10.20.149.125";       // IP PC chạy Mosquitto
const int   MQTT_PORT     = 1883;
const char* CLIENT_ID     = "ESP32_AirQuality";

// ─── MQTT TOPICS ──────────────────────────────────────────
// Subscribe (nhận lệnh từ backend)
const char* TOPIC_FAN_CMD   = "devices/control/fan/command";
const char* TOPIC_DOOR_CMD  = "devices/control/door/command";
const char* TOPIC_LIGHT_CMD = "devices/control/light/command";

// Publish (gửi trạng thái về backend)
const char* TOPIC_FAN_STATUS   = "devices/status/fan";
const char* TOPIC_DOOR_STATUS  = "devices/status/door";
const char* TOPIC_LIGHT_STATUS = "devices/status/light";

// ─── CHÂN GPIO ────────────────────────────────────────────
#define LED_GREEN  25   // Thông gió Thấp
#define LED_YELLOW 26   // Thông gió Trung bình
#define LED_RED    27   // Thông gió Cao

// ─── BIẾN TRẠNG THÁI ──────────────────────────────────────
int   currentFanSpeed  = 0;       // 0–100
bool  doorOpen         = false;
bool  lightOn          = false;
unsigned long lastReconnectAttempt = 0;

WiFiClient   espClient;
PubSubClient mqtt(espClient);

// ============================================================
// HÀM TIỆN ÍCH: Serial log với prefix
// ============================================================
void log(const String& msg) {
  Serial.println("[IoT] " + msg);
}

// ============================================================
// ĐIỀU KHIỂN ĐÈN LED theo mức thông gió
//   0       → Tắt hết
//   1–33    → LED Xanh  (Low)
//   34–66   → LED Vàng  (Medium)
//   67–100  → LED Đỏ    (High)
// ============================================================
void setVentilationLED(int speed) {
  // Tắt hết trước
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);

  if (speed <= 0) {
    log("Quạt OFF — tất cả LED tắt");
  } else if (speed <= 33) {
    digitalWrite(LED_GREEN, HIGH);
    log("Thông gió THẤP  (" + String(speed) + "%) → LED XANH");
  } else if (speed <= 66) {
    digitalWrite(LED_YELLOW, HIGH);
    log("Thông gió TRUNG (" + String(speed) + "%) → LED VÀNG");
  } else {
    digitalWrite(LED_RED, HIGH);
    log("Thông gió CAO   (" + String(speed) + "%) → LED ĐỎ");
  }
}

// ============================================================
// PUBLISH trạng thái quạt về broker
// ============================================================
void publishFanStatus(int speed) {
  StaticJsonDocument<128> doc;
  doc["device"]  = "fan";
  doc["speed"]   = speed;
  doc["running"] = (speed > 0);
  doc["level"]   = (speed <= 0)  ? "off"    :
                   (speed <= 33) ? "low"    :
                   (speed <= 66) ? "medium" : "high";

  char buf[128];
  serializeJson(doc, buf);
  mqtt.publish(TOPIC_FAN_STATUS, buf, true);  // retain = true
  log("Published fan status: " + String(buf));
}

void publishDoorStatus(bool open) {
  StaticJsonDocument<64> doc;
  doc["device"] = "door";
  doc["open"]   = open;
  char buf[64];
  serializeJson(doc, buf);
  mqtt.publish(TOPIC_DOOR_STATUS, buf, true);
  log("Published door status: " + String(buf));
}

void publishLightStatus(bool on) {
  StaticJsonDocument<64> doc;
  doc["device"] = "light";
  doc["on"]     = on;
  char buf[64];
  serializeJson(doc, buf);
  mqtt.publish(TOPIC_LIGHT_STATUS, buf, true);
  log("Published light status: " + String(buf));
}

// ============================================================
// XỬ LÝ LỆNH QUẠT
//   Payload mẫu: {"device":"fan","command":"set_speed","value":75}
//                {"device":"fan","command":"off"}
// ============================================================
void handleFanCommand(const String& payload) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    log("JSON parse error (fan): " + String(err.c_str()));
    return;
  }

  const char* cmd = doc["command"] | "";

  if (strcmp(cmd, "set_speed") == 0) {
    int speed = doc["value"] | 0;
    speed = constrain(speed, 0, 100);
    currentFanSpeed = speed;
    setVentilationLED(speed);
    publishFanStatus(speed);

  } else if (strcmp(cmd, "on") == 0) {
    // "on" không có value → bật mặc định Medium (50)
    currentFanSpeed = 50;
    setVentilationLED(50);
    publishFanStatus(50);

  } else if (strcmp(cmd, "off") == 0) {
    currentFanSpeed = 0;
    setVentilationLED(0);
    publishFanStatus(0);

  } else {
    log("Lệnh quạt không hợp lệ: " + String(cmd));
  }
}

// ============================================================
// XỬ LÝ LỆNH CỬA
//   Payload mẫu: {"device":"door","command":"open"}
//                {"device":"door","command":"close"}
// ============================================================
void handleDoorCommand(const String& payload) {
  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, payload)) return;

  const char* cmd = doc["command"] | "";
  if (strcmp(cmd, "open") == 0) {
    doorOpen = true;
    log("Cửa: MỞ");
  } else if (strcmp(cmd, "close") == 0) {
    doorOpen = false;
    log("Cửa: ĐÓNG");
  }
  publishDoorStatus(doorOpen);
}

// ============================================================
// XỬ LÝ LỆNH ĐÈN PHÒNG
//   Payload mẫu: {"device":"light","command":"on"}
//                {"device":"light","command":"off"}
// ============================================================
void handleLightCommand(const String& payload) {
  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, payload)) return;

  const char* cmd = doc["command"] | "";
  if (strcmp(cmd, "on") == 0) {
    lightOn = true;
    log("Đèn phòng: BẬT");
  } else if (strcmp(cmd, "off") == 0) {
    lightOn = false;
    log("Đèn phòng: TẮT");
  }
  publishLightStatus(lightOn);
}

// ============================================================
// CALLBACK — gọi khi nhận message từ MQTT broker
// ============================================================
void onMessage(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  log("← Topic: " + String(topic));
  log("  Payload: " + msg);

  if (String(topic) == TOPIC_FAN_CMD) {
    handleFanCommand(msg);
  } else if (String(topic) == TOPIC_DOOR_CMD) {
    handleDoorCommand(msg);
  } else if (String(topic) == TOPIC_LIGHT_CMD) {
    handleLightCommand(msg);
  }
}

// ============================================================
// KẾT NỐI WiFi
// ============================================================
void connectWiFi() {
  log("Đang kết nối WiFi: " + String(WIFI_SSID));
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    log("WiFi OK! IP: " + WiFi.localIP().toString());
  } else {
    log("WiFi THẤT BẠI — restart sau 5s");
    delay(5000);
    ESP.restart();
  }
}

// ============================================================
// KẾT NỐI MQTT (non-blocking reconnect)
// Trả về true nếu connect thành công
// ============================================================
bool connectMQTT() {
  log("Đang kết nối MQTT: " + String(MQTT_BROKER) + ":" + String(MQTT_PORT));

  if (mqtt.connect(CLIENT_ID)) {
    log("MQTT OK! Client ID: " + String(CLIENT_ID));

    // Subscribe các topic điều khiển
    mqtt.subscribe(TOPIC_FAN_CMD);
    mqtt.subscribe(TOPIC_DOOR_CMD);
    mqtt.subscribe(TOPIC_LIGHT_CMD);
    log("Subscribed: fan / door / light commands");

    // Gửi trạng thái khởi tạo
    publishFanStatus(currentFanSpeed);
    publishDoorStatus(doorOpen);
    publishLightStatus(lightOn);

    // Thông báo online
    mqtt.publish("devices/status/online",
      ("{\"client\":\"" + String(CLIENT_ID) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}").c_str(),
      true
    );
    return true;
  } else {
    log("MQTT thất bại, rc=" + String(mqtt.state()));
    return false;
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("╔══════════════════════════════════════╗");
  Serial.println("║  AIR QUALITY IoT — ESP32 MQTT NODE  ║");
  Serial.println("╚══════════════════════════════════════╝");

  // Cấu hình chân GPIO
  pinMode(LED_GREEN,  OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED,    OUTPUT);
  setVentilationLED(0);  // Tắt tất cả khi khởi động

  // Kết nối WiFi
  connectWiFi();

  // Cấu hình MQTT
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(onMessage);
  mqtt.setBufferSize(512);  // Tăng buffer cho JSON lớn

  // Kết nối MQTT lần đầu
  connectMQTT();

  log("Hệ thống sẵn sàng!");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  // Giữ kết nối WiFi
  if (WiFi.status() != WL_CONNECTED) {
    log("WiFi mất kết nối! Đang kết nối lại...");
    connectWiFi();
  }

  // Giữ kết nối MQTT (non-blocking: thử lại mỗi 5s)
  if (!mqtt.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt >= 5000) {
      lastReconnectAttempt = now;
      log("MQTT mất kết nối — thử lại...");
      connectMQTT();
    }
  } else {
    mqtt.loop();  // Xử lý incoming messages
  }
}
