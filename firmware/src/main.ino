// ESP32 IoT sensor stub — EmonLib + MQTT
// Optional module; see firmware/README.md for scope constraints.
// Not yet implemented — complete before the Week 4 hardware demo.

#include <WiFi.h>
#include <PubSubClient.h>
#include "EmonLib.h"

// TODO: fill in before hardware demo
const char* WIFI_SSID = "";
const char* WIFI_PASS = "";
const char* MQTT_BROKER = "";  // point at Render worker
const int   MQTT_PORT = 1883;
const char* MQTT_TOPIC = "iot/readings";

EnergyMonitor emon1;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup() {
  Serial.begin(115200);
  emon1.current(34, 111.1);  // CT pin, calibration — tune per sensor datasheet
  // WiFi and MQTT init goes here
}

void loop() {
  double irms = emon1.calcIrms(1480);
  // TODO: publish JSON payload to MQTT_TOPIC
  delay(10000);
}
