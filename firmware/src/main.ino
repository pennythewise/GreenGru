// GreenGru ESP32 smart meter — Blynk + HTTP → POST /api/iot/ingest
// Scope: financing electricity score ONLY — never CBAM tariff (PRD §12).
//
// CISA grid EF (0.5568 / 0.5942 t/MWh) is applied in the GreenGru web app
// from live kWh — enterprise chooses green-power trading yes/no there.
// Do not hardcode that choice on the ESP32.
//
// If Serial Monitor is blank after upload: you were stuck in Blynk.begin().
// This sketch prints BEFORE Wi‑Fi and never blocks forever on Blynk.

#define BLYNK_TEMPLATE_ID "TMPL6ZLhm75BS"
#define BLYNK_TEMPLATE_NAME "SmartCarbonMeter"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_AUTH_TOKEN"
#define BLYNK_PRINT Serial

#include "EmonLib.h"
#include <EEPROM.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 20, 4);
bool lcdOk = false;
bool blynkOk = false;

const float vCalibration = 41.5;
const float currCalibration = 0.15;

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "YOUR_WIFI_SSID";       // 2.4 GHz only for classic ESP32
char pass[] = "YOUR_WIFI_PASSWORD";

const char* GREENGRU_HOST = "192.168.1.25";
const uint16_t GREENGRU_PORT = 8000;
const char* GREENGRU_COMPANY_ID = "demo-hengfeng";

EnergyMonitor emon;
BlynkTimer timer;

float kWh = 0.0;
unsigned long lastMillis = millis();
const int addrKWh = 12;

void sendEnergyData();
void sendEnergyDataToGreenGru(float vrms, float irms, float powerW, float kwh);
void readEnergyDataFromEEPROM();
void saveEnergyDataToEEPROM();
bool connectWifi(uint32_t timeoutMs);
bool connectBlynk(uint32_t timeoutMs);

void setup() {
  Serial.begin(115200);
  delay(1500);  // give USB-UART time after hard reset from upload
  Serial.println();
  Serial.println("=== GreenGru smart meter boot ===");
  Serial.printf("SSID=%s  GreenGru=%s:%u\n", ssid, GREENGRU_HOST, GREENGRU_PORT);

  EEPROM.begin(32);
  readEnergyDataFromEEPROM();

  emon.voltage(35, vCalibration, 1.7);
  emon.current(34, currCalibration);

  // LCD is optional — wrong library / missing panel must not hang boot
  Wire.begin();
  Wire.setTimeOut(200);
  lcdOk = true;
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.print("Booting...");
  Serial.println("LCD init done (ignore avr-architecture warning)");

  Serial.println("Connecting WiFi...");
  if (!connectWifi(20000)) {
    Serial.println("WiFi FAILED — check 2.4GHz SSID/password. Metering still runs.");
    if (lcdOk) {
      lcd.clear();
      lcd.print("WiFi FAIL");
    }
  } else {
    Serial.print("WiFi OK  IP=");
    Serial.println(WiFi.localIP());
  }

  Serial.println("Connecting Blynk...");
  blynkOk = connectBlynk(15000);
  if (blynkOk) {
    Serial.println("Blynk OK");
  } else {
    Serial.println("Blynk FAILED/timeout — GreenGru HTTP still works if WiFi is up.");
  }

  timer.setInterval(5000L, sendEnergyData);
  lastMillis = millis();
  Serial.println("Timer started — readings every 5s");
  Serial.printf("GreenGru target: http://%s:%u/api/iot/ingest\n", GREENGRU_HOST, GREENGRU_PORT);
  Serial.println("=== setup complete ===");
}

void loop() {
  if (blynkOk) {
    Blynk.run();
  }
  timer.run();
}

bool connectWifi(uint32_t timeoutMs) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  return WiFi.status() == WL_CONNECTED;
}

bool connectBlynk(uint32_t timeoutMs) {
  if (WiFi.status() != WL_CONNECTED) return false;
  Blynk.config(auth);
  uint32_t start = millis();
  while (!Blynk.connect() && (millis() - start) < timeoutMs) {
    delay(200);
    Serial.print("b");
  }
  Serial.println();
  return Blynk.connected();
}

void sendEnergyData() {
  Serial.println("--- sample ---");
  emon.calcVI(20, 2000);

  unsigned long currentMillis = millis();
  kWh += emon.apparentPower * (currentMillis - lastMillis) / 3600000000.0;
  lastMillis = currentMillis;

  Serial.printf("Vrms: %.2fV  Irms: %.4fA  Power: %.4fW  kWh: %.5f\n",
                emon.Vrms, emon.Irms, emon.apparentPower, kWh);

  saveEnergyDataToEEPROM();

  if (blynkOk && Blynk.connected()) {
    Blynk.virtualWrite(V0, emon.Vrms);
    Blynk.virtualWrite(V1, emon.Irms);
    Blynk.virtualWrite(V2, emon.apparentPower);
    Blynk.virtualWrite(V3, kWh);
  }

  sendEnergyDataToGreenGru(emon.Vrms, emon.Irms, emon.apparentPower, kWh);

  if (lcdOk) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Vrms: ");
    lcd.print(emon.Vrms, 2);
    lcd.print(" V");
    lcd.setCursor(0, 1);
    lcd.print("Irms: ");
    lcd.print(emon.Irms, 4);
    lcd.print(" A");
    lcd.setCursor(0, 2);
    lcd.print("Power: ");
    lcd.print(emon.apparentPower, 4);
    lcd.print(" W");
    lcd.setCursor(0, 3);
    lcd.print("kWh: ");
    lcd.print(kWh, 5);
  }
}

void sendEnergyDataToGreenGru(float vrms, float irms, float powerW, float kwh) {
  if (kwh <= 0.0f) {
    Serial.println("GreenGru skip: kWh must be > 0");
    return;
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("GreenGru skip: WiFi not connected");
    return;
  }

  char ts[40];
  // Unique timestamp every sample (avoids unique(company_id, reading_timestamp) collisions)
  unsigned long ms = millis();
  snprintf(ts, sizeof(ts), "2026-07-21T%02lu:%02lu:%02lu.%03lu",
           (ms / 3600000UL) % 24UL,
           (ms / 60000UL) % 60UL,
           (ms / 1000UL) % 60UL,
           ms % 1000UL);

  char url[96];
  snprintf(url, sizeof(url), "http://%s:%u/api/iot/ingest", GREENGRU_HOST, GREENGRU_PORT);

  // High-precision kWh — bulb prototypes are often 0.00001–0.05 kWh
  char body[320];
  snprintf(body, sizeof(body),
           "{\"company_id\":\"%s\",\"reading_timestamp\":\"%s\","
           "\"voltage\":%.4f,\"current\":%.6f,\"power_w\":%.6f,\"kwh\":%.8f}",
           GREENGRU_COMPANY_ID, ts, vrms, irms, powerW, kwh);

  HTTPClient http;
  http.setTimeout(5000);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  Serial.printf("GreenGru POST %d  %s\n", code, body);
  if (code > 0) {
    Serial.println(http.getString());
  } else {
    Serial.printf("HTTP error: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

void readEnergyDataFromEEPROM() {
  EEPROM.get(addrKWh, kWh);
  if (isnan(kWh)) {
    kWh = 0.0;
    saveEnergyDataToEEPROM();
  }
}

void saveEnergyDataToEEPROM() {
  EEPROM.put(addrKWh, kWh);
  EEPROM.commit();
}
