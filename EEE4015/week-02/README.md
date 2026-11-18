# EEE4015 Week 2: First Programs and Digital I/O

Interactive four-hour teaching presentation for introductory embedded systems. The lesson blends LED and resistor theory with short circuit investigations, Arduino digital-I/O activities, formative checks, and a team design challenge.

## Run locally

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. Use the on-screen controls or left/right arrow keys to navigate. The presentation includes a pause-animation control and respects the operating system's reduced-motion preference.

## Build

```powershell
npm run build
```

Vite writes the static site to `dist/`. The repository Pages workflow publishes it at `/EEE4015/week-02/` and imports the shared presentation shell from Week 1.

## Interactive activities

- 9 V LED resistor design bench with E12/E24 selection and resistor power checks.
- Four- and five-band resistor colour decoder with tolerance range and a quick-check question.
- Indicative LED forward-voltage reference by colour.
- Simplified LED I–V curve and resistor load-line operating point.
- Software-only overcurrent demonstration; no physical LED is overloaded.
- Local 9 V circuit topology model plus on-demand Tinkercad embeds for LED, button-input, and button-controlled LED circuits. Each embed also has a direct-open fallback.
- Button input, active-low/active-high logic, code trace, debugging cases, team challenge, and exit ticket.

The local circuit graphics and I–V curve are teaching models, not electrical emulators or component datasheets. LED forward voltage and safe current depend on the exact part, operating conditions, and manufacturer ratings. Never connect an LED directly across a supply; use one correctly calculated current-limiting resistor in each parallel LED branch. Verify physical designs against datasheets before building.
