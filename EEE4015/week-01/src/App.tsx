import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Cpu,
  Expand,
  Gauge,
  Lightbulb,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';

const slideNames = [
  'Start here',
  'The four-hour map',
  'Embedded or not?',
  'A system has a job',
  'Embedded vs general-purpose',
  'Embedded in everyday life',
  'A system is a team',
  'Inside the microcontroller',
  'Real-time means on time',
  'Break one / reset',
  'Input, process, output',
  'Open loop and feedback',
  'The propagation cabinet',
  'Draw the boundary',
  'Two kinds of requirement',
  'Make it testable',
  'Requirement challenge',
  'Context diagram',
  'Signal and power paths',
  'From world to data',
  'Outputs and actuators',
  'Choose by constraints',
  'Arduino Uno R3',
  'ESP32 family',
  'Board decision game',
  'Break two / reset',
  'Safe first lab',
  'Breadboard map',
  'From code to board',
  'Team system challenge',
  'Share, critique, clarify',
  'Exit ticket and next steps',
];

const slideDurations = [
  3, 3, 7, 6, 6, 4, 7, 7, 6, 10, 7, 6, 8, 6, 7, 8,
  10, 7, 8, 6, 6, 9, 7, 7, 9, 10, 8, 8, 8, 18, 9, 9,
];

const chapterMarkers = [
  { index: 0, name: 'OPENING' },
  { index: 3, name: 'EMBEDDED BASICS' },
  { index: 10, name: 'SYSTEM MODEL' },
  { index: 14, name: 'DESIGN IT' },
  { index: 21, name: 'BOARD CHOICE' },
  { index: 26, name: 'LAB + REVIEW' },
];

function formatClassTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}

function chapterForSlide(index: number) {
  for (let chapterIndex = chapterMarkers.length - 1; chapterIndex >= 0; chapterIndex -= 1) {
    if (index >= chapterMarkers[chapterIndex].index) return chapterIndex;
  }
  return 0;
}

