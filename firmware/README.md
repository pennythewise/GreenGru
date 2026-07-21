# Firmware — ESP32 IoT sensor (Blynk + GreenGru HTTP)

Optional, fully decoupled module. Reads V/I/kWh via EmonLib, pushes to **Blynk**
and also `POST`s to GreenGru `POST /api/iot/ingest`.

**Scope constraint (PRD §5, §12):** this feed goes only to the financing report's
electricity-intensity score. It has NO path into the CBAM passport or the
CBAM tariff calculation — steel is a CBAM Annex II good; only direct emissions
are priced for iron and steel.

Nothing else in the pipeline depends on this module. If it is absent, the rest of
the system is unaffected.

## Demo path (recommended)

```
ESP32 ──► Blynk gauges (keep)
      └──► HTTP POST http://<PC_LAN_IP>:8000/api/iot/ingest  → GreenGru
```

1. Start backend: `uvicorn app.main:app --reload --port 8000` (listen on `0.0.0.0` if needed).
2. Put ESP32 + PC on the **same Wi‑Fi** (ESP32 needs **2.4 GHz**, not 5 GHz-only SSIDs).
3. Set `GREENGRU_HOST` in `src/main.ino` to your PC IPv4 (e.g. `192.168.1.25`).
4. Flash with Arduino IDE; Serial Monitor @ 115200 should show `GreenGru POST 201`.

## Files

- `src/main.ino` — Blynk + HTTP ingest (bulb / shopfloor prototype)

## Hardware

- ESP32 dev board
- SCT-013 current sensor
- ZMPT101B voltage sensor
- Optional I2C LCD 20×4 @ 0x27
