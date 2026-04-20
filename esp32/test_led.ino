// =============================================
// TEST LED - Kiểm tra kết nối 3 đèn LED
// GPIO 25 = LED Xanh (Low)
// GPIO 26 = LED Vàng (Medium)
// GPIO 27 = LED Đỏ   (High)
// =============================================

#define LED_GREEN  25
#define LED_YELLOW 26
#define LED_RED    27

void setup() {
  Serial.begin(115200);

  pinMode(LED_GREEN,  OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED,    OUTPUT);

  // Tắt hết khi khởi động
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);

  Serial.println("=== TEST LED BẮT ĐẦU ===");
}

void loop() {

  // --- Bước 1: Sáng từng đèn một ---
  Serial.println(">> LED XANH sáng");
  digitalWrite(LED_GREEN, HIGH);
  delay(1000);
  digitalWrite(LED_GREEN, LOW);
  delay(300);

  Serial.println(">> LED VÀNG sáng");
  digitalWrite(LED_YELLOW, HIGH);
  delay(1000);
  digitalWrite(LED_YELLOW, LOW);
  delay(300);

  Serial.println(">> LED ĐỎ sáng");
  digitalWrite(LED_RED, HIGH);
  delay(1000);
  digitalWrite(LED_RED, LOW);
  delay(300);

  // --- Bước 2: Sáng cả 3 cùng lúc ---
  Serial.println(">> Cả 3 LED sáng");
  digitalWrite(LED_GREEN,  HIGH);
  digitalWrite(LED_YELLOW, HIGH);
  digitalWrite(LED_RED,    HIGH);
  delay(1000);

  // --- Bước 3: Tắt cả 3 ---
  Serial.println(">> Tắt hết");
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);
  delay(1000);

  // --- Bước 4: Nhấp nháy nhanh ---
  Serial.println(">> Nhấp nháy...");
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_GREEN,  HIGH);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_RED,    HIGH);
    delay(150);
    digitalWrite(LED_GREEN,  LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED,    LOW);
    delay(150);
  }

  delay(500);
  Serial.println("--- Lặp lại ---\n");
}