const lessonContent: Record<number, LessonContent> = {
  4: {
    eyebrow: 'FOUNDATION / PURPOSE', title: 'Embedded is about the job, not the size.', color: 'coral',
    subtitle: 'A tiny circuit can be a computer. A large product can contain many different embedded systems.',
    points: [
      { title: 'Dedicated function', body: 'An embedded computer is designed as part of a larger product to carry out a defined task. Its software and hardware are chosen around that task, rather than supporting any application a user might install.', note: 'Example: a microwave controller reads a keypad, times a cycle, and switches outputs.' },
      { title: 'Physical interaction', body: 'It often reads signals from the environment or a user, then changes a display, motor, valve, light, or another system. The software decision is connected to something physical.', note: 'Example: a thermostat reads room temperature and switches a heating-control output.' },
      { title: 'Purpose has limits', body: 'Cost, power, size, memory, response time, and operating conditions matter. Engineers do not maximise every feature; they select enough capability to meet the requirements.', note: 'For our cabinet, local sensor readings and clear status may matter more than wireless features.' },
    ],
    question: 'Does an embedded system have to be small?', answer: 'No. “Embedded” describes its role inside a larger product and its dedicated purpose, not its physical size.',
    prompt: 'Ask: what does this device do when nobody is using its screen?', takeaway: 'Classify by purpose, integration, and behaviour, not by appearance.',
  },
  5: {
    eyebrow: 'FOUNDATION / CLASSIFY', title: 'One product can contain several computers.', color: 'blue',
    subtitle: 'The label is not always all-or-nothing. Look at the role of the particular controller you are discussing.',
    points: [
      { title: 'General-purpose computer', body: 'A laptop or desktop is built to run many unrelated programs chosen by its user. It can be reconfigured for work, media, games, analysis, or development.', note: 'Its main value is flexibility across many tasks.' },
      { title: 'Embedded controller', body: 'A controller inside a car, appliance, or piece of equipment performs a narrower function. It may run continuously and respond to inputs under defined conditions.', note: 'A vehicle can contain many embedded controllers, each with a specific responsibility.' },
      { title: 'The useful question', body: 'Ask what the component is responsible for in the larger product. A smartphone is general-purpose overall, yet it contains dedicated embedded controllers for power, radio, sensors, and other subsystems.', note: 'The system boundary determines what you are classifying.' },
    ],
    question: 'Is a smart speaker embedded or general-purpose?', answer: 'It has both aspects: it is a consumer computing product with multiple applications, and it includes dedicated embedded subsystems for audio, power, radio, and sensing.',
    prompt: 'Name one product that contains both a general-purpose computer and dedicated controllers.', takeaway: 'Be precise about the system boundary before choosing a label.',
  },
  6: {
    eyebrow: 'FOUNDATION / SYSTEM ANATOMY', title: 'A controller is one member of a system team.', color: 'lime',
    subtitle: 'Reliable behaviour comes from the parts working together, not from the processor alone.',
    points: [
      { title: 'Inputs and sensing', body: 'Sensors, switches, and communication links provide information. Their signals have electrical limits and may be noisy, disconnected, incorrectly scaled, or misunderstood.', note: 'Cabinet example: a moisture sensor provides a signal related to the growing medium.' },
      { title: 'Processing and software', body: 'The microcontroller reads inputs, follows programmed rules, and selects a state or response. Firmware means the program that runs on the embedded device.', note: 'A reading becomes useful only after the program interprets it.' },
      { title: 'Outputs, power, and context', body: 'Indicators or actuators present or apply the result. Power must support the board and connected devices; the environment and user shape what is safe and usable.', note: 'An LED is an indicator; a fan is an actuator that needs an appropriate driver.' },
    ],
    question: 'If the code is correct, is the system necessarily correct?', answer: 'No. A wrong sensor interface, unstable supply, poor requirement, unsafe output circuit, or unsuitable environment can still produce the wrong overall behaviour.',
    prompt: 'Which parts of the team need information, and which parts need energy?', takeaway: 'Think in signals, energy, decisions, users, and environment.',
  },
  7: {
    eyebrow: 'FOUNDATION / MCU ANATOMY', title: 'What is inside a microcontroller?', color: 'blue',
    subtitle: 'The chip integrates computing and useful peripherals so a small program can interact with hardware.',
    points: [
      { title: 'CPU and clock', body: 'The central processing unit fetches and executes instructions. A clock provides timing for that work and for many on-chip peripherals; clock rate alone does not determine whether a design is suitable.', note: 'The control program repeatedly checks conditions and updates outputs.' },
      { title: 'Program and working memory', body: 'Program memory stores firmware; working memory holds values while the program runs. Some microcontrollers also provide non-volatile storage for small settings. Capacities and behaviour vary by device.', note: 'Students should identify the exact board and consult its official documentation.' },
      { title: 'Pins and peripherals', body: 'GPIO handles digital signals. ADC inputs measure analogue voltage levels; timers can support timing or PWM; serial peripherals support communication. Pin multiplexing means one pin may have several possible roles.', note: 'The board pinout tells you which roles are available and which pins need care.' },
    ],
    question: 'Is a microcontroller the same thing as an Arduino board?', answer: 'No. The microcontroller is the integrated circuit. An Arduino Uno R3 is a development board built around an ATmega328P and adds practical support such as USB programming and connectors.',
    prompt: 'Point to the CPU, memory, and I/O in a simple block diagram.', takeaway: 'A board makes a microcontroller easier to use; it does not erase the chip’s limits.',
  },
  8: {
    eyebrow: 'FOUNDATION / TIMING', title: 'Real-time does not simply mean “fast.”', color: 'coral',
    subtitle: 'A real-time system is judged by whether it produces the required result before the relevant deadline.',
    points: [
      { title: 'Deadline matters', body: 'A result that arrives too late can be equivalent to a wrong result. The deadline comes from the process being controlled, not from a desire to make every task as fast as possible.', note: 'A warning light may tolerate a short delay; a protective control loop may not.' },
      { title: 'Predictable response', body: 'Engineers consider how long it takes to read an input, make a decision, and update an output. Long blocking work can stop the program checking other conditions in time.', note: 'Record a measurable response-time requirement when timing matters.' },
      { title: 'Proportionate scope', body: 'This first project is not a safety-certified real-time controller. We introduce timing vocabulary so students can identify response needs and avoid careless delays.', note: 'Later weeks examine sampling intervals and non-blocking timing in code.' },
    ],
    question: 'Does a faster processor automatically make a system real-time?', answer: 'No. The design must meet its deadlines predictably. Scheduling, software, interfaces, and worst-case delays all matter, not just clock speed.',
    prompt: 'What is the consequence if a soil-moisture warning appears five minutes late?', takeaway: 'Start with the required response, then decide what timing capability is needed.',
  },
  10: {
    eyebrow: 'SYSTEM MODEL / THE FIRST LOOP', title: 'Input → process → output is a useful first map.', color: 'blue',
    subtitle: 'It is not the whole design, but it gives us a clean way to explain what the controller does.',
    points: [
      { title: 'Input: observe', body: 'A sensor or user action supplies a value or state. The controller needs to know what the value means, its units or range, and whether it is valid.', note: '“Raw ADC code 430” is not automatically “soil is dry.”' },
      { title: 'Process: decide', body: 'Software interprets the input using a rule, threshold, mode, or state machine. A clear decision rule makes behaviour easier to explain and test.', note: 'For example, compare a calibrated reading with an agreed threshold.' },
      { title: 'Output: communicate or act', body: 'A display, LED, buzzer, or actuator shows the decision or changes the process. Electrical and power interfaces determine how the output is connected safely.', note: 'A warning LED can communicate a state without driving a physical load.' },
    ],
    question: 'Why is “sensor in, motor out” not a complete design?', answer: 'It omits signal interpretation, decision logic, power and driver circuitry, fault behaviour, user expectations, and how the output will be tested.',
    prompt: 'Say the cabinet’s input, process rule, and output in one sentence.', takeaway: 'Name the signal, the rule, and the observable result.',
  },
  11: {
    eyebrow: 'SYSTEM MODEL / CONTROL', title: 'Open loop acts. Feedback checks.', color: 'coral',
    subtitle: 'Feedback means measuring the process again after an action, then using that information in a later decision.',
    points: [
      { title: 'Open-loop example', body: 'A controller switches a lamp on for a fixed period but never measures whether the target condition was reached. It follows a schedule regardless of the actual result.', note: 'Simple and sometimes appropriate, but disturbances are not corrected by measurement.' },
      { title: 'Closed-loop example', body: 'A controller measures a condition, applies an action, and measures again. The new measurement helps decide whether to continue, stop, or change the action.', note: 'A thermostat repeatedly compares measured temperature with a target.' },
      { title: 'Feedback is not magic', body: 'The measurement can be delayed, noisy, poorly placed, or wrong. A feedback design still needs sensible thresholds, valid input checks, and safe output behaviour.', note: 'A disconnected sensor should not silently look like a healthy measurement.' },
    ],
    question: 'Does turning on an LED count as feedback?', answer: 'Not by itself. The LED is an output. Feedback exists when a later measurement of the process influences a later control decision.',
    prompt: 'Where would you measure again in the propagation cabinet?', takeaway: 'Feedback closes the loop only when the measured result changes future control.',
  },
  12: {
    eyebrow: 'SYSTEM MODEL / PROJECT STORY', title: 'The seedling cabinet makes the system concrete.', color: 'lime',
    subtitle: 'Our teaching prototype is local, low-voltage, and deliberately bounded.',
    points: [
      { title: 'The problem', body: 'Temperature, soil moisture, and lighting are checked manually. Checks can be inconsistent, and the cabinet can spend energy when it does not need to.', note: 'The brief asks for a benchtop controller, not an industrial growing installation.' },
      { title: 'The minimum prototype', body: 'Select an approved controller, read at least two inputs including one physical sensor, and control at least two low-voltage outputs. Include status and a manual or test mode.', note: 'A potentiometer may safely simulate one sensor while the first subsystem is tested.' },
      { title: 'The boundary', body: 'No direct connection to mains electricity, mains heaters, pumps, or fans. Any wireless extension is optional and brings additional design and security considerations.', note: 'A visible boundary helps teams make safe, achievable design decisions.' },
    ],
    question: 'Why begin with a benchtop prototype instead of a real cabinet?', answer: 'It lets students investigate interfaces and control behaviour safely, cheaply, and incrementally before considering the complexity of a real installation.',
    prompt: 'Which two inputs and two safe outputs could your team demonstrate?', takeaway: 'A prototype is defined partly by what it deliberately does not do.',
  },
  13: {
    eyebrow: 'SYSTEM MODEL / BOUNDARY', title: 'Define what is inside—and outside—the project.', color: 'blue',
    subtitle: 'A system boundary prevents scope creep and makes responsibility visible.',
    points: [
      { title: 'Inside the boundary', body: 'List the parts the project team designs or controls: controller board, sensor interfaces, firmware, indicators, safe low-voltage loads, and operating instructions.', note: 'A boundary diagram shows the system as one labelled box with named connections.' },
      { title: 'Outside but connected', body: 'Users, power source, growing environment, tutors, and external services may interact with the system without being part of the controller itself.', note: 'Draw arrows for information, physical effects, and power where relevant.' },
      { title: 'State exclusions', body: 'Write down what the prototype will not do. Exclusions make risk, testing, and success criteria more honest and reduce unsafe assumptions.', note: '“No mains control” is a clear engineering boundary, not a missing feature.' },
    ],
    question: 'Does a user belong inside the system boundary?', answer: 'Usually the user is outside the product boundary but belongs in the context diagram because they provide inputs, receive status, and operate the device.',
    prompt: 'Name one thing that should be outside this prototype’s boundary.', takeaway: 'A good boundary names interfaces and exclusions, not just components.',
  },
  14: {
    eyebrow: 'DESIGN / REQUIREMENT TYPES', title: 'Functional and non-functional requirements answer different questions.', color: 'coral',
    subtitle: 'Both are needed before choosing hardware or writing control code.',
    points: [
      { title: 'Functional: what it does', body: 'A functional requirement describes a behaviour or service. It should identify an input or condition and an observable response.', note: '“When moisture is below the calibrated threshold, show a warning state.”' },
      { title: 'Non-functional: how well or under what limits', body: 'A non-functional requirement describes constraints such as safety, usability, cost, power, reliability, or maintainability.', note: '“All student-facing connections remain within the tutor-approved low-voltage supply.”' },
      { title: 'Both affect design', body: 'A functional need may require a sensor and output; a safety or cost constraint can rule out a design choice. Requirements should be reviewed together for conflicts.', note: 'A wireless feature may increase cost, setup effort, and security scope.' },
    ],
    question: 'Is “use an Arduino Uno” a functional requirement?', answer: 'Usually it is a design constraint or implementation decision. The functional requirement should describe the needed system behaviour independently of the selected board.',
    prompt: 'Write one function and one safety constraint for the cabinet.', takeaway: 'Separate what the system must do from the conditions it must respect.',
  },
  15: {
    eyebrow: 'DESIGN / ACCEPTANCE CRITERIA', title: 'A testable requirement makes success observable.', color: 'blue',
    subtitle: 'Use a condition, a measurable response, and a way to verify it. Add timing or tolerance when it matters.',
    points: [
      { title: 'Name the trigger', body: 'State the initial condition, input value, operating mode, or event that causes the requirement to apply. Include boundaries when equality matters.', note: '“When the calibrated reading is below the agreed threshold…”' },
      { title: 'Name the response', body: 'Describe a visible or measurable result, not a vague quality such as “works well.” Include a time limit, count, or range when it is important to the user.', note: '“…the warning LED turns on within two seconds.”' },
      { title: 'Name the verification', body: 'Decide how you will prove it: inspection, measurement, demonstration, or a repeatable test. Expected and observed results should be recorded separately.', note: 'A test table links requirement ID, setup, input, expected result, observed result, and evidence.' },
    ],
    question: 'Should every requirement include an exact number?', answer: 'No. Use numbers where a threshold, time, range, count, or tolerance matters. The criterion must still make pass/fail clear and reproducible.',
    prompt: 'Could another team member test your sentence without asking what “dry” means?', takeaway: 'If “pass” needs interpretation, the acceptance criterion needs work.',
  },
  17: {
    eyebrow: 'DESIGN / CONTEXT', title: 'A context diagram explains who and what surrounds the system.', color: 'lime',
    subtitle: 'It answers “what interacts with this controller?” before the team draws detailed wiring.',
    points: [
      { title: 'Put the system in the centre', body: 'Draw one labelled controller-system boundary. Keep component detail out of this first view; the aim is to understand relationships and interfaces.', note: 'A detailed block diagram comes later and can show sensors and output drivers.' },
      { title: 'Name external actors', body: 'Include the user, tutor or maintainer where relevant, physical environment, and power source. Show what information, action, or energy crosses the boundary.', note: 'User command and status are different flows; power is not a data arrow.' },
      { title: 'Use the diagram to test scope', body: 'Ask whether a connection is missing, an external dependency has been hidden, or a feature is being assumed without permission.', note: 'The diagram should agree with requirements and operating narrative.' },
    ],
    question: 'Is a block diagram the same as a circuit diagram?', answer: 'No. A context or block diagram explains functions and interfaces. A circuit diagram shows electrical connections and components in enough detail to build safely.',
    prompt: 'List the user, environment, input signals, output signals, and power before drawing.', takeaway: 'A context diagram is a conversation about boundaries and interfaces.',
  },
  19: {
    eyebrow: 'MEASUREMENT / SENSOR SIGNAL', title: 'A sensor does not hand the program a meaning.', color: 'blue',
    subtitle: 'The controller reads an electrical signal. Calibration and interpretation connect that value to the physical world.',
    points: [
      { title: 'Physical quantity to electrical signal', body: 'A sensor or transducer responds to temperature, moisture, light, or another quantity by changing an electrical property or producing a digital message.', note: 'Check the module’s supply and output voltage before choosing a board pin.' },
      { title: 'Signal to numeric sample', body: 'An analogue-to-digital converter samples an input voltage and represents it as a digital code. Resolution is not the same as accuracy; noise, reference voltage, wiring, and sensor tolerance also matter.', note: 'Uno and ESP32 ADC behaviour is not automatically identical.' },
      { title: 'Sample to useful decision', body: 'The program may filter, calibrate, scale, validate, and compare the reading. Until those steps are defined, a raw number is not a trustworthy measurement.', note: 'Test normal, threshold, and implausible readings in later weeks.' },
    ],
    question: 'If an ADC returns 500, does that mean 500 units of moisture?', answer: 'No. It is a code in the board’s ADC range. A sensor model and calibration are needed before relating that code to an engineering quantity.',
    prompt: 'What would make a reading invalid even if it is a number?', takeaway: 'Measure first, interpret carefully, validate before acting.',
  },
  20: {
    eyebrow: 'OUTPUT / ELECTRICAL INTERFACE', title: 'An output pin is a signal—not a power supply.', color: 'coral',
    subtitle: 'Indicators and actuators have different jobs, but both need a compatible electrical interface.',
    points: [
      { title: 'Indicators communicate', body: 'An LED, display, or buzzer can show status to a user. A bare LED needs a suitable current-limiting resistor, correct polarity, and a board pin configured for its logic voltage.', note: 'A warning state should be clear and not rely on colour alone.' },
      { title: 'Actuators change the process', body: 'Motors, fans, servos, pumps, and relays may need more current or a separate supply. A GPIO pin normally controls a suitable driver rather than powering the load.', note: 'Follow the exact driver, load, and protection-circuit documentation.' },
      { title: 'Power and logic are related but distinct', body: 'A common reference ground may be required for control signals, while the load has its own supply path. Confirm the whole circuit before connecting power.', note: 'This class prototype must never connect directly to mains loads.' },
    ],
    question: 'Can an Uno pin drive a DC fan if it only runs briefly?', answer: 'Do not assume that. GPIO current and voltage limits still apply. Use a tutor-approved driver circuit and supply for the specific fan.',
    prompt: 'Point to the logic path and the load-current path in a driver diagram.', takeaway: 'Design both the command signal and the energy path.',
  },
  21: {
    eyebrow: 'PLATFORM / SELECTION METHOD', title: 'Choose a board by matching constraints to evidence.', color: 'lime',
    subtitle: 'The right choice is the simplest board that can safely meet the requirements and leave enough room for planned tests.',
    points: [
      { title: 'Count interfaces', body: 'List required digital inputs/outputs, analogue inputs, PWM or timers, and any UART, I2C, or SPI connections. Check whether pins have special restrictions or shared functions.', note: 'A pin map helps reveal conflicts before the team builds.' },
      { title: 'Check voltage and power', body: 'Compare board logic levels with every sensor and output module. Check supply requirements, regulator capacity, and whether loads need a separate approved low-voltage source.', note: 'A 5 V sensor output must not feed an ESP32 3.3 V-only input directly.' },
      { title: 'Consider workflow and growth', body: 'Compare programming tools, memory, cost, available documentation, and future connectivity. Do not select Wi-Fi just because it is available if the requirement is local operation.', note: 'Record the trade-off and cite the exact board documentation.' },
    ],
    question: 'Is there one universally best beginner board?', answer: 'No. Board choice depends on the system requirements, available hardware, teaching tools, signal levels, and the student’s design rationale.',
    prompt: 'Which requirement would make wireless capability worth its extra complexity?', takeaway: 'Justify the board against a requirement, not a brand preference.',
  },
  22: {
    eyebrow: 'PLATFORM / UNO R3', title: 'Uno R3: clear local I/O for a first controller.', color: 'coral',
    subtitle: 'The standard Uno R3 is based on the ATmega328P and is widely documented for introductory work.',
    points: [
      { title: 'Useful starting resources', body: 'The Uno R3 provides 14 digital I/O pins, six analogue inputs, and six PWM-capable digital pins. These features support simple sensors, indicators, and introductory timing or PWM demonstrations.', note: 'Pin functions and electrical limits still need checking in official documentation.' },
      { title: 'Straightforward local workflow', body: 'USB supports programming and serial communication in common Arduino teaching workflows. The board does not include Wi-Fi, which keeps this project local unless an external interface is added.', note: 'A direct serial cable is useful for observing and debugging early code.' },
      { title: 'Know the trade-offs', body: 'The Uno R3 uses 5 V logic, has limited memory compared with many modern wireless boards, and must be planned against its available pins and peripherals.', note: 'A board can be sufficient for the project without supporting every possible extension.' },
    ],
    question: 'Does “5 V board” mean every connected module is safe at 5 V?', answer: 'No. Check the exact module’s supply and signal specifications. A board’s logic voltage does not make every attached component compatible.',
    prompt: 'Which Uno pin features could your two inputs and two outputs use?', takeaway: 'The exact board specification is more useful than a generic “Arduino” label.',
  },
  23: {
    eyebrow: 'PLATFORM / ESP32 FAMILY', title: 'ESP32: more capability, more variant checks.', color: 'blue',
    subtitle: 'ESP32 is a family of microcontrollers and boards, not one identical pinout or feature set.',
    points: [
      { title: 'Connectivity can be useful', body: 'Many ESP32 development boards offer wireless capability and more processing or memory resources than an Uno R3. That can support future monitoring, but the project does not require networking.', note: 'A network link creates setup, credential, and security responsibilities.' },
      { title: 'Logic is typically 3.3 V', body: 'ESP32 GPIO generally uses 3.3 V logic and is not 5 V tolerant. A 5 V output must not be connected directly to a 3.3 V-only input; check level-shifting or compatible modules.', note: 'Never infer electrical tolerance from a connector shape or product photo.' },
      { title: 'Verify the exact board', body: 'Pin availability, ADC behaviour, input-only pins, boot-strapping pins, PWM APIs, USB interface, and wireless features vary by exact model and board design.', note: 'Write the full model name in the design rationale and pin-allocation table.' },
    ],
    question: 'Can I use an ESP32 board as a drop-in Uno replacement?', answer: 'Not without checking. Pin numbering, voltage, ADC characteristics, PWM setup, boot pins, and libraries may differ. Revalidate the circuit and code for that exact board.',
    prompt: 'What must you verify before connecting a 5 V sensor module?', takeaway: 'Connectivity is an option; electrical compatibility is a requirement.',
  },
  28: {
    eyebrow: 'FIRST LAB / DEVELOPMENT LOOP', title: 'From source code to a running board.', color: 'lime',
    subtitle: 'Week 1 is about proving the toolchain and learning how to observe what the board is doing.',
    points: [
      { title: 'Edit and compile', body: 'The IDE or editor turns source code into a program for the chosen board. A compile error means the program did not build; it is not the same as a runtime logic error.', note: 'Read the first useful error line and make one change at a time.' },
      { title: 'Upload and run', body: 'The program is transferred over USB or another supported programmer, then runs after reset or power-up. Confirm the selected board and port before uploading.', note: 'A known-good starter sketch helps separate toolchain problems from project-code problems.' },
      { title: 'Observe and record', body: 'Serial output can expose states and readings during development. Label values and units, capture a reproducible test, and record what was expected as well as what happened.', note: 'A screenshot of code alone does not prove that the hardware behaved as intended.' },
    ],
    question: 'What does a successful compile prove?', answer: 'Only that the source passed the compiler checks for the selected build target. It does not prove the wiring, sensor readings, control logic, or output behaviour is correct.',
    prompt: 'What would you print to Serial to show a measurement and the current controller state?', takeaway: 'Compile, upload, run, observe, test, and record are separate steps.',
  },
};

