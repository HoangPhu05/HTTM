// ============================================================
// MAIN MQTT - He thong IoT Giam sat Chat luong Khong khi
// ------------------------------------------------------------
// GPIO 25 = LED Xanh   → Thong gio Thap   (0 - 33%)
// GPIO 26 = LED Vang   → Thong gio Trung  (34 - 66%)
// GPIO 27 = LED Do     → Thong gio Cao    (67 - 100%)
// GPIO 32 = LED Trang  → Cua (Mo = sang, Dong = tat)
// GPIO 33 = LED Vang2  → Den phong (Bat = sang, Tat = tat)
//
// Libraries can cai (Arduino Library Manager):
//   - PubSubClient  by Nick O'Leary  (MQTT)
//   - ArduinoJson   by Benoit Blanchon (JSON parsing)
// ============================================================

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// --- CAU HINH WiFi -------------------------------------------
const char* WIFI_SSID     = "O";
const char* WIFI_PASSWORD = "OOOOOOOOO";

// --- CAU HINH MQTT -------------------------------------------
const char* MQTT_BROKER = "10.63.208.125";  // IP PC chay Mosquitto
const int   MQTT_PORT   = 1883;
const char* CLIENT_ID   = "ESP32_AirQuality";

// --- MQTT TOPICS ---------------------------------------------
const char* TOPIC_FAN_CMD   = "devices/control/fan/command";
const char* TOPIC_DOOR_CMD  = "devices/control/door/command";
const char* TOPIC_LIGHT_CMD = "devices/control/light/command";

const char* TOPIC_FAN_STATUS   = "devices/status/fan";
const char* TOPIC_DOOR_STATUS  = "devices/status/door";
const char* TOPIC_LIGHT_STATUS = "devices/status/light";

// --- CHAN GPIO ------------------------------------------------
// Quat / Thong gio (3 LED muc do)
#define LED_GREEN  25   // Thong gio Thap
#define LED_YELLOW 26   // Thong gio Trung binh
#define LED_RED    27   // Thong gio Cao

// Cua va Den phong (2 LED moi them)
#define LED_DOOR   32   // Trang: Mo cua = sang
#define LED_LIGHT  33   // Cam:   Den phong bat = sang

// --- BIEN TRANG THAI -----------------------------------------
int  currentFanSpeed = 0;
bool doorOpen        = false;
bool lightOn         = false;
unsigned long lastReconnectAttempt = 0;

WiFiClient   espClient;
PubSubClient mqtt(espClient);

// ============================================================
// LOG
// ============================================================
void log(const String& msg) {
  Serial.println("[IoT] " + msg);
}

// ============================================================
// KHOI DONG LED (test nhanh khi bat may)
// Sang lan luot tung LED 200ms → tat het
// ============================================================
void startupBlink() {
  int pins[] = { LED_GREEN, LED_YELLOW, LED_RED, LED_DOOR, LED_LIGHT };
  for (int i = 0; i < 5; i++) {
    digitalWrite(pins[i], HIGH);
    delay(200);
    digitalWrite(pins[i], LOW);
    delay(100);
  }
}

// ============================================================
// DIEU KHIEN LED QUAT theo muc thong gio
//   0       → Tat het
//   1-33    → LED Xanh  (Low)
//   34-66   → LED Vang  (Medium)
//   67-100  → LED Do    (High)
// ============================================================
void setVentilationLED(int speed) {
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);

  if (speed <= 0) {
    log("Fan OFF - all LEDs off");
  } else if (speed <= 33) {
    digitalWrite(LED_GREEN, HIGH);
    log("Ventilation LOW  (" + String(speed) + "%) -> GREEN LED");
  } else if (speed <= 66) {
    digitalWrite(LED_YELLOW, HIGH);
    log("Ventilation MED  (" + String(speed) + "%) -> YELLOW LED");
  } else {
    digitalWrite(LED_RED, HIGH);
    log("Ventilation HIGH (" + String(speed) + "%) -> RED LED");
  }
}

// ============================================================
// DIEU KHIEN LED CUA
// ============================================================
void setDoorLED(bool open) {
  digitalWrite(LED_DOOR, open ? HIGH : LOW);
  log(open ? "Door OPEN  -> LED ON" : "Door CLOSE -> LED OFF");
}

// ============================================================
// DIEU KHIEN LED DEN PHONG
// ============================================================
void setLightLED(bool on) {
  digitalWrite(LED_LIGHT, on ? HIGH : LOW);
  log(on ? "Light ON  -> LED ON" : "Light OFF -> LED OFF");
}

// ============================================================
// PUBLISH TRANG THAI
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
  mqtt.publish(TOPIC_FAN_STATUS, buf, true);
}

void publishDoorStatus(bool open) {
  StaticJsonDocument<64> doc;
  doc["device"] = "door";
  doc["open"]   = open;
  char buf[64];
  serializeJson(doc, buf);
  mqtt.publish(TOPIC_DOOR_STATUS, buf, true);
}

