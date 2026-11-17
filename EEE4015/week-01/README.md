# EEE4015 Week 1: System Signals

A 32-screen, projector-friendly four-hour class introducing embedded systems, input-process-output, development boards, testable requirements, safe bench practice, and the seedling-cabinet project. Explanations are deliberately paced across short screens; each concept screen includes a worked cabinet connection, a question with its answer, a class discussion prompt, and a takeaway.

## Four-hour class flow

The planned session is exactly 240 minutes, including two silent, optional 10-minute break timers. The class clock in the header shows the planned start time of each screen; the pace is a teaching guide, not a forced countdown.

| Planned time | Section |
| --- | --- |
| 00:00–00:13 | Orientation and warm-up game |
| 00:13–00:59 | Embedded-system foundations, including the first break at 00:49 |
| 00:59–01:26 | Input-process-output, feedback, and cabinet context |
| 01:26–02:18 | Scope, requirements, context diagrams, signal and power |
| 02:18–03:00 | Uno/ESP32 comparison and decision, including the second break at 02:50 |
| 03:00–04:00 | Safe bench introduction, team system challenge, peer review, and exit ticket |

The navigation uses six chapter markers instead of one button per screen. Use the arrow keys or previous/next buttons to move one screen at a time.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Use the arrow keys or the navigation buttons to move between lesson screens. The header controls pause animation and enter full screen. The bottom-right watermark is part of the presentation.

## Build and preview

```powershell
npm run build
npm run preview
```

Vite builds static files into `dist/`. The relative asset base allows the build to work at the repository Pages path as well as a root/custom-domain path.

## GitHub Pages deployment

The repository-root workflow at `.github/workflows/deploy-eee4015-week-01.yml` builds this folder and assembles the complete static site when the lesson or course index changes. The course index is at `https://edu.akbarq.com/`; this lesson is at `https://edu.akbarq.com/EEE4015/week-01/`. The 404 page also includes the unit/week index.

Push the workflow and project to the repository's `main` or `master` branch, then in GitHub open **Settings → Pages** and set the source to **GitHub Actions**. The workflow adds `edu.akbarq.com` as the deployed Pages `CNAME`. The first deployment can also be started from the workflow's **Run workflow** action.

The lesson uses no backend or secret values. If the project is moved to another repository, update the workflow's working directory and artifact path.

## Lesson content and interactions

- Gradual explanations of embedded-system purpose, MCU anatomy, timing, feedback, requirements, system boundaries, signals, power, and board constraints
- Eighteen topic-specific SVG figures: system boundaries and flows, MCU anatomy, timing, feedback, cabinet context, requirement structure, sensor/ADC sampling, output-driver paths, Uno capability, and ESP32 voltage compatibility
- An answered-question panel and “pause and ask” discussion prompt on each explanatory screen
- Embedded-versus-general-purpose warm-up and a testable-requirement mini-game
- Clickable animated signal-flow map and hardware/breadboard explorer
- Uno R3 / ESP32 profiles and board-selection scenario
- Two 10-minute break timers, a cabinet-system builder challenge, safety quiz, peer discussion, and exit ticket

Animation can be paused in the header and follows the operating system's reduced-motion preference. The visualisations are local and illustrative; board-specific technical facts must still be checked against the exact hardware documentation used in class.