type LessonPoint = { title: string; body: string; note: string };
type LessonContent = {
  eyebrow: string;
  title: string;
  color: 'lime' | 'coral' | 'blue';
  subtitle: string;
  points: LessonPoint[];
  question: string;
  answer: string;
  prompt: string;
  takeaway: string;
};

type VisualKind =
  | 'embedded-role' | 'classification' | 'system-team' | 'mcu-anatomy' | 'deadline'
  | 'ipo-loop' | 'feedback' | 'cabinet' | 'boundary' | 'requirement-types'
  | 'requirement-test' | 'context' | 'sensor-chain' | 'output-drive' | 'selection'
  | 'uno-profile' | 'esp32-levels' | 'toolchain';

const teachingVisuals: Record<number, VisualKind> = {
  4: 'embedded-role',
  5: 'classification',
  6: 'system-team',
  7: 'mcu-anatomy',
  8: 'deadline',
  10: 'ipo-loop',
  11: 'feedback',
  12: 'cabinet',
  13: 'boundary',
  14: 'requirement-types',
  15: 'requirement-test',
  17: 'context',
  19: 'sensor-chain',
  20: 'output-drive',
  21: 'selection',
  22: 'uno-profile',
  23: 'esp32-levels',
  28: 'toolchain',
};

const visualDetails: Record<VisualKind, { title: string; caption: string; description: string }> = {
  'embedded-role': { title: 'INSIDE A PRODUCT', caption: 'Dedicated controller, connected to the wider product.', description: 'A larger product contains a dedicated embedded controller connected to sensors and outputs.' },
  classification: { title: 'SCOPE CHANGES THE LABEL', caption: 'One product can contain both flexible and dedicated computing.', description: 'A laptop runs many applications while dedicated controllers inside a product perform specific jobs.' },
  'system-team': { title: 'SYSTEM TEAM', caption: 'Signals inform decisions; power enables physical action.', description: 'Inputs connect to a controller, which drives an output, with power and the environment around the system.' },
  'mcu-anatomy': { title: 'INSIDE THE MCU', caption: 'CPU, memory, and peripherals share one integrated device.', description: 'A central CPU connects to program memory, working memory, GPIO, ADC, timers, and serial interfaces.' },
  deadline: { title: 'RESPONSE HAS A DEADLINE', caption: 'A useful result must arrive before the process needs it.', description: 'A timeline compares an input event, decision, output response, and required deadline.' },
  'ipo-loop': { title: 'THE FIRST CONTROL MODEL', caption: 'Name what enters, what the rule decides, and what can be observed.', description: 'A sensor reading flows to a software decision, then to a visible or physical output.' },
  feedback: { title: 'OPEN LOOP / CLOSED LOOP', caption: 'Feedback returns a new measurement to influence the next decision.', description: 'Open-loop control acts without measuring the result; closed-loop control measures the process again.' },
  cabinet: { title: 'CABINET PROTOTYPE', caption: 'A low-voltage teaching model, not a mains-controlled installation.', description: 'A seedling cabinet contains a sensor and controller driving low-voltage status outputs.' },
  boundary: { title: 'SYSTEM BOUNDARY', caption: 'Show interfaces crossing into and out of the team’s design.', description: 'The controller system boundary separates internal components from user, environment, and power source.' },
  'requirement-types': { title: 'TWO REQUIREMENT LENSES', caption: 'Behaviour plus constraints shape a complete design.', description: 'Functional requirements describe system behaviour; non-functional requirements define safety, cost, power, and quality constraints.' },
  'requirement-test': { title: 'FROM WORDS TO EVIDENCE', caption: 'Trigger + measurable response + verification = a testable requirement.', description: 'A requirement is decomposed into a trigger, measurable response, and verification evidence.' },
  context: { title: 'CONTEXT MAP', caption: 'External actors exchange information, energy, or physical effects.', description: 'A controller sits inside its boundary and interacts with user, environment, and power source.' },
  'sensor-chain': { title: 'MEASUREMENT CHAIN', caption: 'Physical quantity → signal → sample → interpreted value.', description: 'A physical condition becomes an electrical signal, an ADC sample, and then a calibrated decision input.' },
  'output-drive': { title: 'TWO DIFFERENT PATHS', caption: 'GPIO carries a command; a suitable driver handles load power.', description: 'A low-current logic signal controls a driver switch while a separate low-voltage supply powers an actuator.' },
  selection: { title: 'MATCH THE REQUIREMENT', caption: 'Choose only after checking pins, voltage, power, and capability.', description: 'A board selection checklist compares required I/O, logic voltage, supply, and connectivity.' },
  'uno-profile': { title: 'UNO R3 AT A GLANCE', caption: 'Useful local I/O; no built-in wireless; check exact pin limits.', description: 'Uno R3 capability summary showing digital pins, analogue inputs, PWM pins, logic level, and USB workflow.' },
  'esp32-levels': { title: 'ESP32 FAMILY / 3.3 V LOGIC', caption: 'Model variants differ. Never connect a 5 V signal directly to GPIO.', description: 'A 5 V output is shown as incompatible with a 3.3 V ESP32 input unless an appropriate interface is used.' },
  toolchain: { title: 'DEVELOPMENT LOOP', caption: 'A successful compile is only one checkpoint in the process.', description: 'Source code is compiled, uploaded to the board, run, observed, and tested.' },
};

type AppProps = {
  addPoints: (amount: number) => void;
  motionEnabled: boolean;
};

function App() {
  const [slide, setSlide] = useState(0);
  const [points, setPoints] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const reducedMotion = useReducedMotion();
  const animationsOn = motionEnabled && !reducedMotion;
  const minutesAtSlide = slideDurations.slice(0, slide).reduce((total, duration) => total + duration, 0);
  const activeChapter = chapterForSlide(slide);

  const addPoints = (amount: number) => setPoints((current) => current + amount);
  const goTo = (index: number) => setSlide(Math.min(slideNames.length - 1, Math.max(0, index)));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        setSlide((current) => Math.min(slideNames.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setSlide((current) => Math.max(0, current - 1));
      }
      if (event.key === 'Home') setSlide(0);
      if (event.key === 'End') setSlide(slideNames.length - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.title = `EEE4015 / Week 01 — ${slideNames[slide]}`;
  }, [slide]);

  const slideProps: AppProps = { addPoints, motionEnabled: animationsOn };

  return (
    <div className="app-shell" data-motion={animationsOn ? 'on' : 'off'}>
      <header className="topbar">
        <div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems">
          <span className="course-mark__symbol"><Cpu size={21} strokeWidth={2.2} /></span>
          <span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span>
        </div>

        <div className="topbar-center">
          <span className="week-tag">WEEK 01</span>
          <span className="topbar-divider" aria-hidden="true" />
          <span className="topbar-lesson">{slideNames[slide]}</span>
          <span className="topbar-time"><small>PACE</small><b>{formatClassTime(minutesAtSlide)}<i>/</i>04:00</b></span>
        </div>

        <div className="topbar-tools">
          <div className="score-chip" aria-live="polite" title="Class challenge points">
            <Sparkles size={16} aria-hidden="true" /><span>{points} XP</span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setMotionEnabled((enabled) => !enabled)}
            aria-label={motionEnabled ? 'Pause animations' : 'Play animations'}
            title={motionEnabled ? 'Pause animations' : 'Play animations'}
          >
            {motionEnabled ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            className="icon-button fullscreen-button"
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
              else void document.exitFullscreen?.();
            }}
            aria-label="Toggle full screen"
            title="Toggle full screen"
          >
            <Expand size={17} />
          </button>
        </div>
      </header>

      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatClassTime(minutesAtSlide)} of 04:00`}>
        <motion.div
          className="progress-track__fill"
          initial={false}
          animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }}
          transition={{ duration: animationsOn ? 0.45 : 0 }}
        />
        <span className="progress-track__glint" aria-hidden="true" />
      </div>

      <main className="stage" id="lesson-content">
        <div className="stage-grid" aria-hidden="true" />
        <div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            className="slide"
            key={slide}
            aria-labelledby={`slide-title-${slide}`}
            initial={animationsOn ? { opacity: 0, y: 18, filter: 'blur(6px)' } : false}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={animationsOn ? { opacity: 0, y: -12, filter: 'blur(4px)' } : { opacity: 0 }}
            transition={{ duration: animationsOn ? 0.34 : 0, ease: 'easeOut' }}
          >
            {renderSlide(slide, slideProps, () => goTo(2))}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="bottombar">
        <div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div>
        <nav className="slide-dots" aria-label="Lesson chapters">
          {chapterMarkers.map((chapter, index) => (
            <button
              key={chapter.name}
              type="button"
              className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`}
              aria-label={`Go to chapter ${index + 1}: ${chapter.name}`}
              aria-current={activeChapter === index ? 'step' : undefined}
              onClick={() => goTo(chapter.index)}
            />
          ))}
        </nav>
        <div className="bottom-controls">
          <span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span>
          <button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide">
            <ArrowLeft size={18} />
          </button>
          <button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide">
            <span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18} />
          </button>
        </div>
      </footer>

      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, props: AppProps, startMission: () => void) {
  switch (index) {
    case 0: return <WelcomeSlide {...props} onStart={startMission} />;
    case 1: return <ScheduleSlide />;
    case 2: return <WarmupSlide {...props} />;
    case 3: return <SystemSlide motionEnabled={props.motionEnabled} />;
    case 9: return <BreakSlide kind={1} />;
    case 16: return <RequirementSlide {...props} />;
    case 18: return <SignalSlide motionEnabled={props.motionEnabled} />;
    case 24: return <BoardSlide {...props} />;
    case 25: return <BreakSlide kind={2} />;
    case 26: return <SafetySlide {...props} />;
    case 27: return <BenchSlide motionEnabled={props.motionEnabled} />;
    case 29: return <BuilderSlide {...props} />;
    case 30: return <ReviewSlide />;
    case 31: return <ExitSlide />;
    default: return <TeachingSlide index={index} data={lessonContent[index]} />;
  }
}

function Eyebrow({ children, color = 'lime' }: { children: React.ReactNode; color?: 'lime' | 'coral' | 'blue' }) {
  return <div className={`eyebrow eyebrow--${color}`}><span className="eyebrow__dot" />{children}</div>;
}

function SlideHeading({
  eyebrow,
  title,
  subtitle,
  id,
  color,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  id: string;
  color?: 'lime' | 'coral' | 'blue';
}) {
  return (
    <div className="slide-heading">
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h1 id={id}>{title}</h1>
      {subtitle && <p className="slide-subtitle">{subtitle}</p>}
    </div>
  );
}

