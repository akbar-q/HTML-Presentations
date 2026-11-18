# EEE4015 Week 5: Displays, Motor Drivers, and System Integration

Interactive simulation-led lesson comparing parallel and I2C LCD interfaces, exploring H-bridge direction/enable logic, reviewing separate motor power, and integrating a sensor, status display, and actuator decision into a system architecture. It follows the revised 6.75-hour teaching plan.

## Run locally

```powershell
npm ci
npm run dev
```

Use the slide controls or arrow keys. The three Tinkercad embeds load on demand and provide direct-open fallbacks.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the course Pages workflow publishes it at `/EEE4015/week-05/`.

## Model boundaries and safety

Local LCD and H-bridge activities are teaching models, not electrical emulators. The I2C Tinkercad design uses address/index `0`, which is not universal for physical backpacks; verify the library, actual address, supply, and SDA/SCL pull-up voltage for the exact board. Do not copy Uno I2C pins directly to another board without checking its documentation.

The H-bridge receives logic control; motor current comes from a separately rated load supply through the driver. Never power a motor from GPIO. The supplied 9 V rectangular battery is a diagram detail, not a recommended physical motor source; verify motor startup/stall current, driver voltage drop/thermal ratings, and supply capability. Simulator activity is not physical hardware evidence.
