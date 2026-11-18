# EEE4015 Week 4: Keypads, Buzzer PWM, and Seven-Segment Displays

Interactive simulation-led lesson on matrix key scanning, event values, PWM duty cycle versus tone frequency, seven-segment mapping, polarity, and segment current limiting. The session follows the revised 6.75-hour plan.

## Run locally

```powershell
npm ci
npm run dev
```

Navigate with the on-screen controls or arrow keys. The keypad map includes a step/play multiplex scanner: choose row-scan or column-scan mode, hold a virtual key, and watch the opposing input go LOW only at its matching scan intersection. The three Tinkercad embeds load on demand and provide direct-open fallbacks.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the course Pages workflow publishes it at `/EEE4015/week-04/`.

## Safety and model limits

The keypad scanner is a conceptual active-LOW model with inactive lines held HIGH; real keypad libraries also handle pin modes, scan timing, and switch debounce. Verify the exact module's lead order. Buzzer behavior depends on whether the part is active or passive and its current rating. Do not drive a high-current load directly from a GPIO pin. The display trainer models a single-digit seven-segment device; common-anode and common-cathode displays use opposite logic. Use an individual current-limiting resistor for every bare segment that may be on simultaneously, and verify display pinout and ratings before physical wiring. Simulator activity is not physical hardware evidence.