function TeachingSlide({ index, data }: { index: number; data: LessonContent }) {
  return (
    <article className="teaching-layout">
      <header className="teaching-heading">
        <SlideHeading id={`slide-title-${index}`} eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} color={data.color} />
        <div className="reading-time"><span>TAKE YOUR TIME</span><b>{slideDurations[index]}<small>MIN</small></b></div>
      </header>
      <div className="teaching-body">
        <div className="teaching-points">
          {data.points.map((point, pointIndex) => (
            <article className="teaching-point" key={point.title}>
              <span className={`teaching-point__number teaching-point__number--${data.color}`}>0{pointIndex + 1}</span>
              <div><h2>{point.title}</h2><p>{point.body}</p><small>{point.note}</small></div>
            </article>
          ))}
        </div>
        <aside className="teaching-aside">
          <VisualPanel kind={teachingVisuals[index] ?? 'system-team'} />
          <div className={`answer-card answer-card--${data.color}`}>
            <span className="answer-card__label"><CircleHelp size={15} /> A QUESTION WE SHOULD ANSWER</span>
            <h2>{data.question}</h2>
            <p>{data.answer}</p>
          </div>
          <div className="class-prompt"><span>PAUSE & ASK</span><p>{data.prompt}</p></div>
        </aside>
      </div>
      <div className="lesson-takeaway"><Lightbulb size={18} /><span>TAKEAWAY</span><p>{data.takeaway}</p><small>{formatClassTime(slideDurations.slice(0, index).reduce((total, duration) => total + duration, 0))} START</small></div>
    </article>
  );
}

function VisualPanel({ kind }: { kind: VisualKind }) {
  const info = visualDetails[kind];
  return (
    <figure className={`visual-panel visual-panel--${kind}`}>
      <div className="visual-panel__heading"><span>{info.title}</span><i>FIG. {String(Object.keys(teachingVisuals).indexOf(Object.entries(teachingVisuals).find(([, value]) => value === kind)?.[0] ?? '') + 1).padStart(2, '0')}</i></div>
      <svg className="lesson-visual" viewBox="0 0 360 142" role="img" aria-label={info.description}>
        {renderLessonVisual(kind)}
      </svg>
      <figcaption>{info.caption}</figcaption>
    </figure>
  );
}

function VisualBlock({ x, y, width, height, title, sub, tone = 'lime' }: { x: number; y: number; width: number; height: number; title: string; sub?: string; tone?: 'lime' | 'coral' | 'blue' }) {
  return (
    <g className={`visual-block visual-block--${tone}`}>
      <rect x={x} y={y} width={width} height={height} rx="5" />
      <text x={x + width / 2} y={y + (sub ? height / 2 - 2 : height / 2 + 4)} textAnchor="middle" className="visual-block__title">{title}</text>
      {sub && <text x={x + width / 2} y={y + height / 2 + 14} textAnchor="middle" className="visual-block__sub">{sub}</text>}
    </g>
  );
}

function renderLessonVisual(kind: VisualKind) {
  switch (kind) {
    case 'embedded-role':
      return <><rect className="visual-product" x="16" y="17" width="328" height="106" rx="8" /><text x="28" y="35" className="visual-label">LARGER PRODUCT</text><VisualBlock x={34} y={51} width={92} height={45} title="SENSOR" sub="physical input" tone="blue" /><VisualBlock x={143} y={47} width={104} height={54} title="CONTROLLER" sub="dedicated job" /><VisualBlock x={264} y={51} width={62} height={45} title="OUTPUT" sub="response" tone="coral" /><path d="M126 73 H139 M247 73 H260" className="visual-connector" /><circle cx="132" cy="73" r="3" className="visual-signal-dot" /><circle cx="253" cy="73" r="3" className="visual-signal-dot visual-signal-dot--delay" /><text x="180" y="114" textAnchor="middle" className="visual-small-label">ONE PRODUCT · ONE DEFINED RESPONSIBILITY</text></>;
    case 'classification':
      return <><rect x="14" y="20" width="157" height="104" rx="7" className="visual-card-bg" /><rect x="189" y="20" width="157" height="104" rx="7" className="visual-card-bg" /><text x="27" y="38" className="visual-label">GENERAL PURPOSE</text><text x="202" y="38" className="visual-label">DEDICATED CONTROL</text><rect x="31" y="50" width="54" height="42" rx="4" className="visual-outline-blue" /><rect x="38" y="55" width="40" height="29" rx="2" className="visual-screen" /><rect x="99" y="51" width="54" height="12" rx="3" className="visual-app" /><rect x="99" y="68" width="54" height="12" rx="3" className="visual-app visual-app--coral" /><rect x="99" y="85" width="54" height="12" rx="3" className="visual-app visual-app--blue" /><text x="58" y="110" textAnchor="middle" className="visual-small-label">MANY TASKS</text><rect x="204" y="52" width="53" height="43" rx="5" className="visual-chip" /><text x="230" y="70" textAnchor="middle" className="visual-micro-label">MCU</text><path d="M257 62 H280 M257 84 H280" className="visual-connector" /><rect x="282" y="52" width="49" height="14" rx="3" className="visual-app" /><rect x="282" y="75" width="49" height="14" rx="3" className="visual-app visual-app--coral" /><text x="278" y="110" textAnchor="middle" className="visual-small-label">ONE MAIN JOB</text></>;
    case 'system-team':
      return <><text x="14" y="18" className="visual-label">INFORMATION PATH</text><VisualBlock x={14} y={30} width={92} height={42} title="INPUTS" sub="sensor · user" tone="blue" /><VisualBlock x={133} y={30} width={94} height={42} title="DECISION" sub="firmware" /><VisualBlock x={254} y={30} width={92} height={42} title="OUTPUTS" sub="indicator · load" tone="coral" /><path d="M106 51 H130 M227 51 H251" className="visual-connector" /><path d="M180 81 V102 H302 V76" className="visual-power-path" /><text x="229" y="118" textAnchor="middle" className="visual-power-label">ENERGY PATH / LOW VOLTAGE</text><circle cx="116" cy="51" r="3" className="visual-signal-dot" /><circle cx="237" cy="51" r="3" className="visual-signal-dot visual-signal-dot--delay" /></>;
    case 'mcu-anatomy':
      return <><rect x="130" y="29" width="101" height="83" rx="8" className="visual-chip" /><text x="180" y="67" textAnchor="middle" className="visual-block__title">CPU</text><text x="180" y="84" textAnchor="middle" className="visual-block__sub">fetch · execute</text><VisualBlock x={14} y={23} width={89} height={38} title="PROGRAM" sub="flash" tone="blue" /><VisualBlock x={14} y={79} width={89} height={38} title="WORKING" sub="RAM" tone="blue" /><VisualBlock x={259} y={20} width={86} height={31} title="GPIO" sub="digital pins" tone="coral" /><VisualBlock x={259} y={57} width={86} height={31} title="ADC" sub="analogue" tone="coral" /><VisualBlock x={259} y={94} width={86} height={31} title="TIMERS" sub="serial · PWM" tone="coral" /><path d="M103 42 H126 M103 98 H126 M231 44 H255 M231 72 H255 M231 108 H255" className="visual-connector" /><text x="180" y="133" textAnchor="middle" className="visual-small-label">PERIPHERALS CONNECT TO THE CPU VIA INTERNAL BUSES</text></>;
    case 'deadline':
      return <><text x="14" y="21" className="visual-label">EVENT TIMELINE</text><line x1="30" y1="54" x2="333" y2="54" className="visual-axis" /><line x1="252" y1="35" x2="252" y2="112" className="visual-deadline" /><text x="252" y="29" textAnchor="middle" className="visual-coral-label">DEADLINE</text><circle cx="55" cy="54" r="7" className="visual-node visual-node--blue" /><circle cx="148" cy="54" r="7" className="visual-node" /><circle cx="218" cy="54" r="7" className="visual-node visual-node--coral" /><text x="55" y="83" textAnchor="middle" className="visual-small-label">INPUT</text><text x="148" y="83" textAnchor="middle" className="visual-small-label">DECIDE</text><text x="218" y="83" textAnchor="middle" className="visual-small-label">RESPOND</text><path d="M58 103 H244" className="visual-measure-line" /><path d="M58 99 V107 M244 99 V107" className="visual-measure-tick" /><text x="151" y="121" textAnchor="middle" className="visual-small-label">REQUIRED RESPONSE WINDOW</text><path d="M252 101 H329" className="visual-late-line" /><text x="290" y="121" textAnchor="middle" className="visual-small-label visual-late-text">TOO LATE</text></>;
    case 'ipo-loop':
      return <><text x="15" y="18" className="visual-label">THREE QUESTIONS</text><VisualBlock x={14} y={39} width={94} height={59} title="WHAT CHANGED?" sub="read an input" tone="blue" /><VisualBlock x={133} y={39} width={94} height={59} title="WHAT RULE?" sub="make a decision" /><VisualBlock x={252} y={39} width={94} height={59} title="WHAT HAPPENS?" sub="observe output" tone="coral" /><path d="M108 68 H129 M227 68 H248" className="visual-connector" /><circle cx="118" cy="68" r="3" className="visual-signal-dot" /><circle cx="238" cy="68" r="3" className="visual-signal-dot visual-signal-dot--delay" /><text x="180" y="124" textAnchor="middle" className="visual-small-label">MEASUREMENT → RULE → VISIBLE RESULT</text></>;
    case 'feedback':
      return <><text x="15" y="25" className="visual-label">OPEN LOOP</text><VisualBlock x={15} y={35} width={82} height={36} title="TIMER" sub="fixed action" tone="coral" /><path d="M97 53 H151" className="visual-connector visual-connector--coral" /><VisualBlock x={154} y={35} width={82} height={36} title="LAMP" sub="no re-check" tone="coral" /><text x="15" y="88" className="visual-label">CLOSED LOOP</text><VisualBlock x={15} y={98} width={75} height={33} title="SENSOR" sub="measure" tone="blue" /><VisualBlock x={142} y={98} width={75} height={33} title="RULE" sub="compare" /><VisualBlock x={270} y={98} width={75} height={33} title="OUTPUT" sub="adjust" tone="coral" /><path d="M90 114 H139 M217 114 H267" className="visual-connector" /><path d="M308 96 V81 H52 V95" className="visual-feedback-path" /><text x="180" y="79" textAnchor="middle" className="visual-small-label">MEASURE AGAIN</text></>;
    case 'cabinet':
      return <><rect x="88" y="20" width="185" height="108" rx="4" className="visual-glass" /><path d="M88 20 V128 M273 20 V128 M88 128 H273 M96 28 H265" className="visual-cabinet-frame" /><path d="M100 121 H260" className="visual-soil" /><path d="M181 117 C178 99 168 91 166 75 M181 99 C194 93 198 82 198 72 M179 103 C164 100 157 91 155 84" className="visual-plant" /><ellipse cx="163" cy="78" rx="13" ry="6" transform="rotate(28 163 78)" className="visual-leaf" /><ellipse cx="198" cy="73" rx="13" ry="6" transform="rotate(-22 198 73)" className="visual-leaf visual-leaf--two" /><ellipse cx="156" cy="86" rx="10" ry="5" transform="rotate(25 156 86)" className="visual-leaf visual-leaf--two" /><VisualBlock x={12} y={47} width={65} height={37} title="SENSOR" sub="moisture" tone="blue" /><VisualBlock x={281} y={47} width={67} height={37} title="STATUS" sub="LEDs" tone="coral" /><path d="M77 65 H87 M273 65 H278" className="visual-connector" /><path d="M111 42 H249" className="visual-lamp" /><text x="180" y="15" textAnchor="middle" className="visual-small-label">LOCAL LOW-VOLTAGE PROTOTYPE</text><text x="180" y="139" textAnchor="middle" className="visual-coral-label">NO MAINS LOADS</text></>;
    case 'boundary':
      return <><rect x="100" y="26" width="160" height="93" rx="8" className="visual-boundary" /><text x="180" y="43" textAnchor="middle" className="visual-label">SYSTEM BOUNDARY</text><VisualBlock x={127} y={56} width={107} height={42} title="CONTROLLER" sub="inside the design" /><VisualBlock x={8} y={49} width={69} height={39} title="USER" sub="outside" tone="blue" /><VisualBlock x={284} y={49} width={68} height={39} title="GROWING" sub="environment" tone="coral" /><path d="M77 68 H96 M264 68 H280" className="visual-connector" /><path d="M180 122 V136" className="visual-power-path" /><text x="180" y="139" textAnchor="middle" className="visual-small-label">POWER ENTERS THE BOUNDARY</text><text x="180" y="111" textAnchor="middle" className="visual-small-label">INTERFACES CROSS THE EDGE</text></>;
    case 'requirement-types':
      return <><rect x="15" y="22" width="156" height="101" rx="7" className="visual-card-bg" /><rect x="189" y="22" width="156" height="101" rx="7" className="visual-card-bg" /><text x="29" y="43" className="visual-blue-label">FUNCTIONAL</text><text x="203" y="43" className="visual-coral-label">NON-FUNCTIONAL</text><VisualBlock x={30} y={55} width={126} height={45} title="WHAT IT DOES" sub="measure → warn" tone="blue" /><VisualBlock x={204} y={55} width={126} height={45} title="WHAT LIMITS IT" sub="safe · cost · power" tone="coral" /><text x="180" y="117" textAnchor="middle" className="visual-small-label">BEHAVIOUR + CONSTRAINTS = DESIGN NEED</text></>;
    case 'requirement-test':
      return <><VisualBlock x={10} y={31} width={96} height={60} title="TRIGGER" sub="input < threshold" tone="blue" /><VisualBlock x={132} y={31} width={96} height={60} title="RESPONSE" sub="LED ≤ 2 seconds" /><VisualBlock x={254} y={31} width={96} height={60} title="VERIFY" sub="record result" tone="coral" /><path d="M106 61 H129 M228 61 H251" className="visual-connector" /><path d="M37 111 H323" className="visual-measure-line" /><circle cx="37" cy="111" r="4" className="visual-node visual-node--blue" /><circle cx="180" cy="111" r="4" className="visual-node" /><circle cx="323" cy="111" r="4" className="visual-node visual-node--coral" /><text x="180" y="133" textAnchor="middle" className="visual-small-label">PASS / FAIL IS OBSERVABLE</text></>;
    case 'context':
      return <><rect x="115" y="33" width="130" height="76" rx="8" className="visual-boundary" /><text x="180" y="53" textAnchor="middle" className="visual-label">CABINET</text><VisualBlock x={137} y={63} width={86} height={30} title="CONTROLLER" /><VisualBlock x={12} y={44} width={76} height={44} title="USER" sub="command" tone="blue" /><VisualBlock x={272} y={44} width={76} height={44} title="WORLD" sub="conditions" tone="coral" /><VisualBlock x={143} y={116} width={74} height={23} title="POWER" tone="blue" /><path d="M88 66 H111 M249 66 H269 M180 109 V113" className="visual-connector" /><text x="99" y="58" className="visual-small-label">INPUT</text><text x="252" y="58" className="visual-small-label">SENSE</text></>;
    case 'sensor-chain':
      return <><VisualBlock x={9} y={24} width={71} height={42} title="WORLD" sub="moisture" tone="blue" /><VisualBlock x={99} y={24} width={71} height={42} title="SENSOR" sub="voltage" /><VisualBlock x={189} y={24} width={71} height={42} title="ADC" sub="raw code" tone="coral" /><VisualBlock x={279} y={24} width={71} height={42} title="RULE" sub="decision" /><path d="M80 45 H96 M170 45 H186 M260 45 H276" className="visual-connector" /><path d="M22 111 H340 M22 102 V114" className="visual-axis" /><path d="M25 98 C70 91 84 78 121 82 S175 101 207 84 S259 71 284 76 S320 83 337 61" className="visual-wave" /><line x1="243" y1="73" x2="243" y2="111" className="visual-sample-line" /><circle cx="243" cy="76" r="4" className="visual-node" /><text x="24" y="133" className="visual-small-label">VOLTAGE SIGNAL</text><text x="242" y="133" textAnchor="middle" className="visual-small-label">SAMPLE</text><text x="337" y="133" textAnchor="end" className="visual-small-label">TIME →</text></>;
    case 'output-drive':
      return <><text x="13" y="20" className="visual-blue-label">LOGIC / COMMAND</text><VisualBlock x={14} y={32} width={98} height={42} title="GPIO" sub="small signal" tone="blue" /><path d="M112 53 H158" className="visual-connector" /><VisualBlock x={161} y={32} width={76} height={42} title="DRIVER" sub="switch" /><path d="M237 53 H276" className="visual-connector" /><VisualBlock x={279} y={32} width={68} height={42} title="LOAD" sub="motor" tone="coral" /><path d="M194 78 V101 H311 V78" className="visual-power-path" /><path d="M271 101 H323" className="visual-power-path" /><text x="263" y="119" textAnchor="middle" className="visual-power-label">SEPARATE LOW-VOLTAGE LOAD SUPPLY</text><text x="14" y="119" className="visual-small-label">COMMON SIGNAL REFERENCE WHERE REQUIRED</text></>;
    case 'selection':
      return <><text x="10" y="19" className="visual-label">DESIGN CHECKLIST</text><text x="178" y="40" textAnchor="middle" className="visual-blue-label">UNO R3</text><text x="276" y="40" textAnchor="middle" className="visual-coral-label">ESP32 MODEL</text>{[['Pins', 'count / map'], ['Logic', '5 V', '3.3 V'], ['Wireless', 'no', 'often']].map(([label, uno, esp], index) => <g key={label}><text x="14" y={61 + index * 24} className="visual-small-label">{label}</text><rect x="110" y={48 + index * 24} width="137" height="19" rx="3" className={index === 1 ? 'visual-risk-cell' : 'visual-cell'} /><rect x="252" y={48 + index * 24} width="96" height="19" rx="3" className={index === 1 ? 'visual-risk-cell visual-risk-cell--blue' : 'visual-cell'} /><text x="178" y={61 + index * 24} textAnchor="middle" className="visual-micro-label">{uno}</text><text x="300" y={61 + index * 24} textAnchor="middle" className="visual-micro-label">{esp}</text></g>)}<text x="179" y="130" textAnchor="middle" className="visual-small-label">VERIFY YOUR EXACT BOARD + MODULE</text></>;
    case 'uno-profile':
      return <><rect x="15" y="20" width="129" height="107" rx="8" className="visual-uno-board" /><rect x="53" y="47" width="55" height="39" rx="4" className="visual-chip" /><text x="80" y="71" textAnchor="middle" className="visual-block__title">ATmega</text>{Array.from({ length: 5 }, (_, i) => <rect key={i} x="24" y={31 + i * 16} width="8" height="8" rx="2" className="visual-pin" />)}{Array.from({ length: 5 }, (_, i) => <rect key={i} x="128" y={31 + i * 16} width="8" height="8" rx="2" className="visual-pin" />)}<text x="80" y="111" textAnchor="middle" className="visual-small-label">USB / LOCAL WORKFLOW</text><VisualBlock x={164} y={24} width={83} height={37} title="14 DIGITAL" sub="I/O pins" tone="blue" /><VisualBlock x={257} y={24} width={87} height={37} title="6 ANALOG" sub="inputs" /><VisualBlock x={164} y={70} width={83} height={37} title="6 PWM" sub="capable pins" tone="coral" /><VisualBlock x={257} y={70} width={87} height={37} title="5 V" sub="logic level" tone="coral" /><text x="254" y="128" textAnchor="middle" className="visual-small-label">NO BUILT-IN WI-FI</text></>;
    case 'esp32-levels':
      return <><VisualBlock x={12} y={34} width={92} height={48} title="5 V MODULE" sub="signal high" tone="coral" /><path d="M104 58 H149" className="visual-connector visual-connector--coral" /><circle cx="127" cy="58" r="15" className="visual-stop" /><path d="M120 51 L134 65 M134 51 L120 65" className="visual-stop-mark" /><VisualBlock x={154} y={34} width={88} height={48} title="ESP32 GPIO" sub="3.3 V logic" tone="blue" /><path d="M244 58 H278" className="visual-feedback-path" /><VisualBlock x={281} y={34} width={66} height={48} title="CHECK" sub="level shift" /><text x="180" y="107" textAnchor="middle" className="visual-coral-label">DO NOT CONNECT 5 V DIRECTLY</text><text x="180" y="128" textAnchor="middle" className="visual-small-label">VERIFY EXACT BOARD + MODULE SPECS</text></>;
    case 'toolchain':
      return <><VisualBlock x={8} y={39} width={61} height={50} title="EDIT" sub="source" tone="blue" /><VisualBlock x={78} y={39} width={61} height={50} title="BUILD" sub="compile" /><VisualBlock x={148} y={39} width={61} height={50} title="UPLOAD" sub="USB" tone="coral" /><VisualBlock x={218} y={39} width={61} height={50} title="RUN" sub="board" /><VisualBlock x={288} y={39} width={64} height={50} title="OBSERVE" sub="test" tone="blue" /><path d="M69 64 H75 M139 64 H145 M209 64 H215 M279 64 H285" className="visual-connector" /><text x="108" y="113" textAnchor="middle" className="visual-coral-label">COMPILE SUCCESS ≠ SYSTEM SUCCESS</text><path d="M318 99 C318 130 40 130 40 99" className="visual-feedback-path" /><text x="180" y="140" textAnchor="middle" className="visual-small-label">OBSERVATION GUIDES THE NEXT EDIT</text></>;
  }
}

