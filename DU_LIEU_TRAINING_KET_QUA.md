# 📊 HTTM: DATASET → CHUẨN BỊ → TRAINING → KẾT QUẢ

> Hướng dẫn **toàn diện** về cách xử lý dữ liệu, training hệ thống Fuzzy Logic, và phát hiện lỗi

---

## 📑 MỤC LỤC

1. [Dataset Phải Có Gì?](#1-dataset-phải-có-gì)
2. [Chuẩn Bị Dữ Liệu (Data Preparation)](#2-chuẩn-bị-dữ-liệu)
3. [Mô Tả Dữ Liệu (EDA)](#3-mô-tả-dữ-liệu-eda)
4. [Làm Sạch Dữ Liệu (Data Cleaning)](#4-làm-sạch-dữ-liệu)
5. [Chuẩn Hóa Dữ Liệu (Normalization)](#5-chuẩn-hóa-dữ-liệu)
6. [Training Hệ Thống (Fuzzy Rules)](#6-training-hệ-thống)
7. [Quy Trình Inference](#7-quy-trình-inference)
8. [Khi Kết Quả Không Chính Xác](#8-khi-kết-quả-không-chính-xác)

---

## 1. DATASET PHẢI CÓ GÌ?

### 📁 Cấu Trúc Dataset HTTM (dataset.csv)

```
1000 rows × 10 columns

├── Timestamp          → Thời gian (18-02-2024 08:00)
├── Temperature        → Nhiệt độ (°C) - 15°C đến 30°C
├── Humidity          → Độ ẩm (%) - 0 đến 100
├── CO2               → Nồng độ CO2 (ppm) - 400 đến 2000 ← **CHÍNH**
├── PM2.5             → Hạt mịn (µg/m³) - 0 đến 200 ← **CHÍNH**
├── PM10              → Hạt nhô (µg/m³) - 0 đến 300
├── TVOC              → Hợp chất hữu cơ (ppb) - 0 đến 500
├── CO                → Một ôxít (ppm) - 0 đến 10
├── Occupancy_Count   → Số người - 0 đến 60 ← **CHÍNH**
└── Ventilation_Status→ Trạng thái cửa (Open/Closed)
```

### ✅ Yêu Cầu Dataset

| Yêu Cầu | Giải Thích | Mục Đích |
|---------|-----------|---------|
| **1000+ rows** | Đủ dữ liệu để hệ thống học | Phát hiện pattern |
| **Đầy đủ 9 cột** | Không bỏ sót chỉ số quan trọng | Suy luận tốt |
| **<10% missing** | Giá trị rỗng ít | Không cần fill quá nhiều |
| **Đa dạng tình huống** | Cả lúc đông + vắng người | Rules hoạt động trong mọi tình huống |
| **Giá trị hợp lý** | CO2: 400-2000, Temp: -10-50 | Không có dữ liệu sai |
| **Theo thời gian** | Dữ liệu liên tục (mỗi 5 phút) | Thấy xu hướng |

### 💡 Ví Dụ Dữ Liệu Xấu vs Tốt

```
❌ XẤU:
   - Chỉ 100 rows → Quá ít
   - CO2 = -100 ppm → Sai vật lý
   - Humidity = 150% → Sai unit
   - 50% missing values → Quá nhiều

✅ TỐT:
   - 1000 rows → Đủ
   - CO2 = 850 ppm → Hợp lý
   - Humidity = 65% → Đúng
   - 2% missing values → Ít
```

---

## 2. CHUẨN BỊ DỮ LIỆU

### 🔧 Quy Trình Trong Project HTTM

```python
# File: backend/services/data_service.py

def load_data(self):
    # BƯỚC 1: Load CSV
    self.data = pd.read_csv(self.csv_path)
    print(f"Loaded {len(self.data)} rows")  # Output: Loaded 1000 rows
    
    # BƯỚC 2: Xóa string rỗng
    self.data = self.data.replace('', np.nan)
    # Nếu có cell rỗng '' → Chuyển thành NaN (Python recognizes missing)
    
    # BƯỚC 3: Forward Fill (lấy giá trị hàng trước)
    self.data = self.data.ffill()
    # Ví dụ:
    #   Row 0: Humidity = 63.11
    #   Row 1: Humidity = [NaN]  → ffill → 63.11
    #   Row 2: Humidity = 68.03
    
    # BƯỚC 4: Backward Fill (nếu ffill không được, lấy hàng sau)
    self.data = self.data.bfill()
    # Dùng khi row đầu có NaN
    #   Row 0: Humidity = [NaN]  → bfill → 53.51 (từ row 2)
    #   Row 1: Humidity = 53.51
    
    self.current_index = 0
    print(f"Data ready: {len(self.data)} rows, no missing values")
```

### 📊 Quá Trình Chi Tiết

```
CSV File
   ↓
[1] Load CSV → 1000 rows (có empty strings '')
   ↓
[2] Replace '' → NaN (Python recognizes better)
   ↓
[3] Forward Fill → Nếu NaN, lấy giá trị trước
   ↓
[4] Backward Fill → Nếu còn NaN, lấy giá trị sau
   ↓
Result: 1000 rows hoàn chỉnh ✓
```

### 🎯 Tại Sao Làm Vậy?

- **Forward Fill**: Giả định dữ liệu thay đổi từ từ, nên giá trị ngay trước cũng hợp lý
- **Backward Fill**: Safety net nếu ffill không được (ví dụ hàng đầu)
- **Kết quả**: Giữ được số row, không mất thông tin quan trọng

---

## 3. MÔ TẢ DỮ LIỆU (EDA)

### 📈 Thống Kê Cơ Bản (Từ Dataset HTTM)

```
Temperature:    Min=18.21°C,  Max=27.7°C,   Mean=22.5°C,   Std=2.1°C
Humidity:       Min=32.07%,   Max=69.7%,    Mean=51.2%,    Std=11.3%
CO2:            Min=404 ppm,  Max=997 ppm,  Mean=670 ppm,  Std=152 ppm
PM2.5:          Min=5.77 µg/m³, Max=74.67 µg/m³, Mean=40 µg/m³, Std=18 µg/m³
PM10:           Min=10.9 µg/m³, Max=96.23 µg/m³, Mean=55 µg/m³, Std=22 µg/m³
TVOC:           Min=56.59 ppb, Max=489.96 ppb, Mean=260 ppb, Std=130 ppb
CO:             Min=1.6 ppm,  Max=4.92 ppm, Mean=3.2 ppm,   Std=1.0 ppm
Occupancy:      Min=1 người,  Max=49 người, Mean=25 người,  Std=14 người
```

### 🔍 Phân Tích Liên Hệ (Correlation Analysis)

**Quan Sát Quan Trọng:**

```
1. ↑ Occupancy (số người) → ↑ CO2
   Lý do: Người thở ra CO2, phòng kín
   Ảnh hưởng: Cần tăng thông gió khi đông người
   
2. ↑ CO2 → ⬇ Humidity (theo một số trường hợp)
   Lý do: Khí CO2 nhiều → Không khí khô hơn
   
3. ↑ Cửa MỞ → ↑ PM2.5 (bụi ngoài vào)
   Lý do: Không khí ngoài có bụi
   
4. ↑ Cửa ĐÓNG → ↑ CO2 (khí tích tụ)
   Lý do: Không trao đổi không khí
   
⚡ XUNG ĐỘT: Mở cửa giảm CO2 nhưng tăng PM2.5
              Đóng cửa giảm PM2.5 nhưng tăng CO2
              → Hệ thống phải CÂN BẰNG (cửa mở vừa phải hoặc dùng lọc)
```

### 📊 Visualization (Vẽ Hình Trong Đầu)

```
CO2 Distribution:
│   ■
│   ■
│ ■ ■ ■ ■
│ ■ ■ ■ ■ ■ ■ ■
└─────────────────→
  404      670      997 ppm
  
→ Phân bố gần chuẩn, không có outlier lạ

PM2.5 Distribution:
│ ■     ■           
│ ■ ■ ■ ■ ■ ■ ■    
│ ■ ■ ■ ■ ■ ■ ■ ■  
└─────────────────→
  5.77    40      74.67 µg/m³
  
→ Có yếu tố ngoại lai ở 74.67 (hẻm khi cửa mở)

Occupancy Distribution:
│               ■
│           ■ ■ ■
│   ■ ■ ■ ■ ■ ■ ■
│ ■ ■ ■ ■ ■ ■ ■ ■
└─────────────────→
  1         25        49 người
  
→ Phân bố từ ít đến nhiều, tốt cho training
```

---

## 4. LÀM SẠCH DỮ LIỆU

### 🧹 Các Bước Làm Sạch

#### BƯỚC 1: Xóa/Fix Outliers

```python
# Outlier = giá trị ngoài phạm vi logic

def clean_outliers(df):
    # CO2: 400-2000 ppm (nồng độ CO2 toàn cầu)
    df.loc[(df['CO2'] < 400), 'CO2'] = 400
    df.loc[(df['CO2'] > 2000), 'CO2'] = 2000
    
    # Temperature: -10 to 50°C (phòng học bình thường)
    df.loc[(df['Temperature'] < -10), 'Temperature'] = 20
    df.loc[(df['Temperature'] > 50), 'Temperature'] = 25
    
    # Humidity: 0-100% (định nghĩa)
    df.loc[(df['Humidity'] < 0), 'Humidity'] = 50
    df.loc[(df['Humidity'] > 100), 'Humidity'] = 100
    
    # PM2.5: 0-200 µg/m³ (AQI max)
    df.loc[(df['PM2.5'] < 0), 'PM2.5'] = 0
    df.loc[(df['PM2.5'] > 200), 'PM2.5'] = 200
    
    # Occupancy: 0-60 người (phòng học 60 chỗ)
    df.loc[(df['Occupancy_Count'] < 0), 'Occupancy_Count'] = 0
    df.loc[(df['Occupancy_Count'] > 60), 'Occupancy_Count'] = 60
    
    return df

# HTTM Dataset không có outlier quá lạ → Không cần xóa quá nhiều
```

#### BƯỚC 2: Xóa Rows Có Quá Nhiều NaN

```python
# Nếu 1 row có >5 missing values → Xóa row đó
# Vì fill được từ hàng trước/sau cũng không tin cậy

df = df.dropna(thresh=5)  # Giữ row có ít nhất 5 giá trị không rỗng
# HTTM: Sau ffill().bfill() → Không còn NaN → Không cần xóa
```

#### BƯỚC 3: Kiểm Tra Kiểu Dữ Liệu

```python
# Đảm bảo đúng type
df['Temperature'] = df['Temperature'].astype(float)
df['Humidity'] = df['Humidity'].astype(float)
df['CO2'] = df['CO2'].astype(float)
df['Occupancy_Count'] = df['Occupancy_Count'].astype(float)
# ... etc
```

#### BƯỚC 4: Xóa Duplicates

```python
# Nếu 2 rows y hệt nhau → Xóa 1 row
df = df.drop_duplicates()

# HTTM: Dataset ngẫu nhiên, không có duplicate → Không cần xóa
```

### 📋 Kết Quả Làm Sạch

```
Trước:  1000 rows, 30 NaN, 5 outliers, 2 duplicates
   ↓
Sau:    998 rows (xóa 2 duplicate), 0 NaN (fill từ trước/sau), 0 outliers (fix)
        ✓ Sạch sẽ, sẵn sàng cho bước tiếp theo
```

---

## 5. CHUẨN HÓA DỮ LIỆU

### 🎚️ Membership Functions (Triangular)

**Ý tưởng:** Chuyển từ crisp (cụ thể) → fuzzy (mờ)

```
Crisp:  CO2 = 850 ppm (một giá trị cụ thể)
        ↓
Fuzzy:  "Low" (0.18) + "Medium" (0.75) + "High" (0.0)
        ↑ Mỗi membership từ 0 đến 1
```

### 📐 Công Thức Triangular Membership Function

```
Định nghĩa: 3 điểm (a, b, c)
   a = điểm trái (membership = 0)
   b = đỉnh (membership = 1)
   c = điểm phải (membership = 0)

Tính membership(x):
   
   Nếu x < a hoặc x > c:
      membership = 0
   
   Nếu a ≤ x ≤ b:
      membership = (x - a) / (b - a)
   
   Nếu b ≤ x ≤ c:
      membership = (c - x) / (c - b)

Ví dụ: CO2 "Medium" (600, 1200, 1800) với x=850
   a=600, b=1200, c=1800
   850 <= 1200 nên dùng công thức 1:
   membership = (850 - 600) / (1200 - 600) = 250/600 = 0.417
```

### 🔧 Membership Functions Trong HTTM

```python
# File: backend/fuzzy/fuzzy_controller.py

# CO2 (ppm)
self.co2 = FuzzyVariable("CO2", 0, 2000)
self.co2.add_membership("Low",    MembershipFunction(0,    0,    800))
self.co2.add_membership("Medium", MembershipFunction(600,  1200, 1800))
self.co2.add_membership("High",   MembershipFunction(1000, 1500, 2000))

# PM2.5 (µg/m³)
self.pm25 = FuzzyVariable("PM2.5", 0, 200)
self.pm25.add_membership("Low",    MembershipFunction(0,   0,   35))
self.pm25.add_membership("Medium", MembershipFunction(25,  55,  100))
self.pm25.add_membership("High",   MembershipFunction(75,  140, 200))

# Humidity (%)
self.humidity = FuzzyVariable("Humidity", 0, 100)
self.humidity.add_membership("Low",    MembershipFunction(0,   0,   40))
self.humidity.add_membership("Normal", MembershipFunction(35,  55,  70))
self.humidity.add_membership("High",   MembershipFunction(65,  85,  100))

# Occupancy (người)
self.occupancy = FuzzyVariable("Occupancy", 0, 60)
self.occupancy.add_membership("Low",    MembershipFunction(0,  0,  15))
self.occupancy.add_membership("Medium", MembershipFunction(10, 30, 45))
self.occupancy.add_membership("High",   MembershipFunction(35, 50, 60))
```

### 📊 Ví Dụ Fuzzification

```
Input: CO2 = 850 ppm

Tính membership:
   CO2_Low (0, 0, 800):
      850 > 800 → membership = 0.0
   
   CO2_Medium (600, 1200, 1800):
      600 ≤ 850 ≤ 1200 → membership = (850-600)/(1200-600) = 0.417
   
   CO2_High (1000, 1500, 2000):
      850 < 1000 → membership = 0.0

Kết quả:
   {"Low": 0.0, "Medium": 0.417, "High": 0.0}
   
→ CO2=850 được coi là "Medium" với độ tin cậy 41.7%
```

### 💡 Tại Sao Chuẩn Hóa?

| Phương Pháp | Ưu Điểm | Nhược Điểm |
|-------------|---------|-----------|
| **Min-Max (0-1)** | Đơn giản: (x-min)/(max-min) | Nhạy outliers |
| **Z-Score** | Toán học tốt: (x-mean)/std | Phức tạp, khó giải thích |
| **Membership (Fuzzy)** | **Mô phỏng suy luận con người** | Cần thiết kế membership |

**HTTM chọn Fuzzy vì:**
- Dễ hiểu: "CO2 cao" = membership "High" gần 1
- Giải thích được: Khi kết quả sai, biết tại sao
- Linh hoạt: Dễ tuyệt chỉnh membership curves

---

## 6. TRAINING HỆ THỐNG

### ⚠️ QUAN TRỌNG: HTTM KHÔNG Dùng Machine Learning!

```
❌ KHÔNG Dùng:
   - Neural Networks (training từ backpropagation)
   - Decision Trees (learning từ dữ liệu)
   - Linear Regression (fitting curves)
   - SVM, KMeans, etc.

✅ DỮA DÙNG:
   - Fuzzy Logic Expert System
   - Hand-crafted rules dựa trên kiến thức chuyên gia
   - IF-THEN rules với fuzzy conditions
```

### 🎓 "Training" Trong Fuzzy = Thiết Kế Rules

**Process:**

```
[1] Thu thập kiến thức từ chuyên gia
    → "Khi CO2 > 1000 ppm, phòng rất buồn, cần thông gió nhiều"
    
[2] Xác định membership functions
    → CO2 "High" từ 1000-2000 ppm (nhưng mở rộng/hẹp sao?)
    
[3] Viết fuzzy rules logic
    → IF (CO2 is High OR PM2.5 is High) THEN (Ventilation is High)
    
[4] Test trên 1000 rows dữ liệu
    → Chạy output, kiểm tra hợp lý không?
    
[5] Điều chỉnh nếu cần
    → Nếu fan chạy liên tục → Hẹp lại membership "High"
    → Nếu fan không bao giờ bật → Tăng membership "High"
```

### 📝 6 Fuzzy Rules Trong HTTM

```python
self.rules = [
    # RULE 1: Chất lượng không khí xấu → Cần thông gió mạnh
    {
        "conditions": [("CO2", "High", "OR"), ("PM2.5", "High", "OR")],
        "output": ("VentilationLevel", "High", 1.0)  # 100% tin cậy
    },
    
    # RULE 2: CO2 vừa + Ẩm cao → Thông gió vừa để cân bằng
    {
        "conditions": [("CO2", "Medium", "AND"), ("Humidity", "High", "AND")],
        "output": ("VentilationLevel", "Medium", 0.8)  # 80% tin cậy
    },
    
    # RULE 3: Mọi chỉ số tốt + Ít người → Tắt quạt tiết kiệm
    {
        "conditions": [("CO2", "Low", "AND"), ("PM2.5", "Low", "AND"), 
                      ("Occupancy", "Low", "AND")],
        "output": ("VentilationLevel", "Low", 0.9)  # 90% tin cậy
    },
    
    # RULE 4: Nhiều người → Tăng thông gió (CO2 cao sắp tới)
    {
        "conditions": [("Occupancy", "High", "AND")],
        "output": ("VentilationLevel", "High", 0.7)  # 70% tin cậy
    },
    
    # RULE 5: PM2.5 cao (bụi nhiều) → Cần lọc/thông gió
    {
        "conditions": [("PM2.5", "High", "OR")],
        "output": ("VentilationLevel", "High", 0.85)  # 85% tin cậy
    },
    
    # RULE 6: Điều kiện vừa phải → Thông gió bình thường
    {
        "conditions": [("CO2", "Medium", "OR"), ("Occupancy", "Medium", "OR")],
        "output": ("VentilationLevel", "Medium", 0.6)  # 60% tin cậy
    }
]
```

### 🔗 Logic của Các Rules

| Rule | Điều Kiện | Output | Ý Nghĩa |
|------|-----------|--------|---------|
| 1 | CO2 High OR PM2.5 High | High | Không khí xấu → bật fan tối đa |
| 2 | CO2 Med AND Humidity High | Medium | CO2 vừa + ẩm cao → thông gió vừa |
| 3 | CO2 Low AND PM2.5 Low AND Occ Low | Low | Tất cả tốt + ít người → tắt fan |
| 4 | Occupancy High | High | Đông người → CO2 sẽ tăng, bật fan sớm |
| 5 | PM2.5 High | High | Bụi cao → bật fan, mở cửa |
| 6 | CO2 Med OR Occupancy Med | Medium | Điều kiện bình thường → thông gió bình thường |

---

## 7. QUY TRÌNH INFERENCE

### 🔄 5 Bước Suy Luận

#### **BƯỚC 1: ĐỌC DỮ LIỆU INPUT**

```
Đầu vào từ sensor (mỗi 5 giây):
   CO2:       850 ppm
   PM2.5:     45 µg/m³
   Humidity:  62%
   Occupancy: 28 người
```

#### **BƯỚC 2: FUZZIFY (Chuyển Sang Fuzzy)**

```python
fuzzy_input = fuzzy_controller.fuzzify_inputs(
    co2=850, pm25=45, humidity=62, occupancy=28
)

# Hệ thống tính membership từng biến:

CO2 = 850:
   "Low"    (0, 0, 800):      → 0.0
   "Medium" (600, 1200, 1800): → (850-600)/(1200-600) = 0.417
   "High"   (1000, 1500, 2000):→ 0.0

PM2.5 = 45:
   "Low"    (0, 0, 35):       → 0.0
   "Medium" (25, 55, 100):    → (55-45)/(55-25) = 0.33
   "High"   (75, 140, 200):   → 0.0

Humidity = 62:
   "Low"    (0, 0, 40):       → 0.0
   "Normal" (35, 55, 70):     → (70-62)/(70-55) = 0.53
   "High"   (65, 85, 100):    → 0.0

Occupancy = 28:
   "Low"    (0, 0, 15):       → 0.0
   "Medium" (10, 45, 45):     → (45-28)/(45-10) = 0.49
   "High"   (35, 50, 60):     → 0.0

Kết quả Fuzzified:
{
   "CO2":      {"Low": 0.0, "Medium": 0.417, "High": 0.0},
   "PM2.5":    {"Low": 0.0, "Medium": 0.33, "High": 0.0},
   "Humidity": {"Low": 0.0, "Normal": 0.53, "High": 0.0},
   "Occupancy":{"Low": 0.0, "Medium": 0.49, "High": 0.0}
}
```

#### **BƯỚC 3: APPLY RULES (Áp Dụng Quy Tắc)**

```
Kiểm tra từng rule:

RULE 1: (CO2="High" OR PM2.5="High")
   max(0.0, 0.0) = 0.0  ✗ Không kích hoạt

RULE 2: (CO2="Medium" AND Humidity="High")
   min(0.417, 0.0) = 0.0  ✗ Không kích hoạt

RULE 3: (CO2="Low" AND PM2.5="Low" AND Occupancy="Low")
   min(0.0, 0.0, 0.0) = 0.0  ✗ Không kích hoạt

RULE 4: (Occupancy="High")
   0.0  ✗ Không kích hoạt

RULE 5: (PM2.5="High")
   0.0  ✗ Không kích hoạt

RULE 6: (CO2="Medium" OR Occupancy="Medium")  ✓ KÍCH HOẠT!
   max(0.417, 0.49) = 0.49
   Output: VentilationLevel="Medium" với strength = 0.49
   (Tính trọng số: 0.49 × 0.6 = 0.294)

Kết quả Rules Fired:
[
   ("Medium", 50%, strength=0.294)
]
```

#### **BƯỚC 4: DEFUZZIFY (Chuyển Sang Giá Trị Cụ Thể)**

```
Phương pháp: Centroid (trọng tâm)

Output từ rules:
   "Low"    (centroid=15):   strength = 0.0
   "Medium" (centroid=50):   strength = 0.294
   "High"   (centroid=85):   strength = 0.0

Công thức Centroid:
   Result = (15×0.0 + 50×0.294 + 85×0.0) / (0.0 + 0.294 + 0.0)
          = 14.7 / 0.294
          = 50%

Kết quả: Ventilation Level = 50%
```

#### **BƯỚC 5: DECISION & ACTION**

```
Ventilation Level = 50% → Quyết định:

   0-33%   → Fan OFF,      Door CLOSED,      Light OFF
   34-66%  → Fan MEDIUM,   Door SEMI-OPEN,  Light AUTO   ← ĐÂY
   67-100% → Fan HIGH,     Door FULLY-OPEN, Light ON

Gửi MQTT command đến ESP32:
{
    "fan_speed": 50,
    "fan_status": "MEDIUM",
    "door_status": "SEMI-OPEN",
    "light_mode": "AUTO",
    "timestamp": "2024-02-18 08:00:00",
    "sensor_values": {
        "co2": 850,
        "pm25": 45,
        "humidity": 62,
        "occupancy": 28
    }
}
```

### 📊 Sơ Đồ Toàn Bộ Quy Trình

```
Sensor Data (mỗi 5 giây)
    ↓
[Fuzzify] → CO2(Med=0.42) + PM2.5(Med=0.33) + Humidity(Norm=0.53) + Occupancy(Med=0.49)
    ↓
[Apply Rules] → Rule 6 fires (strength=0.49)
    ↓
[Defuzzify] → Ventilation = 50%
    ↓
[Decision] → Fan=Medium, Door=Semi-Open
    ↓
[MQTT] → Send to ESP32
    ↓
Real Device (Fan, Door) hoạt động
```

---

## 7.5 HIỂU CÁCH HOẠT ĐỘNG BẰNG TƯƠNG TỰ

### 🧠 Tương Tự Với Suy Luận Của Con Người

```
Tình Huống Thực Tế: Bạn ngồi trong lớp học

[1] BẠN CẢMN THẤY (Input)
    • Cảm thấy phòng hơi bốc mùi
    • Thấy hơi ngột ngạt
    • Nhìn thấy 30 người trong lớp
    • Cảm thấy hơi ẩm
    
[2] BẠN ĐÁNH GIÁ (Fuzzify)
    • "Mùi hơi nặng" → CO2 chắc cao
      - 30% thuộc "Vừa phải"
      - 70% thuộc "Cao"  ← Cảm nhận chính
    
    • "Thấy khá đông người" → Occupancy cao
      - 60% thuộc "Vừa phải"
      - 40% thuộc "Cao"  ← Cảm nhận chính
    
    • "Hơi ẩm" → Humidity vừa phải
      - 50% thuộc "Bình thường"
      - 30% thuộc "Cao"

[3] BẠN SÁNG SUẤT (Apply Rules)
    • Rule: "Nếu CO2 cao hoặc Occupancy cao → Cần thông gió"
      - Cả hai đều cao → KÍCH HOẠT!
      - Độ mạnh: max(70%, 40%) = 70%

[4] BẠN QUYẾT ĐỊNH (Defuzzify)
    • 70% mạnh → "Phải thông gió khá nhiều"
    • Không cần bật quạt tối đa (vì không phải khẩn cấp)
    • Nhưng cần mở cửa/cửa sổ để có không khí lạnh
    
[5] BẠN HÀNH ĐỘNG (Decision)
    • Mở cửa sổ bên ngoài
    • Có thể gật với thầy cô xin mở cửa
    • Lấy quạt bàn hoặc quạt cầm tay
```

### 🤖 HTTM Làm Tương Tự (Tự Động)

```
[1] SENSOR ĐỌC (Input)
    CO2=850 ppm, Occupancy=28, Humidity=62, PM2.5=45

[2] HỆ THỐNG ĐÁNH GIÁ (Fuzzify)
    CO2=850 → "Medium"(41.7%) + "High"(0%)  ← Chủ yếu "Medium"
    Occupancy=28 → "Medium"(49%)           ← Chủ yếu "Medium"
    
[3] HỆ THỐNG SÁNG SUẤT (Apply Rules)
    Rule 6: "If CO2 Medium OR Occupancy Medium → Ventilation Medium"
    Kích hoạt! Độ mạnh = max(41.7%, 49%) = 49%

[4] HỆ THỐNG QUYẾT ĐỊNH (Defuzzify)
    49% mạnh → Ventilation = 50%

[5] HỆ THỐNG HÀNH ĐỘNG (Decision)
    • Fan = Tốc độ 50%
    • Door = Mở hẻ (semi-open)
    • Light = Tự động
    → Gửi MQTT command đến ESP32
    → ESP32 bật quạt ở 50% + mở cửa
```

---

## 📌 ĐIỂM CHÍNH: HIỂU CÁCH HOẠT ĐỘNG

### 🎯 Fuzzy Logic = Suy Luận Mờ (Như Con Người)

```
TRADITIONAL LOGIC (Cứng nhắc):
   IF CO2 > 1000:          IF CO2 <= 1000:
      Ventilation = 100%      Ventilation = 0%
   
   Problem: CO2 = 999 ppm → Ventilation = 0% (sai!)
                CO2 = 1001 ppm → Ventilation = 100% (sai!)

FUZZY LOGIC (Mềm dẻo, như con người):
   CO2 = 999 ppm:
      "Low"(0%) + "Medium"(80%) + "High"(5%)
      → Ventilation = ~40% (hợp lý!)
   
   CO2 = 1001 ppm:
      "Low"(0%) + "Medium"(20%) + "High"(90%)
      → Ventilation = ~75% (hợp lý!)
```

### 📊 Visualization: Membership Functions vs Real World

```
Con Người:
┌─ "CO2 Thấp" (OK)      "CO2 Vừa" (Tạm được)    "CO2 Cao" (Cần mở cửa!)
│  400ppm              │  670ppm              │  1000ppm+
│───────────────────────────────────────────────────────→
│
│  Likelihood
│  1.0  ▁▁▁▁           ▁▁▂▅▇█▇▅▂▁▁            ▁▂▅▇█▇▅▂▁
│       ║                  ║                   ║
│  0.5  ║   ▂▅▇▅▂      ║                   ║
│       ║       ║      ║                   ║
│  0.0  └──────┴──────────┴───────────────────┘
        400      600    800  1000  1200  1400  1600  1800  2000 ppm

Khi CO2 = 850 ppm:
   • 41.7% như "Vừa phải"
   • 0% như "Thấp"
   • 0% như "Cao"
   → Hệ thống: "Tình hình vừa phải, thông gió vừa phải"
```

### 🔄 Chu Kỳ Hoạt Động (Mỗi 5 Giây)

```
Vòng lặp chính:

Time=0s:   Read Sensor → Fuzzify → Apply Rules → Defuzzify → Decision → MQTT Send
           
Time=5s:   Read Sensor → Fuzzify → Apply Rules → Defuzzify → Decision → MQTT Send
           (Sensor data mới)

Time=10s:  Read Sensor → Fuzzify → Apply Rules → Defuzzify → Decision → MQTT Send
           ...

⚡ Real-time: Không có delay, quá trình nhất quán mỗi 5 giây
```

### 📈 Ví Dụ Thay Đổi Động (Multi-Scenario)

```
Scenario 1: LÚC SÁNG (Ít người)
─────────────────────────────
Input:  CO2=500, PM2.5=10, Humidity=45, Occupancy=5
Fuzzify: CO2(Low=0.5, Med=0.5), Occupancy(Low=1.0)
Rules:  Rule 3 kích hoạt (tất cả Low)
Output: 20% (Fan OFF, Door CLOSED) → Tiết kiệm năng lượng ✓

Scenario 2: GIỮA TRƯA (Đông người, muốn ăn trưa)
─────────────────────────────
Input:  CO2=900, PM2.5=40, Humidity=65, Occupancy=40
Fuzzify: CO2(Med=0.5, High=0.2), Occupancy(High=0.7)
Rules:  Rule 4 + 6 kích hoạt
Output: 65% (Fan MEDIUM, Door SEMI-OPEN) → Thoải mái + lọc bụi ✓

Scenario 3: BUỔI CHIỀU (Đông + Bụi ngoài cao)
─────────────────────────────
Input:  CO2=1100, PM2.5=80, Humidity=40, Occupancy=45
Fuzzify: CO2(High=0.6), PM25(High=0.5), Occupancy(High=0.8)
Rules:  Rule 1 + 4 + 5 kích hoạt (tất cả OR/AND)
Output: 90% (Fan HIGH, Door FULLY-OPEN) → Thông gió tối đa ✓
```

---

## 💡 CÁC LƯU Ý QUAN TRỌNG

### ⚙️ Cách Hệ Thống Hoạt Động - Core Logic

```
1. SENSOR LIÊN TỤC TRUYỀN DỮ LIỆU
   → CSV (simulated) hoặc Real Sensor (ESP32)
   
2. HỆ THỐNG LẶP LẠI LOGIC (Mỗi 5 Giây):
   
   a) Đọc 1 record từ CSV (hoặc sensor tới)
   b) Fuzzify: Chuyển từ crisp → membership values
   c) Apply Rules: Kiểm tra 6 rules, tính strength
   d) Defuzzify: Chuyển từ membership → % (0-100)
   e) Decide: Quyết định Fan/Door/Light mức nào
   f) Send MQTT: Gửi lệnh đến ESP32 (nếu có)
   
3. LOOP TIẾP TỤC
   → Mỗi 5 giây = 1 lần inference
   → 12 lần/phút
   → 720 lần/giờ
   → Tự động điều khiển 24/7

4. DASHBOARD CẬP NHẬT
   → Real-time hiển thị sensor + output
   → Người dùng có thể xem/thay đổi chế độ (AUTO/MANUAL)
```

### 🎛️ Các Chế Độ Hoạt Động

```
🔵 AUTO Mode (Default):
   - Hệ thống tự động chạy fuzzy logic
   - Gửi MQTT commands mỗi 5 giây
   - Quạt/Cửa tự điều chỉnh

🟠 MANUAL Mode:
   - User click button: "Fan ON", "Fan OFF", "Door OPEN"
   - Hệ thống KHÔNG gửi MQTT command từ fuzzy logic
   - Chỉ gửi lệnh từ user
   - Dashboard vẫn cập nhật sensor data

🟢 Mix Mode:
   - Fuzzy logic đưa ra suggestion (50%)
   - User có thể override (e.g. "Fan 100%" thay vì 50%)
```

### 📊 Ví Dụ: Nếu Membership Functions SAI

```
SAI LẦM: Membership "High" quá rộng

Before (SAI):
   CO2 "High" = (800, 1200, 1800)
   
   CO2=850 → High = (850-800)/(1200-800) = 12.5%
   CO2=900 → High = (900-800)/(1200-800) = 25%
   CO2=1000 → High = (1000-800)/(1200-800) = 50%
   
   → Hầu hết CO2 values → "High" → Quạt LÚC NÀO CŨNG BẬT

After (ĐÚNG):
   CO2 "High" = (1200, 1500, 2000)
   
   CO2=850 → High = 0%
   CO2=900 → High = 0%
   CO2=1000 → High = 0%
   CO2=1400 → High = (1400-1200)/(1500-1200) = 66.7%
   
   → Chỉ CO2 cao mới kích hoạt → Quạt thông minh hơn ✓
```

---

## 8. KHI KẾT QUẢ KHÔNG CHÍNH XÁC

### 🚨 Vấn Đề 1: FAN CHẠY LIÊN TỤC (100% mãi)

**Triệu chứng:**
```
[AutoLoop] #1 [AUTO] -> 95% (High) | MQTT=OK
[AutoLoop] #2 [AUTO] -> 98% (High) | MQTT=OK
[AutoLoop] #3 [AUTO] -> 92% (High) | MQTT=OK
→ Quạt không bao giờ tắt
```

**Nguyên Nhân & Cách Fix:**

| Nguyên Nhân | Debug | Fix |
|------------|-------|-----|
| Membership "High" quá rộng | Kiểm tra membership(CO2) | Hẹp lại membership "High" từ (1000,1500,2000) → (1200,1500,2000) |
| Rule 1/5 kích hoạt liên tục | Log: "Rule X fired" | Tăng threshold: "High" từ 75 (µg/m³) → 100 (µg/m³) |
| Dữ liệu CO2 sai lúc nào cũng cao | Thêm print(f"CO2={co2}") | Kiểm tra CSV: CO2 có luôn > 1000? |

**Code Debug:**
```python
# File: backend/fuzzy/fuzzy_controller.py

def evaluate_rule(self, rule, fuzzified):
    strength, output = ...
    
    # Thêm debug
    if strength > 0:
        print(f"[RULE DEBUG] {rule['conditions']} → strength={strength:.3f}")
    
    return strength, output
```

**Code Fix:**
```python
# Hẹp membership "High" xuống
self.co2.add_membership("High", MembershipFunction(1200, 1500, 2000))
self.pm25.add_membership("High", MembershipFunction(100, 140, 200))
```

---

### 🚨 Vấn Đề 2: FAN KHÔNG BAO GIỜ BẬT (0% mãi)

**Triệu chứng:**
```
[AutoLoop] #1 [AUTO] -> 0% (Low) | MQTT=OK
[AutoLoop] #2 [AUTO] -> 0% (Low) | MQTT=OK
→ Dù CO2 = 1200 ppm vẫn tắt
```

**Nguyên Nhân & Cách Fix:**

| Nguyên Nhân | Debug | Fix |
|------------|-------|-----|
| Membership "High" quá hẹp | Tính: membership(1200) = ? | Mở rộng: (1000,1500,2000) → (800,1200,1800) |
| Tất cả rules không kích hoạt | Log từng rule strength | Thêm fallback rule không điều kiện |
| Dữ liệu invalid (NaN, -1) | print(f"CO2={co2}, valid={...}") | Validate: `if co2 < 400: co2 = 400` |

**Code Debug:**
```python
def fuzzify_inputs(self, co2, pm25, humidity, occupancy):
    # Thêm validation
    co2 = max(0, min(2000, co2))  # Clamp 0-2000
    pm25 = max(0, min(200, pm25))
    
    print(f"[FUZZIFY] CO2={co2}, PM2.5={pm25}")
    
    return {...}
```

**Code Fix:**
```python
# Mở rộng membership "High"
self.co2.add_membership("High", MembershipFunction(800, 1200, 1800))

# HOẶC thêm fallback rule
self.rules.append({
    "conditions": [],  # Luôn kích hoạt
    "output": ("VentilationLevel", "Low", 0.2)  # Mức tối thiểu 20%
})
```

---

### 🚨 Vấn Đề 3: OUTPUT KHÔNG THAY ĐỔI (Luôn 50%)

**Triệu chứng:**
```
CO2 thay đổi: 400 → 800 → 1200 → 1600 ppm
Nhưng output: 50% → 50% → 50% → 50%
```

**Nguyên Nhân & Cách Fix:**

| Nguyên Nhân | Debug | Fix |
|------------|-------|-----|
| Chỉ Rule 6 kích hoạt mãi | Log: Rule X fires, strength=... | Thêm rules cụ thể: "IF CO2 High THEN Vent High" |
| Membership functions quá phẳng | Vẽ graphs membership | Tạo curves sắc hơn: (a,b,c) spacing lớn hơn |
| Defuzzification sai | In numerator/denominator | Dùng centroid method thay vì max |

**Code Debug:**
```python
def apply_rules(self, fuzzified):
    for i, rule in enumerate(self.rules):
        strength, output = self.evaluate_rule(rule, fuzzified)
        if strength > 0:
            print(f"Rule {i} fired: {output} with strength {strength:.3f}")

def defuzzify(self, output_strengths):
    numerator = sum(...)
    denominator = sum(...)
    result = numerator / denominator if denominator > 0 else 50
    
    print(f"[DEFUZZ] Numerator={numerator}, Denominator={denominator}, Result={result}")
    return result
```

**Code Fix:**
```python
# Thêm rule High priority trước Rule 6
self.rules.insert(0, {
    "conditions": [("CO2", "High", "OR")],
    "output": ("VentilationLevel", "High", 0.95)
})

# Giới hạn từ 0-100 thay vì -10-110
self.ventilation.add_membership("Low", MembershipFunction(0, 0, 33))
self.ventilation.add_membership("Medium", MembershipFunction(25, 50, 75))
self.ventilation.add_membership("High", MembershipFunction(67, 100, 100))
```

---

### 🚨 Vấn Đề 4: DỮ LIỆU SENSOR SAI

**Triệu chứng:**
```
Dashboard hiển thị:
   CO2 = -50 ppm      ← Âm?!
   PM2.5 = 999 µg/m³  ← Quá cao?!
   Temp = 250°C       ← Sai unit?!
```

**Nguyên Nhân & Cách Fix:**

| Nguyên Nhân | Debug | Fix |
|------------|-------|-----|
| CSV bị hỏng | Mở CSV, xem dòng 1-10 | Download CSV mới hoặc fix bằng Python |
| Sai unit (ppm vs ppb) | Nếu CO2 < 100 thì đó là ppb | Nhân với 1000 nếu <100 |
| Sensor trả về error (-1, NaN) | print(type(co2), co2) | Validate: `if co2 < 0 or co2 is None: co2 = 400` |

**Code Debug:**
```python
def validate_sensor_data(record):
    valid_ranges = {
        'temperature': (-10, 50),
        'humidity': (0, 100),
        'co2': (400, 2000),
        'pm25': (0, 200),
        'occupancy': (0, 60)
    }
    
    for key, (min_val, max_val) in valid_ranges.items():
        if key in record:
            val = record[key]
            if not (min_val <= val <= max_val):
                print(f"⚠️  WARNING: {key}={val} OUT OF RANGE ({min_val}-{max_val})")
                # Nếu quá thấp/cao → dùng default
                record[key] = (min_val + max_val) / 2
    
    return record
```

**Code Fix:**
```python
# Trong load_data():
if record['co2'] < 100:  # Quá thấp → đó là ppb
    record['co2'] *= 1000
    print(f"[UNIT CONVERSION] CO2 nhân 1000: {record['co2']} ppm")

# Clamp values
record['co2'] = max(400, min(2000, record['co2']))
record['pm25'] = max(0, min(200, record['pm25']))
```

---

### 🔧 WORKFLOW DEBUG CHI TIẾT

```
[1] NHẬN THẤY LỖI
    → "Fan chạy liên tục"

[2] ENABLE DEBUG_MODE
    → Thêm print/log ở mỗi step

[3] IDENTIFY STEP BỊ LỖI
    → Chạy hệ thống, xem log
    → "Rule 1 fires with strength=0.95"? Có, vậy là rule có vấn đề

[4] ADD DETAILED LOG
    → In membership values
    → In rule conditions
    → In final output

[5] COMPARE EXPECTED vs ACTUAL
    → Expected: CO2=850 → "Medium" → Rule 6 → Output=50%
    → Actual: CO2=850 → "Medium", "High"?? → Rule 1 → Output=95%

[6] ROOT CAUSE
    → Aha! CO2 "High" membership = 0.5 khi CO2=850
    → Membership function xác định sai

[7] FIX
    → Thay membership "High" từ (1000,1500,2000) → (1200,1500,2000)

[8] TEST LẠI
    → Chạy lại, output OK → 50%

[9] DISABLE DEBUG_MODE
    → Xóa print statements, commit code
```

---

### 📊 Tóm Tắt Các Lỗi & Cách Sửa

| Lỗi | Dấu Hiệu | Nguyên Nhân | Fix |
|-----|---------|-----------|-----|
| **Over-ventilation** | Fan 100% mãi | Membership quá rộng | Hẹp membership "High" |
| **Under-ventilation** | Fan 0% mãi | Rules không kích hoạt | Thêm fallback rule |
| **Stuck output** | Luôn 50% | Chỉ Rule 6 kích hoạt | Thêm rules cụ thể |
| **Invalid sensor** | CO2=-50, Temp=999 | CSV sai hoặc sai unit | Validate & clamp values |
| **Delay MQTT** | Lệnh gửi chậm | Quá nhiều log | Giảm debug output |
| **MQTT disconnect** | "DISCONNECTED" | Không có broker | Start mosquitto hoặc remove ESP32 |
| **Missing values** | NaN dashboard | ffill().bfill() fail | Dùng forward/backward fill |

---

## 📌 QUICK REFERENCE

### Dữ Liệu
```
Input:     1000 rows CSV (9 chỉ số)
Prepare:   Load → replace('', NaN) → ffill() → bfill()
Clean:     Outliers → Missing values
Normalize: Membership functions (triangular)
```

### Training
```
Method:    Fuzzy Logic (NOT Machine Learning)
Process:   6 hand-crafted rules dựa trên kiến thức chuyên gia
Rules:     IF (conditions) THEN (output)
```

### Inference
```
Step 1:    Read input (CO2, PM2.5, Humidity, Occupancy)
Step 2:    Fuzzify (tính membership)
Step 3:    Apply rules (min/max logic)
Step 4:    Defuzzify (centroid method)
Step 5:    Decide & Send MQTT
```

### Debug
```
1. Enable DEBUG_MODE
2. Run system, see logs
3. Identify faulty step (fuzzify/rules/defuzzify?)
4. Add detailed print() statements
5. Compare expected vs actual
6. Fix membership/rules/validation
7. Test again
8. Disable DEBUG_MODE
```

---

## 📁 FILE LIÊN QUAN

```
Project Structure:
├── backend/
│   ├── fuzzy/fuzzy_controller.py     ← Membership + Rules
│   ├── services/data_service.py      ← Load + Clean data
│   ├── main.py                        ← API + Inference loop
│   └── utils/iot_controller.py       ← MQTT commands
├── data/dataset.csv                   ← 1000 rows dữ liệu
└── frontend/                          ← Dashboard React
```

---

## 🎯 CHÌA KHÓA THÀNH CÔNG

✅ **Làm tốt:**
- Dataset đầy đủ, sạch, chuẩn hóa
- Rules rõ ràng, dễ hiểu
- Có fallback rule cho edge case
- Log chi tiết để debug

❌ **Tránh:**
- Quá nhiều rules (>10)
- Membership quá phức tạp
- Không validate input
- Quên disable debug mode

💡 **Mẹo:**
- Vẽ membership functions trên giấy
- Test từng rule riêng
- Có "debug endpoint" API
- Nên có unit tests cho membership

---

**Hệ Thống HTTM = Expert System (Fuzzy Logic)**
- ✓ Dễ hiểu, giải thích được
- ✓ Nhanh (không cần training lâu)
- ✓ Không cần data khổng lồ
- ⚠️ Phải có chuyên gia thiết kế rules
- ⚠️ Khó tối ưu hơn Machine Learning

Chúc bạn thành công! 🚀
