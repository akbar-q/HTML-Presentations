# EEE4015 Week 6: Physical Prototype, Integration, and A001 Evidence

Interactive 6.75-hour teaching presentation guiding a tutor-supervised, extra-low-voltage prototype or subsystem build. It emphasizes power isolation, board/module compatibility, incremental implementation, requirement-linked testing, uncertainty-aware measurement records, and two documented debug/retest examples.

## Run locally

```powershell
npm ci
npm run dev
```

Use the slide controls or arrow keys. Form fields are planning/evidence templates: they do not measure hardware and do not energize circuits.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the Pages workflow publishes it at `/EEE4015/week-06/`.

## Safety and evidence boundary

Use only tutor-approved extra-low-voltage equipment and components. Power down and isolate before changing wiring, request a tutor check before energizing a circuit, and never connect classroom prototypes to mains-powered loads. Confirm exact board/module voltages, pinouts, current limits, common references, resistor/driver needs, and supply ratings. Simulator values are not physical measurements. If hardware is unavailable, the tutor must arrange an equivalent supervised laboratory investigation for LO2; do not relabel simulation evidence as hardware evidence.