function ScheduleSlide() {
  const schedule = [
    { time: '00:00–00:13', title: 'Orient + warm up', detail: 'Learning outcomes, class map, and first classification game.', tone: 'lime' },
    { time: '00:13–00:59', title: 'Embedded foundations', detail: 'Purpose, system parts, microcontroller anatomy, and timing. Break at 00:49.', tone: 'coral' },
    { time: '00:59–01:26', title: 'System thinking', detail: 'Input–process–output, feedback, and the cabinet problem.', tone: 'blue' },
    { time: '01:26–02:18', title: 'Requirements + architecture', detail: 'Scope, measurable needs, context, signals, and power.', tone: 'lime' },
    { time: '02:18–03:00', title: 'Board choice', detail: 'Uno R3 and ESP32 trade-offs. Break at 02:50.', tone: 'coral' },
    { time: '03:00–04:00', title: 'Safe lab + team synthesis', detail: 'Bench readiness, system map challenge, peer critique, and exit ticket.', tone: 'blue' },
  ];
  return (
    <div className="schedule-layout">
      <div className="schedule-heading"><SlideHeading id="slide-title-1" eyebrow="TODAY’S ROUTE / 240 MINUTES" title={<>Four hours.<br /><span className="text-lime">One system story.</span></>} subtitle="We’ll build understanding in layers: purpose → signals → design → safe first lab." /><div className="duration-seal"><b>04:00</b><span>CLASS TIME</span><small>2 × 10 MIN BREAK</small></div></div>
      <div className="schedule-list" aria-label="Four-hour lesson schedule">{schedule.map((item, index) => <div className={`schedule-row schedule-row--${item.tone}`} key={item.title}><span className="schedule-index">0{index + 1}</span><span className="schedule-time">{item.time}</span><div><b>{item.title}</b><p>{item.detail}</p></div><i /></div>)}</div>
      <p className="schedule-note"><span>PACE NOTE</span> The clock is a teaching guide, not a race. Pause after explanations, invite examples, and use the team challenge to check understanding.</p>
    </div>
  );
}