void publishLightStatus(bool on) {
  StaticJsonDocument<64> doc;
  doc["device"] = "light";
  doc["on"]     = on;
  char buf[64];
  serializeJson(doc, buf);
  mqtt.publish(TOPIC_LIGHT_STATUS, buf, true);
}

// ============================================================
// XU LY LENH QUAT
//   {"device":"fan","command":"set_speed","value":75}
//   {"device":"fan","command":"off"}
// ============================================================
void handleFanCommand(const String& payload) {
  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, payload)) {
    log("JSON error (fan)");
    return;
  }
  const char* cmd = doc["command"] | "";

  if (strcmp(cmd, "set_speed") == 0) {
    int speed = constrain((int)(doc["value"] | 0), 0, 100);
    currentFanSpeed = speed;
    setVentilationLED(speed);
    publishFanStatus(speed);

  } else if (strcmp(cmd, "on") == 0) {
    currentFanSpeed = 50;
    setVentilationLED(50);
    publishFanStatus(50);

  } else if (strcmp(cmd, "off") == 0) {
    currentFanSpeed = 0;
    setVentilationLED(0);
    publishFanStatus(0);
  }
}

// ============================================================
// XU LY LENH CUA
//   {"device":"door","command":"open"}
//   {"device":"door","command":"close"}
// ============================================================
void handleDoorCommand(const String& payload) {
  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, payload)) return;

  const char* cmd = doc["command"] | "";
  if (strcmp(cmd, "open") == 0) {
    doorOpen = true;
  } else if (strcmp(cmd, "close") == 0) {
    doorOpen = false;
  }
  setDoorLED(doorOpen);
  publishDoorStatus(doorOpen);
}

// ============================================================
// XU LY LENH DEN PHONG
//   {"device":"light","command":"on"}
//   {"device":"light","command":"off"}
// ============================================================
void handleLightCommand(const String& payload) {
  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, payload)) return;

  const char* cmd = doc["command"] | "";
  if (strcmp(cmd, "on") == 0) {
    lightOn = true;
  } else if (strcmp(cmd, "off") == 0) {
    lightOn = false;
  }
  setLightLED(lightOn);
  publishLightStatus(lightOn);
}

// ============================================================
// MQTT CALLBACK
// ============================================================
void onMessage(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  log("< " + String(topic) + " : " + msg);

  if (String(topic) == TOPIC_FAN_CMD) {
    handleFanCommand(msg);
  } else if (String(topic) == TOPIC_DOOR_CMD) {
    handleDoorCommand(msg);
  } else if (String(topic) == TOPIC_LIGHT_CMD) {
    handleLightCommand(msg);
  }
}

// ============================================================
// KET NOI WiFi
// ============================================================
void connectWiFi() {
  log("Connecting WiFi: " + String(WIFI_SSID));
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
    log("WiFi FAILED - restarting...");
    delay(5000);
    ESP.restart();
  }
}

// ============================================================
// KET NOI MQTT
// ============================================================
bool connectMQTT() {
  log("Connecting MQTT: " + String(MQTT_BROKER));

  if (mqtt.connect(CLIENT_ID)) {
    log("MQTT OK!");

    mqtt.subscribe(TOPIC_FAN_CMD);
    mqtt.subscribe(TOPIC_DOOR_CMD);
    mqtt.subscribe(TOPIC_LIGHT_CMD);

    // Gui trang thai khoi tao
    publishFanStatus(currentFanSpeed);
    publishDoorStatus(doorOpen);
    publishLightStatus(lightOn);

    // Thong bao online
    String onlineMsg = "{\"client\":\"" + String(CLIENT_ID) +
                       "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
    mqtt.publish("devices/status/online", onlineMsg.c_str(), true);
    return true;
  }

  log("MQTT FAILED rc=" + String(mqtt.state()));
  return false;
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("========================================");
  Serial.println("  AIR QUALITY IoT - ESP32 MQTT NODE   ");
  Serial.println("  GPIO 25=Green  26=Yellow  27=Red     ");
  Serial.println("  GPIO 32=Door   33=Light              ");
  Serial.println("========================================");

  // Cau hinh GPIO
  pinMode(LED_GREEN,  OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED,    OUTPUT);
  pinMode(LED_DOOR,   OUTPUT);
  pinMode(LED_LIGHT,  OUTPUT);

  // Test LED khi khoi dong
  startupBlink();

  // Tat het
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);
  digitalWrite(LED_DOOR,   LOW);
  digitalWrite(LED_LIGHT,  LOW);

  connectWiFi();

  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(onMessage);
  mqtt.setBufferSize(512);

  connectMQTT();

  log("System ready!");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    log("WiFi lost - reconnecting...");
    connectWiFi();
  }

  if (!mqtt.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt >= 5000) {
      lastReconnectAttempt = now;
      log("MQTT lost - reconnecting...");
      connectMQTT();
    }
  } else {
    mqtt.loop();
  }
}
