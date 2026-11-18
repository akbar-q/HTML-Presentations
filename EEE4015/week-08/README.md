# EEE4015 Week 8: Test Engineering and Full-System Verification

Interactive 6.75-hour teaching presentation for A002 Task 2.2. It builds a traceable test plan, checks normal/boundary/invalid/manual/reset/recovery coverage, records observed results, supports staged debugging and retesting, and guides a team test review.

## Run locally

```powershell
npm ci
npm run dev
```

Use the slide controls or arrow keys. The interactive test builder is a record template and does not execute hardware tests. The sensor trace is labelled simulated and must not be submitted as measured evidence.

## Build

```powershell
npm run build
```

Vite writes the static presentation to `dist/`; the Pages workflow publishes it at `/EEE4015/week-08/`.

## Safety and evidence boundary

Use only tutor-approved, low-risk fault simulations. Do not create shorts, overload pins, reverse supplies, or deliberately expose equipment to unsafe conditions. Record actual observed results with setup, conditions, units, and evidence references; do not infer test success from code or fabricate results. Label simulated examples clearly. Follow the tutor's workshop and equipment procedures for any physical test.