function BreakSlide({ kind }: { kind: 1 | 2 }) {
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  const headingId = kind === 1 ? 'slide-title-9' : 'slide-title-25';

  useEffect(() => {
    if (!running || seconds === 0) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  const title = kind === 1 ? 'Reset. Then follow the signal.' : 'Take a breath before the bench.';
  return (
    <div className="break-layout">
      <div className="break-copy"><Eyebrow color="blue">PAUSE / {kind === 1 ? '01' : '02'} OF 02</Eyebrow><h1 id={headingId}>{title}</h1><p>{kind === 1 ? 'We’ve built the system vocabulary. Let it settle before we turn the idea into requirements.' : 'You’ve made the design choices. Next we switch into safe, practical team mode.'}</p><div className="break-cues"><span><b>01</b> Stand, stretch, rest your eyes.</span><span><b>02</b> Write one question to bring back.</span><span><b>03</b> Return ready for the next block.</span></div></div>
      <div className="break-timer-panel"><span className="break-timer-label">OPTIONAL CLASS BREAK TIMER</span><div className="break-timer" role="timer" aria-label={`${minutes} minutes ${remainder} seconds remaining`}>{String(minutes).padStart(2, '0')}<i>:</i>{String(remainder).padStart(2, '0')}</div><div className="break-timer-controls"><button className="primary-button primary-button--small" type="button" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? 'PAUSE' : seconds === 0 ? 'FINISHED' : 'START 10 MIN'}</button><button className="reset-button" type="button" onClick={() => { setRunning(false); setSeconds(600); }} aria-label="Reset break timer"><RotateCcw size={15} /></button></div><p>{seconds === 0 ? 'Break complete. Pick up at the next chapter.' : 'Silent timer. The lesson does not advance automatically.'}</p></div>
    </div>
  );
}

function ReviewSlide() {
  const questions = [
    { q: 'Is the Arduino board the whole system?', a: 'No. The board is the controller platform. Sensors, outputs, power, software, users, and environment complete the system.' },
    { q: 'Do we need Wi-Fi for the project?', a: 'No. Local operation is sufficient. Add wireless only when a requirement justifies the extra setup and security work.' },
    { q: 'What if our board or sensor is different?', a: 'Identify the exact model and verify its pinout, logic voltage, supply, and interface in official documentation before wiring.' },
    { q: 'What counts as useful evidence today?', a: 'A dated system sketch, a requirement with a pass/fail check, a board comparison, and a logbook note of your own contribution.' },
  ];
  return (
    <div className="review-layout">
      <div className="review-heading"><SlideHeading id="slide-title-30" eyebrow="SYNTHESIS / QUESTIONS WORTH KEEPING" title={<>Pause. Explain it<br /><span className="text-blue">in your own words.</span></>} subtitle="Use these answers to check the model before the team challenge closes." color="blue" /></div>
      <div className="review-grid">{questions.map((item, index) => <article className="review-card" key={item.q}><span>0{index + 1} / ANSWER</span><h2>{item.q}</h2><p>{item.a}</p></article>)}</div>
      <div className="review-prompts"><span>TEAM ROUND-ROBIN</span><p>Each person: name one system part, one interface risk, and one question your team still needs to verify.</p></div>
    </div>
  );
}

function WelcomeSlide({ addPoints, motionEnabled, onStart }: AppProps & { onStart: () => void }) {
  return (
    <div className="welcome-layout">
      <div className="welcome-copy">
        <Eyebrow>FIELD NOTES / 01</Eyebrow>
        <h1 id="slide-title-0">A tiny computer.<br /><span>A real-world job.</span></h1>
        <p className="welcome-lede">Today: discover what makes a system <strong>embedded</strong>, then sketch the first idea for a smart seedling cabinet.</p>
        <div className="welcome-meta"><span><b>32</b> SCREENS</span><span><b>2</b> BREAKS</span><span><b>240</b> MINUTES</span></div>
        <button className="primary-button" type="button" onClick={onStart}>
          START THE MISSION <ArrowRight size={18} />
        </button>
      </div>
      <div className="welcome-art" aria-label="Illustration of a sensor sending a signal to a controller, which switches a light">
        <div className={`orbit orbit--one ${motionEnabled ? 'orbit--moving' : ''}`} />
        <div className={`orbit orbit--two ${motionEnabled ? 'orbit--moving-reverse' : ''}`} />
        <div className="hero-chip"><Cpu size={72} strokeWidth={1.3} /><span>CONTROL</span></div>
        <div className="hero-node hero-node--sensor"><Waves size={26} /><span>SENSE</span></div>
        <div className="hero-node hero-node--output"><Lightbulb size={26} /><span>RESPOND</span></div>
        <div className="hero-line hero-line--left" /><div className="hero-line hero-line--right" />
        <span className="art-caption">WORLD <i>→</i> DECISION <i>→</i> ACTION</span>
        <button className="art-answer" type="button" onClick={() => addPoints(5)} aria-label="Add five class challenge points">
          <Sparkles size={15} /> +5 IF YOU’RE READY
        </button>
      </div>
      <div className="learning-strip">
        <span className="learning-strip__label">BY THE END, YOU CAN</span>
        <div><Check size={16} /> Trace an input → decision → output</div>
        <div><Check size={16} /> Tell a board from a microcontroller</div>
        <div><Check size={16} /> Write one testable requirement</div>
      </div>
    </div>
  );
}

const warmupItems = [
  { label: 'Microwave oven controller', detail: 'Runs a dedicated job: read controls, time the cycle, and switch outputs.', answer: 'embedded' },
  { label: 'Desktop gaming PC', detail: 'A general-purpose computer runs many unrelated applications. It still contains embedded controllers inside.', answer: 'general' },
  { label: 'Car anti-lock braking controller', detail: 'Monitors wheel signals and controls braking behaviour for a dedicated real-time job.', answer: 'embedded' },
];

function WarmupSlide({ addPoints }: AppProps) {
  const [item, setItem] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const current = warmupItems[item];
  const correct = answer === current.answer;

  const choose = (choice: string) => {
    if (answer !== null) return;
    setAnswer(choice);
    if (choice === current.answer) addPoints(10);
  };
  const next = () => {
    setItem((value) => (value + 1) % warmupItems.length);
    setAnswer(null);
  };

  return (
    <div className="warmup-layout">
      <div className="warmup-intro">
        <SlideHeading id="slide-title-2" eyebrow="WARM-UP / QUICK CLASSIFY" title={<>Embedded<br />or not?</>} subtitle="Judge the main job. You get three fast calls." />
        <div className="score-orbit"><div className="score-orbit__ring"><span>+10</span></div><p>POINTS<br />PER HIT</p></div>
      </div>
      <div className="quiz-panel">
        <div className="quiz-panel__top"><span>ROUND {item + 1} / {warmupItems.length}</span><span className="quiz-dots">{warmupItems.map((_, i) => <i key={i} className={i <= item ? 'is-on' : ''} />)}</span></div>
        <div className="quiz-object"><div className="object-glyph">{item === 0 ? <Lightbulb size={47} /> : item === 1 ? <Cpu size={47} /> : <Gauge size={47} />}</div><div><span className="object-label">THE DEVICE</span><h2>{current.label}</h2></div></div>
        <p className="quiz-question">Is its primary purpose to carry out a dedicated control job?</p>
        <div className="choice-row">
          <button className={`choice-button choice-button--yes ${answer === 'embedded' ? (correct ? 'is-correct' : 'is-wrong') : ''}`} type="button" onClick={() => choose('embedded')} disabled={answer !== null}>
            <span className="choice-key">A</span><span>EMBEDDED</span>{answer === 'embedded' && (correct ? <Check size={18} /> : <X size={18} />)}
          </button>
          <button className={`choice-button choice-button--no ${answer === 'general' ? (correct ? 'is-correct' : 'is-wrong') : ''}`} type="button" onClick={() => choose('general')} disabled={answer !== null}>
            <span className="choice-key">B</span><span>GENERAL-PURPOSE</span>{answer === 'general' && (correct ? <Check size={18} /> : <X size={18} />)}
          </button>
        </div>
        {answer !== null ? (
          <div className={`answer-feedback ${correct ? 'answer-feedback--good' : ''}`} aria-live="polite">
            <div className="feedback-icon">{correct ? <Check size={17} /> : <CircleHelp size={17} />}</div>
            <p><b>{correct ? 'Good call.' : `Not quite. It is ${current.answer === 'embedded' ? 'embedded' : 'general-purpose'}.`}</b> {current.detail}</p>
            <button className="text-button" type="button" onClick={next}>NEXT CALL <ArrowRight size={16} /></button>
          </div>
        ) : <p className="micro-hint"><Sparkles size={14} /> Think about its main purpose, not its size.</p>}
      </div>
      <div className="warmup-footnote"><span>REMEMBER</span> A general-purpose device can contain many embedded systems.</div>
    </div>
  );
}

function SystemSlide({ motionEnabled }: { motionEnabled: boolean }) {
  const [active, setActive] = useState('purpose');
  const items = [
    { key: 'purpose', title: 'Dedicated purpose', text: 'Designed to do a defined job, not every job.' },
    { key: 'physical', title: 'Touches the physical world', text: 'Reads sensors, changes outputs, or both.' },
    { key: 'constraints', title: 'Works within constraints', text: 'Power, cost, memory, timing, and environment shape the design.' },
    { key: 'reliable', title: 'Must behave predictably', text: 'The result should be understandable when conditions change or something fails.' },
  ];
  const chosen = items.find((item) => item.key === active)!;
  return (
    <div className="system-layout">
      <div className="system-main">
        <SlideHeading id="slide-title-3" eyebrow="THE BIG IDEA / 01" title={<>A system has<br /><span className="text-coral">a job to do.</span></>} subtitle="An embedded system is more than a chip. It is a small, purposeful team of parts." color="coral" />
        <div className="system-definition"><span>WORKING DEFINITION</span><p>A computer built into a larger product to sense, decide, and act for a <strong>specific purpose</strong>.</p></div>
      </div>
      <div className="trait-list" role="tablist" aria-label="Embedded system characteristics">
        {items.map((item, index) => (
          <button key={item.key} type="button" className={`trait-item ${active === item.key ? 'is-selected' : ''}`} role="tab" aria-selected={active === item.key} onClick={() => setActive(item.key)}>
            <span className="trait-number">0{index + 1}</span><span className="trait-title">{item.title}</span><ArrowRight size={17} />
          </button>
        ))}
        <motion.div className="trait-reveal" key={chosen.key} initial={motionEnabled ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionEnabled ? 0.2 : 0 }}><span className="trait-reveal__tag">WHY IT MATTERS</span><p>{chosen.text}</p></motion.div>
      </div>
      <div className="example-ribbon"><Lightbulb size={19} /><span><b>Think:</b> washing machine, traffic lights, smart speaker. One system, one main purpose, lots of engineering decisions.</span></div>
    </div>
  );
}

function SignalMap({ motionEnabled }: { motionEnabled: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState('sensor');
  const details: Record<string, { heading: string; copy: string }> = {
    world: { heading: 'The physical world', copy: 'A process changes: the cabinet warms up, soil dries, or light levels shift.' },
    sensor: { heading: 'Input / sensor', copy: 'A sensor turns a physical condition into a signal the controller can measure.' },
    controller: { heading: 'Process / controller', copy: 'The program checks the signal against a rule, then chooses a state or response.' },
    output: { heading: 'Output / status', copy: 'An indicator or actuator makes the decision visible or changes the process.' },
  };
  const selectedIndex = Object.keys(details).indexOf(selected) + 1;

  useEffect(() => {
    if (!svgRef.current || !motionEnabled) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      timeline
        .fromTo('.signal-path', { strokeDashoffset: 96 }, { strokeDashoffset: 0, duration: 0.95, stagger: 0.18, ease: 'power2.inOut' })
        .fromTo('.signal-pulse', { cx: 205, opacity: 0 }, { cx: 685, opacity: 1, duration: 1.8, ease: 'power1.inOut' }, '-=0.25')
        .to('.signal-pulse', { opacity: 0, duration: 0.25 }, '-=0.1');
    }, svgRef);
    return () => context.revert();
  }, [motionEnabled]);

  const node = (key: string, x: number, icon: React.ReactNode, label: string, sub: string, tone: string) => (
    <g
      className={`map-node map-node--${tone} ${selected === key ? 'is-selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Show details for ${label}`}
      aria-pressed={selected === key}
      onClick={() => setSelected(key)}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(key); } }}
    >
      <rect x={x} y="105" width="168" height="176" rx="8" />
      <foreignObject x={x + 16} y="126" width="42" height="42"><div className="map-icon">{icon}</div></foreignObject>
      <text x={x + 16} y="204" className="map-label">{label}</text>
      <text x={x + 16} y="232" className="map-sub">{sub}</text>
      <circle cx={x + 144} cy="133" r="5" className="node-light" />
    </g>
  );

  return (
    <div className="signal-layout">
      <div className="signal-heading-row"><SlideHeading id="slide-title-18" eyebrow="MAKE THE INVISIBLE VISIBLE" title="Follow the signal." subtitle="Tap a block. Trace the job from a real-world change to a useful response." color="blue" /><div className="signal-legend"><span><i className="legend-dot legend-dot--signal" /> SIGNAL</span><span><i className="legend-dot legend-dot--power" /> POWER</span></div></div>
      <div className="signal-canvas">
        <svg ref={svgRef} viewBox="0 0 820 360" role="img" aria-label="System signal flow from physical environment through sensor and controller to output and user">
          <defs><marker id="arrow-head" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#d6fa59" /></marker></defs>
          <text x="52" y="72" className="map-overline">THE CABINET CONTROLLER</text>
          <path className="signal-path" d="M 175 194 H 202" />
          <path className="signal-path" d="M 370 194 H 397" />
          <path className="signal-path" d="M 565 194 H 592" />
          <circle className="signal-pulse" cx="205" cy="194" r="6" />
          {node('world', 36, <Waves size={25} />, 'ENVIRONMENT', 'soil / light / heat', 'blue')}
          {node('sensor', 202, <Gauge size={25} />, 'SENSOR', 'measures a condition', 'coral')}
          {node('controller', 397, <Cpu size={25} />, 'CONTROLLER', 'runs the rule', 'lime')}
          {node('output', 592, <Lightbulb size={25} />, 'OUTPUT', 'status / action', 'blue')}
          <path className="power-path" d="M 486 282 V 317 H 676 V 282" />
          <text x="516" y="344" className="power-label">POWER KEEPS THE SYSTEM RUNNING</text>
        </svg>
      </div>
      <div className="signal-detail" aria-live="polite"><span className="signal-detail__number">{String(selectedIndex).padStart(2, '0')} / 04</span><div><b>{details[selected].heading}</b><p>{details[selected].copy}</p></div><span className="signal-detail__tag">TAP A BLOCK TO EXPLORE</span></div>
    </div>
  );
}

