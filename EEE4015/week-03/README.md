# EEE4015 Week 3: Analogue Sensing, Calibration, and PWM

Interactive simulation-led lesson on voltage dividers, ADC readings, calibration, PWM brightness, threshold boundaries, hysteresis, and sensor-driven servo control. It follows the revised plan's 6.75-hour (405-minute) schedule.

## Run locally

```powershell
npm ci
npm run dev
```

Use the presentation controls or arrow keys to navigate. The Tinkercad embeds load only when opened; each also includes a direct link as a fallback.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the course Pages workflow publishes it at `/EEE4015/week-03/`.

## Model boundaries and safety

The LDR and moisture interfaces are illustrative voltage-divider and ADC models, not calibrated lux or soil-moisture meters. The supplied LDR diagram indicates A5 while the original starter code reads A0; verify the wire and code agree. The Uno's 10-bit ADC and 8-bit PWM examples are board-specific; verify the exact board and pin documentation before transferring the circuit to an ESP32.

PWM brightness is represented as a duty-cycle command and is not a true analogue output voltage. The moisture threshold and servo angles are example logic, not agronomic recommendations. Never power a servo from a GPIO pin; use a suitable supply if required and connect grounds as specified by the hardware. Simulator results are not physical test evidence.
