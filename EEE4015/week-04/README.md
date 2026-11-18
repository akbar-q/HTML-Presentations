# EEE4015 Week 4: Keypads, Buzzer PWM, and Seven-Segment Displays

Interactive simulation-led lesson on matrix key scanning, event values, PWM duty cycle versus tone frequency, seven-segment mapping, polarity, and segment current limiting. The session follows the revised 6.75-hour plan.

## Run locally

```powershell
npm ci
npm run dev
```

Navigate with the on-screen controls or arrow keys. The three Tinkercad embeds load on demand and provide direct-open fallbacks.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the course Pages workflow publishes it at `/EEE4015/week-04/`.

## Safety and model limits

The keypad trainer illustrates row/column mapping and key events; verify the exact module's lead order. Buzzer behavior depends on whether the part is active or passive and its current rating. Do not drive a high-current load directly from a GPIO pin. The display trainer models a single-digit seven-segment device; common-anode and common-cathode displays use opposite logic. Use an individual current-limiting resistor for every bare segment that may be on simultaneously, and verify display pinout and ratings before physical wiring. Simulator activity is not physical hardware evidence.