function SignalSlide({ motionEnabled }: { motionEnabled: boolean }) {
  return <SignalMap motionEnabled={motionEnabled} />;
}

function BoardSlide({ addPoints }: AppProps) {
  const [scenario, setScenario] = useState<'local' | 'wireless'>('local');
  const [choice, setChoice] = useState<'uno' | 'esp32' | null>(null);
  const [awarded, setAwarded] = useState(false);
  const best = scenario === 'local' ? 'uno' : 'esp32';
  const chooseScenario = (value: 'local' | 'wireless') => { setScenario(value); setChoice(null); setAwarded(false); };
  const chooseBoard = (value: 'uno' | 'esp32') => {
    setChoice(value);
    if (value === best && !awarded) { addPoints(15); setAwarded(true); }
  };

  return (
    <div className="board-layout">
      <div className="board-heading"><SlideHeading id="slide-title-24" eyebrow="MICROCONTROLLER OR DEVELOPMENT BOARD?" title={<>Pick the right<br /><span className="text-lime">starting point.</span></>} subtitle="Choose for the job. The fanciest board does not automatically win." /></div>
      <div className="board-game">
        <div className="scenario-panel">
          <div className="scenario-label"><span>DESIGN SCENARIO</span><CircleHelp size={16} /></div>
          <div className="scenario-switch" role="group" aria-label="Choose design scenario">
            <button type="button" className={scenario === 'local' ? 'is-selected' : ''} onClick={() => chooseScenario('local')}>LOCAL BUILD</button>
            <button type="button" className={scenario === 'wireless' ? 'is-selected' : ''} onClick={() => chooseScenario('wireless')}>WIRELESS NEXT</button>
          </div>
          <p className="scenario-text">{scenario === 'local' ? 'Two sensor inputs. Two indicators. No network. A first prototype in the lab.' : 'Same controller, but the next version may send a status update over Wi-Fi.'}</p>
          <div className="board-choice-row">
            <button type="button" className={`board-choice ${choice === 'uno' ? 'is-picked' : ''}`} onClick={() => chooseBoard('uno')} aria-pressed={choice === 'uno'}>
              <span className="board-choice__id">A</span><strong>UNO R3</strong><small>5 V logic / local I/O</small>
            </button>
            <button type="button" className={`board-choice board-choice--esp ${choice === 'esp32' ? 'is-picked' : ''}`} onClick={() => chooseBoard('esp32')} aria-pressed={choice === 'esp32'}>
              <span className="board-choice__id">B</span><strong>ESP32 FAMILY</strong><small>3.3 V logic / model varies</small>
            </button>
          </div>
          {choice && <div className={`board-feedback ${choice === best ? 'is-good' : ''}`} aria-live="polite">
            {choice === best ? <Check size={17} /> : <CircleHelp size={17} />}
            <p><b>{choice === best ? 'A sensible fit.' : 'It could work, but compare the trade-offs.'}</b> {scenario === 'local' ? 'For this first local build, the Uno is a straightforward starting point; built-in wireless is not needed.' : 'An ESP32 development board is a natural candidate for Wi-Fi, but verify the exact model and signal levels.'}</p>
          </div>}
        </div>
        <div className="compare-panel">
          <div className="compare-heading"><span>QUICK SPEC CHECK</span><span>ALWAYS VERIFY THE EXACT BOARD</span></div>
          <div className="compare-row"><span>Microcontroller</span><b>ATmega328P</b><b>ESP32 variant</b></div>
          <div className="compare-row"><span>GPIO logic</span><b className="text-coral">5 V</b><b className="text-blue">3.3 V</b></div>
          <div className="compare-row"><span>Wireless</span><b>Not built in</b><b>Common on dev boards</b></div>
          <div className="compare-row"><span>Pin behaviour</span><b>Well-defined Uno R3 layout</b><b>Depends on exact model</b></div>
          <div className="compare-note"><LockKeyhole size={15} /><span>Never feed a 5 V signal straight into a 3.3 V-only input.</span></div>
        </div>
      </div>
      <div className="board-foot"><span>DESIGN RULE</span><p>Requirements first. Board second. Check its <b>power, pins, voltage, memory, timing, and tools.</b></p></div>
    </div>
  );
}

const requirementPairs = [
  {
    prompt: 'The cabinet should warn us when soil is dry.',
    weak: 'Make the LED turn on when it feels dry.',
    strong: 'When the calibrated reading is below the agreed threshold for 3 consecutive samples, turn on the warning LED within 2 seconds.',
  },
  {
    prompt: 'Show the controller is alive.',
    weak: 'The system should look okay.',
    strong: 'After startup, the status LED gives one short pulse within 3 seconds of power being applied.',
  },
  {
    prompt: 'Let a student test the output safely.',
    weak: 'Manual mode should be easy.',
    strong: 'In test mode, one button press toggles the indicator; automatic control resumes when test mode is exited.',
  },
];

function RequirementSlide({ addPoints, motionEnabled }: AppProps) {
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<'weak' | 'strong' | null>(null);
  const current = requirementPairs[round];
  const isCorrect = choice === 'strong';
  const choose = (value: 'weak' | 'strong') => {
    if (choice !== null) return;
    setChoice(value);
    if (value === 'strong') addPoints(10);
  };
  const next = () => { setRound((value) => (value + 1) % requirementPairs.length); setChoice(null); };
  return (
    <div className="requirement-layout">
      <div className="requirement-top"><SlideHeading id="slide-title-16" eyebrow="REQUIREMENT ARCADE / ROUND 01" title={<>Make it<br /><span className="text-blue">testable.</span></>} subtitle="A good requirement tells us what success looks like—and how we can check." color="blue" /><div className="round-stamp"><span>ROUND</span><b>0{round + 1}</b><small>OF 03</small></div></div>
      <div className="requirement-card">
        <div className="requirement-card__prompt"><span>DESIGN NEED</span><p>“{current.prompt}”</p></div>
        <div className="requirement-card__options">
          <button type="button" className={`requirement-option ${choice === 'weak' ? 'is-wrong' : ''}`} onClick={() => choose('weak')} disabled={choice !== null}>
            <span className="option-marker">A</span><span><small>VAGUE</small>{current.weak}</span>{choice === 'weak' && <X size={19} />}
          </button>
          <button type="button" className={`requirement-option requirement-option--strong ${choice === 'strong' ? 'is-correct' : ''}`} onClick={() => choose('strong')} disabled={choice !== null}>
            <span className="option-marker">B</span><span><small>VERIFIABLE</small>{current.strong}</span>{choice === 'strong' && <Check size={19} />}
          </button>
        </div>
        {choice !== null && <motion.div className={`requirement-result ${isCorrect ? 'is-good' : ''}`} initial={motionEnabled ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionEnabled ? 0.2 : 0 }} aria-live="polite">
          <b>{isCorrect ? 'Yes. We can test that.' : 'Look for a number, condition, and observable result.'}</b><span>{isCorrect ? 'It says when, how often, and what the output must do.' : 'Try the other statement: is there a clear pass/fail check?'}</span>
          <button className="text-button" type="button" onClick={next}>NEXT REQUIREMENT <ArrowRight size={16} /></button>
        </motion.div>}
      </div>
      <div className="trace-chain"><span>NEED</span><ArrowRight size={15} /><span>REQUIREMENT</span><ArrowRight size={15} /><span>TEST</span><ArrowRight size={15} /><span className="trace-chain__last">EVIDENCE</span></div>
    </div>
  );
}

function BenchSlide({ motionEnabled }: { motionEnabled: boolean }) {
  const [part, setPart] = useState('chip');
  const parts: Record<string, { name: string; title: string; body: string; tag: string }> = {
    chip: { name: 'MICROCONTROLLER', title: 'The silicon that runs the program.', body: 'The chip contains the processor and peripherals. It executes instructions and interacts with pins; it is not the whole development setup.', tag: 'THE COMPUTING CORE' },
    board: { name: 'DEVELOPMENT BOARD', title: 'The chip, made practical.', body: 'A board adds useful connections and supporting electronics such as power regulation, clocking, and programming access. Board details vary.', tag: 'THE CLASSROOM TOOL' },
    breadboard: { name: 'BREADBOARD', title: 'A temporary circuit, no soldering.', body: 'Inside, groups of holes are electrically connected in patterns. The centre gap separates the two sides. Learn the layout before adding power.', tag: 'THE PROTOTYPE SURFACE' },
    resistor: { name: 'RESISTOR + LED', title: 'A simple output needs an interface.', body: 'A bare LED needs a suitable current-limiting resistor. Check polarity and the approved circuit. Never treat a GPIO pin as a power supply.', tag: 'THE FIRST OUTPUT' },
  };
  const active = parts[part];
  const hotspot = (key: string, x: number, y: number, label: string) => (
    <g className={`hotspot ${part === key ? 'is-active' : ''}`} role="button" tabIndex={0} aria-label={`Show ${label}`} onClick={() => setPart(key)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPart(key); } }}>
      <circle cx={x} cy={y} r="17" /><text x={x} y={y + 5}>{label}</text>
    </g>
  );
  return (
    <div className="bench-layout">
      <div className="bench-heading"><SlideHeading id="slide-title-27" eyebrow="FIRST DAY AT THE BENCH" title={<>Meet the<br /><span className="text-coral">hardware.</span></>} subtitle="Explore the parts before power goes on. Tap a numbered point." color="coral" /><div className="safety-stamp"><LockKeyhole size={18} /><span>POWER OFF<br />BEFORE REWIRING</span></div></div>
      <div className="bench-content">
        <div className="bench-illustration">
          <svg viewBox="0 0 620 400" role="img" aria-label="Illustrated microcontroller board connected to a breadboard with a resistor and LED">
            <rect className="board-body" x="48" y="65" width="255" height="262" rx="14" />
            <rect className="usb-port" x="10" y="144" width="48" height="88" rx="7" />
            <rect className="main-chip" x="111" y="130" width="122" height="112" rx="5" />
            <text className="chip-text" x="172" y="178">MCU</text><text className="chip-subtext" x="172" y="203">PROCESS + MEMORY</text>
            <rect className="small-chip" x="84" y="257" width="53" height="31" rx="3" /><text className="board-label" x="174" y="300">DEVELOPMENT BOARD</text>
            {Array.from({ length: 10 }, (_, i) => <g key={i}><rect className="pin" x="66" y={83 + i * 19} width="11" height="12" rx="2" /><rect className="pin" x="270" y={83 + i * 19} width="11" height="12" rx="2" /></g>)}
            <rect className="breadboard" x="344" y="84" width="240" height="243" rx="9" />
            <path className="bread-rail" d="M366 113 H561 M366 300 H561" />
            {Array.from({ length: 10 }, (_, i) => <g key={i}>{Array.from({ length: 4 }, (_, j) => <circle className="bread-hole" key={j} cx={380 + i * 17} cy={147 + j * 18} r="3" />)}</g>)}
            <path className="wire wire--blue" d="M281 112 C320 112 316 144 360 144" />
            <path className="wire wire--lime" d="M281 207 C318 207 320 214 361 214" />
            <path className="wire wire--coral" d="M470 213 V257 H518" />
            <rect className="resistor" x="452" y="247" width="39" height="13" rx="4" />
            <path className="resistor-leg" d="M445 253 H452 M491 253 H503" />
            <path className="led-leg" d="M520 252 V270 M532 252 V270" />
            <path className="led-body" d="M515 252 Q526 231 537 252 Z" />
            <path className="led-ray" d="M540 235 L550 225 M544 244 L557 239" />
            {hotspot('chip', 172, 115, '1')}{hotspot('board', 83, 311, '2')}{hotspot('breadboard', 559, 98, '3')}{hotspot('resistor', 490, 281, '4')}
          </svg>
          <div className="illustration-key"><span><i className="key-dot key-dot--signal" /> SIGNAL</span><span><i className="key-dot key-dot--gnd" /> COMMON REFERENCE</span></div>
        </div>
        <motion.div className="part-card" key={part} initial={motionEnabled ? { opacity: 0, x: 12 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: motionEnabled ? 0.2 : 0 }}>
          <span className="part-card__tag">{active.tag}</span><span className="part-card__name">{active.name}</span><h2>{active.title}</h2><p>{active.body}</p>
          <div className="part-tabs" role="tablist" aria-label="Hardware parts">
            {Object.entries(parts).map(([key, value], i) => <button key={key} type="button" className={part === key ? 'is-active' : ''} role="tab" aria-selected={part === key} onClick={() => setPart(key)}><span>0{i + 1}</span>{value.name}</button>)}
          </div>
        </motion.div>
      </div>
      <div className="bench-rule"><span>BEFORE POWER</span><b>Inspect</b><ArrowRight size={14} /><b>Check rails</b><ArrowRight size={14} /><b>Ask for a second look</b></div>
    </div>
  );
}

