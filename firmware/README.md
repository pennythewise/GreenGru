# Firmware — ESP32 IoT sensor stub

Optional, fully decoupled module. Reads kWh via EmonLib and publishes over MQTT
to the backend's `/api/iot/ingest` endpoint.

**Scope constraint (PRD §5, §12):** this feed goes only to the financing report's
electricity-intensity score. It has NO path into the CBAM passport or the
CBAM tariff calculation — steel is a CBAM Annex II good; only direct emissions
are priced for iron and steel.

Nothing else in the pipeline depends on this module. If it is absent, the rest of
the system is unaffected.

## Files
- `src/main.ino` — stub entry point (to be implemented if hardware demo is needed)
- `src/emon_reader.ino` — EmonLib sampling + MQTT publish stub

## Hardware
- ESP32 dev board
- SCT-013 current sensor
- ZMPT101B voltage sensor (or fixed 230 V assumption)