const builderOptions = {
  input: [
    { id: 'moisture', title: 'Moisture sensor', correct: true },
    { id: 'guess', title: 'A guess', correct: false },
    { id: 'button', title: 'Button only', correct: false },
  ],
  controller: [
    { id: 'uno', title: 'Arduino Uno R3', correct: true },
    { id: 'lamp', title: 'Bare LED', correct: false },
    { id: 'breadboard', title: 'Breadboard', correct: false },
  ],
  output: [
    { id: 'led', title: 'Status LED + resistor', correct: true },
    { id: 'sensor', title: 'Sensor only', correct: false },
    { id: 'wire', title: 'Loose wire', correct: false },
  ],
  support: [
    { id: 'supply', title: 'Approved low-voltage USB', correct: true },
    { id: 'mains', title: 'Wall mains wiring', correct: false },
    { id: 'unknown', title: 'Unknown supply', correct: false },
  ],
};

type BuilderKey = keyof typeof builderOptions;

function BuilderSlide({ addPoints, motionEnabled }: AppProps) {
  const [selected, setSelected] = useState<Partial<Record<BuilderKey, string>>>({});
  const [checked, setChecked] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const groups: { key: BuilderKey; number: string; title: string; sub: string }[] = [
    { key: 'input', number: '01', title: 'SENSE', sub: 'What changes in the cabinet?' },
    { key: 'controller', number: '02', title: 'DECIDE', sub: 'What reads and applies the rule?' },
    { key: 'output', number: '03', title: 'RESPOND', sub: 'What shows the decision?' },
    { key: 'support', number: '04', title: 'SUPPORT', sub: 'What powers the safe prototype?' },
  ];
  const isComplete = groups.every((group) => selected[group.key]);
  const isCorrect = groups.every((group) => builderOptions[group.key].find((item) => item.id === selected[group.key])?.correct);
  const check = () => {
    setChecked(true);
    if (isCorrect && !awarded) { addPoints(25); setAwarded(true); }
  };
  const reset = () => { setSelected({}); setChecked(false); setAwarded(false); };

  return (
    <div className="builder-layout">
      <div className="builder-heading"><SlideHeading id="slide-title-29" eyebrow="TEAM CHALLENGE / 18 MINUTES" title={<>Make the signal<br /><span className="text-lime">make sense.</span></>} subtitle="Choose one part for each job. Assemble a safe, simple cabinet system." /></div>
      <div className="builder-board">
        {groups.map((group) => (
          <section className="builder-column" key={group.key} aria-label={`${group.number} ${group.title}`}>
            <div className="builder-column__heading"><span>{group.number}</span><b>{group.title}</b><small>{group.sub}</small></div>
            <div className="builder-options">
              {builderOptions[group.key].map((option) => (
                <button key={option.id} className={`builder-option ${selected[group.key] === option.id ? 'is-selected' : ''} ${checked && selected[group.key] === option.id ? (option.correct ? 'is-correct' : 'is-wrong') : ''}`} type="button" onClick={() => { setSelected((value) => ({ ...value, [group.key]: option.id })); setChecked(false); }} aria-pressed={selected[group.key] === option.id}>
                  <span className="builder-radio">{selected[group.key] === option.id && <i />}</span>{option.title}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="builder-result-row">
        <div className="builder-path" aria-live="polite"><span>PATH</span><b>{selected.input ? builderOptions.input.find((item) => item.id === selected.input)?.title : 'Input'}</b><ArrowRight size={15} /><b>{selected.controller ? builderOptions.controller.find((item) => item.id === selected.controller)?.title : 'Controller'}</b><ArrowRight size={15} /><b>{selected.output ? builderOptions.output.find((item) => item.id === selected.output)?.title : 'Output'}</b></div>
        {checked && <motion.p className={`builder-feedback ${isCorrect ? 'is-good' : 'is-bad'}`} initial={motionEnabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: motionEnabled ? 0.2 : 0 }}>{isCorrect ? 'System makes sense. Keep mains out of the prototype.' : 'Check the job of each part and keep the power low-voltage.'}</motion.p>}
        <div className="builder-actions"><button className="reset-button" type="button" onClick={reset} aria-label="Reset system builder"><RotateCcw size={15} /></button><button className="primary-button primary-button--small" type="button" onClick={check} disabled={!isComplete}>CHECK SYSTEM <Check size={16} /></button></div>
      </div>
    </div>
  );
}

const safetyQuestions = [
  { question: 'Can an Uno GPIO pin power a small DC motor directly?', options: ['Yes, if the code is short.', 'No. Use a suitable driver and supply.'], answer: 1, why: 'GPIO is a logic signal, not a motor power source. Use a tutor-approved driver circuit.' },
  { question: 'Can a 5 V output go straight into an ESP32 GPIO?', options: ['Yes, all boards are 5 V tolerant.', 'No. ESP32 GPIO is 3.3 V logic.'], answer: 1, why: 'ESP32 GPIO is generally 3.3 V logic and not 5 V tolerant. Check exact board and module specifications.' },
  { question: 'Before changing a breadboard circuit, what should you do?', options: ['Disconnect power first.', 'Move the wires quickly.'], answer: 0, why: 'Power off, make the change, inspect the wiring, then get a second look before powering up.' },
];

function SafetySlide({ addPoints, motionEnabled }: AppProps) {
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [earned, setEarned] = useState(0);
  const current = safetyQuestions[question];
  const choose = (value: number) => {
    if (answer !== null) return;
    setAnswer(value);
    if (value === current.answer) { addPoints(10); setEarned((score) => score + 1); }
  };
  const next = () => { setQuestion((value) => (value + 1) % safetyQuestions.length); setAnswer(null); };
  return (
    <div className="safety-layout">
      <div className="safety-left"><SlideHeading id="slide-title-26" eyebrow="SAFETY ROUND / NO GUESSING WITH POWER" title={<>The bench<br /><span className="text-coral">boss battle.</span></>} subtitle="Three decisions. Safe circuits are designed before they are powered." color="coral" /><div className="boss-art"><div className="boss-halo" /><div className="boss-icon"><LockKeyhole size={47} /></div><div className="boss-stat"><span>SAFE CALLS</span><b>{earned} / 3</b></div><div className="boss-spark boss-spark--one" /><div className="boss-spark boss-spark--two" /></div></div>
      <div className="safety-quiz">
        <div className="safety-progress"><span>DECISION {question + 1} / 3</span><div>{safetyQuestions.map((_, i) => <i key={i} className={i <= question ? 'is-active' : ''} />)}</div></div>
        <h2>{current.question}</h2>
        <div className="safety-options">{current.options.map((option, index) => <button key={option} type="button" onClick={() => choose(index)} disabled={answer !== null} className={`safety-option ${answer === index ? (index === current.answer ? 'is-correct' : 'is-wrong') : ''}`}><span>{index === 0 ? 'A' : 'B'}</span>{option}{answer === index && (index === current.answer ? <Check size={18} /> : <X size={18} />)}</button>)}</div>
        {answer !== null ? <motion.div className={`safety-feedback ${answer === current.answer ? 'is-good' : ''}`} initial={motionEnabled ? { opacity: 0, y: 7 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionEnabled ? 0.2 : 0 }} aria-live="polite"><b>{answer === current.answer ? 'Safe choice.' : 'Stop and rethink.'}</b><p>{current.why}</p><button className="text-button" type="button" onClick={next}>NEXT DECISION <ArrowRight size={16} /></button></motion.div> : <div className="safe-banner"><LockKeyhole size={17} /><span>LOW-VOLTAGE ONLY. NEVER CONNECT THIS PROTOTYPE TO MAINS.</span></div>}
      </div>
    </div>
  );
}

const exitQuestions = [
  { q: 'A sensor is…', a: ['the decision-maker', 'a measurement input', 'the power supply'], correct: 1 },
  { q: 'A development board is…', a: ['the MCU plus useful supporting hardware', 'only a breadboard', 'a complete computer system'], correct: 0 },
  { q: 'A useful requirement is…', a: ['easy to understand', 'measurable and verifiable', 'written after testing'], correct: 1 },
];

function ExitSlide() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reflection, setReflection] = useState('');
  const score = exitQuestions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);
  const complete = Object.keys(answers).length === exitQuestions.length;
  return (
    <div className="exit-layout">
      <div className="exit-heading"><SlideHeading id="slide-title-31" eyebrow="EXIT TICKET / 60 SECONDS" title={<>Leave with<br /><span className="text-blue">a clear signal.</span></>} subtitle="Answer, reflect, and capture one next step in your logbook." color="blue" /><div className="exit-score"><span>YOUR CHECK</span><b>{complete ? `${score} / 3` : `${Object.keys(answers).length} / 3`}</b><small>{complete ? (score === 3 ? 'SYSTEM READY' : 'REVIEW THE SIGNAL') : 'QUESTIONS'}</small></div></div>
      <div className="exit-quiz">
        {exitQuestions.map((question, qi) => (
          <div className="exit-question" key={question.q}><div className="exit-question__prompt"><span>0{qi + 1}</span><b>{question.q}</b></div><div className="exit-options">{question.a.map((option, ai) => <button key={option} type="button" onClick={() => setAnswers((value) => ({ ...value, [qi]: ai }))} className={`${answers[qi] === ai ? (ai === question.correct ? 'is-correct' : 'is-wrong') : ''}`} aria-pressed={answers[qi] === ai}>{option}</button>)}</div></div>
        ))}
        <label className="reflection-field"><span>ONE IDEA I’LL TAKE TO THE LAB</span><textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Example: A sensor needs a controller to interpret its signal…" rows={2} /></label>
        <div className="exit-footer"><div><span className="logbook-stamp">LOGBOOK</span><p>Date it. What did you learn? What will you check next?</p></div><div className="exit-complete" aria-live="polite">{complete ? <><Check size={17} /> EXIT CHECK COMPLETE</> : <><ArrowDown size={17} /> ANSWER ALL THREE</>}</div></div>
      </div>
      <div className="next-week-strip"><span>NEXT UP</span><b>Week 02</b><i /> Digital I/O, first Arduino sketch, and the LED that listens.</div>
    </div>
  );
}

export default App;