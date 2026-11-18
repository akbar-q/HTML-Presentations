import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BandCalculator, BandQuiz, ButtonLedSimulation, IvLab, LedCircuitSimulation, LedReference, TinkercadEmbed } from './Labs';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Battery,
  Check,
  CircleHelp,
  Cpu,
  Expand,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const slideNames = [
  'Start here',
  'Today’s route',
  'Recall: the controller has a job',
  'An LED is a diode',
  'Direction matters',
  'Voltage, current, resistance',
  'The 9 V question',
  'The series-resistor rule',
  'Work one example together',
  'Resistor design bench',
  'Series strings and parallel branches',
  'Resistor power is real',
  'Read the colour bands',
  'Resistor band decoder',
  'Band-code quick challenge',
  'Break one',
  'LED colours and forward voltage',
  'The LED I–V curve',
  'Explore the curve',
  'What overcurrent does',
  'GPIO: logic, not power',
  'TinkerCAD: 9 V LED circuit',
  'Trace the sketch',
  'Digital input: a button',
  'Pull-up makes a clear input',
  'TinkerCAD: read a button',
  'TinkerCAD: button controls LED',
  'Break two',
  'Debug by evidence',
  'Team challenge: safe indicator',
  'Exit ticket',
];

const standardWattages = [0.125, 0.25, 0.5, 1, 2];

type LessonPoint = { title: string; body: string; example: string };
type LessonData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: 'lime' | 'coral' | 'blue';
  visual: 'led' | 'polarity' | 'ohms' | 'battery' | 'formula' | 'power' | 'gpio' | 'pullup' | 'code' | 'test' | 'branches' | 'bands' | 'spectrum' | 'iv' | 'damage' | 'button';
  points: LessonPoint[];
  question: string;
  answer: string;
  takeaway: string;
};

const lessonData: Record<number, LessonData> = {
  3: {
    eyebrow: 'COMPONENT / LIGHT EMITTING DIODE', title: 'An LED is a diode that emits light.',
    subtitle: 'It conducts mainly in one direction, and its current must be limited by the circuit around it.', tone: 'coral', visual: 'led',
    points: [
      { title: 'A semiconductor junction', body: 'An LED is a p-n junction. Forward bias allows current to flow and releases energy as light. The junction voltage depends on material and current.', example: 'A red LED often has a lower forward voltage than a blue or white LED.' },
      { title: 'A nonlinear component', body: 'The current does not rise gently in proportion to voltage. Near the forward-voltage knee, a small voltage increase can cause a large current increase.', example: 'That steep region is why an LED is not safely connected straight across a fixed voltage source.' },
      { title: 'The rest of the circuit matters', body: 'A supply, LED, and current-limiting element form one loop. Current is set by the supply, LED characteristic, and series resistance together.', example: 'For a simple teaching circuit, one resistor in series with one LED is easy to calculate and test.' },
    ],
    question: 'Does the LED “use up” all the current?', answer: 'No. The same series current flows through the resistor and LED. The resistor drops the remaining voltage and limits that current.',
    takeaway: 'A visible light source is still an electrical load with a characteristic and a limit.',
  },
  4: {
    eyebrow: 'COMPONENT / POLARITY', title: 'The anode and cathode are not interchangeable.',
    subtitle: 'Correct polarity lets the diode conduct forward; reversed polarity normally blocks current in this low-voltage circuit.', tone: 'blue', visual: 'polarity',
    points: [
      { title: 'Anode: positive side in forward bias', body: 'The anode is connected toward the positive supply through the series resistor. Many through-hole LEDs have a longer lead, but trimmed leads remove that clue.', example: 'Identify the anode before inserting an LED into the breadboard.' },
      { title: 'Cathode: return side', body: 'The cathode connects toward the circuit return (GND) for a conventional positive-supply circuit. The flat edge on many LED packages marks the cathode.', example: 'Package cues are helpful, but confirm with the part datasheet when uncertain.' },
      { title: 'Current direction and reference', body: 'Conventional current is described from higher potential through the forward-biased diode toward lower potential. The microcontroller and circuit need a defined reference.', example: 'In an Uno circuit: 5 V → resistor → LED → GND, or GPIO → resistor → LED → GND.' },
    ],
    question: 'What if the LED is backwards?', answer: 'It will usually remain off at the low supply voltage used here. Do not use reverse voltage as a test strategy; check orientation and datasheet limits.',
    takeaway: 'Trace the complete path and check polarity before powering the circuit.',
  },
  5: {
    eyebrow: 'CIRCUIT / THREE QUANTITIES', title: 'Voltage pushes. Current flows. Resistance limits.',
    subtitle: 'Ohm’s law connects voltage across a resistor, current through it, and its resistance.', tone: 'lime', visual: 'ohms',
    points: [
      { title: 'Voltage is a difference in potential', body: 'A component voltage is measured between its two terminals. In a series loop, component voltage drops add to the supply voltage.', example: 'The resistor voltage is supply voltage minus the LED forward-voltage drop.' },
      { title: 'Current is shared around one series loop', body: 'In an unbranched series path, the same current passes through every component. Parallel branches split the total current between branch paths.', example: 'Parallel LED strings should each have their own current-setting resistor.' },
      { title: 'Resistance sets the remaining current', body: 'For an ohmic resistor, V = I × R. Once the LED drop is accounted for, choose a resistor that keeps the expected LED current within a safe design target.', example: 'Use amperes in calculations: 20 mA = 0.020 A.' },
    ],
    question: 'Why can’t we choose a resistor from the supply voltage alone?', answer: 'We also need the LED forward voltage and a chosen current target. The resistor only drops the voltage left after the LED.',
    takeaway: 'Use measured/defined quantities with consistent units; don’t confuse milliamps with amps.',
  },
  6: {
    eyebrow: 'DESIGN CASE / 9 V BATTERY', title: 'A 9 V battery is not “9 V for every part.”',
    subtitle: 'The resistor takes the difference between the supply and LED forward voltage; the LED count in series matters.', tone: 'coral', visual: 'battery',
    points: [
      { title: 'One white LED', body: 'If Vf is approximately 3.2 V at the chosen current, the resistor has about 5.8 V across it from a 9 V supply.', example: 'At a 20 mA target, Rideal = 5.8 / 0.020 = 290 Ω.' },
      { title: 'Two in series', body: 'Two similar white LEDs drop roughly 6.4 V total, leaving about 2.6 V for the resistor.', example: 'At 20 mA, Rideal = 2.6 / 0.020 = 130 Ω; choose the next suitable standard value above it.' },
      { title: 'Three white LEDs in series', body: 'Three nominal 3.2 V drops total 9.6 V, greater than a 9 V source. There is no positive resistor value that can produce the requested forward current.', example: 'The calculator will flag this as an invalid series string, not silently return a negative resistor.' },
    ],
    question: 'The supplied TinkerCAD image shows two LEDs and a 9 V source. Is the resistor value universal?', answer: 'No. It depends on each LED’s forward voltage, target current, whether LEDs are in series or parallel, battery voltage under load, and the resistor tolerance.',
    takeaway: 'A resistor calculation begins with the actual topology and component data.',
  },
  7: {
    eyebrow: 'METHOD / SERIES RESISTOR', title: 'Calculate the resistor before you wire.',
    subtitle: 'For one series branch, subtract LED drops first; then use Ohm’s law on the remaining voltage.', tone: 'blue', visual: 'formula',
    points: [
      { title: 'Step 1: total LED drop', body: 'Add forward voltages of LEDs in series: VLED,total = Vf,1 + Vf,2 + …', example: 'Two nominal white LEDs: 3.2 V + 3.2 V = 6.4 V.' },
      { title: 'Step 2: resistor voltage', body: 'Subtract that total from the supply: VR = Vs − VLED,total. If VR ≤ 0, the proposed series string cannot be driven at the intended current from that supply.', example: '9 V − 6.4 V = 2.6 V left for the resistor.' },
      { title: 'Step 3: resistance and standard value', body: 'Rideal = VR / Itarget. Choose a standard value at or above the ideal value, then recalculate actual current using the chosen resistor.', example: '2.6 V / 0.020 A = 130 Ω; E12 next-up is 150 Ω.' },
    ],
    question: 'Why choose a standard resistor above the ideal value?', answer: 'A slightly higher resistance lowers current. Resistor and LED tolerances still matter, so check the worst-case current and the part ratings.',
    takeaway: 'Calculate, select a real value, then recalculate current and power.',
  },
  8: {
    eyebrow: 'WORKED EXAMPLE / ONE WHITE LED', title: 'From 9 V to a real resistor value.',
    subtitle: 'Assume one white LED, nominal Vf = 3.2 V, desired current = 20 mA, and an E12 resistor set.', tone: 'lime', visual: 'formula',
    points: [
      { title: 'Resistor voltage', body: 'VR = 9.0 − 3.2 = 5.8 V.', example: 'The LED and resistor voltage drops sum to the battery voltage.' },
      { title: 'Ideal resistance', body: 'Rideal = 5.8 V / 0.020 A = 290 Ω.', example: 'Convert 20 mA to 0.020 A before dividing.' },
      { title: 'Choose and check', body: 'Choose E12 330 Ω. Actual nominal current = 5.8 / 330 = 17.6 mA. Resistor power = I²R ≈ 0.102 W.', example: 'A 0.25 W resistor gives useful rating margin for this nominal example; verify worst-case conditions and local stock.' },
    ],
    question: 'Why not choose 270 Ω because it is closer to 290 Ω?', answer: 'It is below the ideal value, so current rises above the target: 5.8/270 ≈ 21.5 mA. That might be within some LEDs’ ratings, but the safer default is to meet or stay below the chosen target and verify datasheet limits.',
    takeaway: 'The E12/E24 value is a design choice; the actual current is the check.',
  },
  10: {
    eyebrow: 'DESIGN TOOL / CALCULATE + CHECK', title: 'The resistor design bench.',
    subtitle: 'Change one parameter at a time. Watch the proposed standard value, branch current, and resistor power update.', tone: 'lime', visual: 'formula',
    points: [
      { title: 'Set the supply', body: 'Start with the nominal 9 V battery. Real battery voltage changes with chemistry, state of charge, and load.', example: 'For a precise physical build, measure the supply under load.' },
      { title: 'Describe the LED string', body: 'Choose an approximate LED colour/forward voltage and number in series per branch. Add parallel branches only when each has its own resistor.', example: 'Series adds LED voltages; parallel adds branch currents.' },
      { title: 'Pick a current target', body: 'Use a conservative design current supported by the exact LED datasheet. The 20 mA value is a common teaching example, not a universal LED rating.', example: 'The output checks the selected resistor’s actual nominal current and power.' },
    ],
    question: 'What does “next standard value” mean here?', answer: 'The calculator selects the next E12 or E24 nominal resistance at or above the ideal value so the nominal current does not exceed the target.',
    takeaway: 'This is a first-pass nominal design tool, not a substitute for datasheets or worst-case analysis.',
  },
  11: {
    eyebrow: 'TOPOLOGY / SERIES VS PARALLEL', title: 'Series strings and parallel branches behave differently.',
    subtitle: 'The resistor belongs to each branch, not “somewhere” in a multi-branch LED network.', tone: 'coral', visual: 'branches',
    points: [
      { title: 'Series: voltage drops add', body: 'The same current flows through every LED in an unbranched series string. Total forward voltage is the sum of each LED drop.', example: 'Two white LEDs need about 6.4 V total at nominal conditions.' },
      { title: 'Parallel: branch current adds', body: 'Each parallel string can have slightly different Vf. A shared resistor does not guarantee equal current sharing, so one string can hog current.', example: 'Use one correctly calculated series resistor per parallel string.' },
      { title: 'Power supply headroom', body: 'A supply must exceed the total LED voltage by enough for the resistor to regulate current across expected variations.', example: 'Do not put three nominal 3.2 V LEDs in series on 9 V and expect stable current.' },
    ],
    question: 'Can two parallel LEDs safely share one resistor?', answer: 'It is generally not recommended for discrete LEDs. Vf variation can cause uneven current. Use an individual resistor for each branch unless a purpose-designed constant-current arrangement is used.',
    takeaway: 'Check the circuit topology before doing arithmetic.',
  },
  12: {
    eyebrow: 'COMPONENT RATING / RESISTOR POWER', title: 'A resistor also has a power limit.',
    subtitle: 'The correct resistance is not enough; the part must safely dissipate the generated heat.', tone: 'blue', visual: 'power',
    points: [
      { title: 'Calculate resistor dissipation', body: 'Use P = I²R or P = VR × I. Both describe the resistor’s electrical power under the stated operating point.', example: 'At 17.6 mA through 330 Ω: P ≈ 0.102 W.' },
      { title: 'Compare against the rating', body: 'Select a resistor whose rated power exceeds expected dissipation with appropriate margin. Ratings depend on ambient temperature, mounting, and manufacturer derating.', example: 'A nominal 0.25 W part is above 0.102 W here, but confirm worst-case supply and component tolerances.' },
      { title: 'Multiple branches', body: 'Each resistor dissipates its own branch power. Total supply power is the sum of branches and LED power.', example: 'Two identical branches at 17.6 mA draw about 35.2 mA total, while each resistor still dissipates about 0.102 W.' },
    ],
    question: 'Can a resistor be too small in power rating even if its ohmic value is correct?', answer: 'Yes. It may overheat, drift, or fail. Check the calculated power and manufacturer derating guidance.',
    takeaway: 'Resistance controls current; wattage rating controls safe heat dissipation.',
  },
  13: {
    eyebrow: 'COMPONENT IDENTIFICATION / COLOUR BANDS', title: 'Resistor bands encode a number.',
    subtitle: 'A four-band part gives two significant digits, a multiplier, and a tolerance band.', tone: 'coral', visual: 'bands',
    points: [
      { title: 'Bands 1 and 2: digits', body: 'For a four-band resistor, the first two bands form the significant-figure number.', example: 'Orange = 3, orange = 3, so the digits are 33.' },
      { title: 'Band 3: multiplier', body: 'Multiply the significant digits by the band-3 multiplier.', example: 'Brown is ×10, so 33 × 10 = 330 Ω.' },
      { title: 'Band 4: tolerance', body: 'The separated final band describes allowed resistance variation, not another digit.', example: 'Gold commonly indicates ±5%; confirm the code standard and component documentation.' },
    ],
    question: 'How do you tell which end to read from?', answer: 'The tolerance band is commonly spaced farther from the value bands; orient that band on the right, then read left to right. Confirm with markings/datasheet if spacing is ambiguous.',
    takeaway: 'Read orientation first, then digits, multiplier, and tolerance.',
  },
  14: {
    eyebrow: 'DESIGN TOOL / DECODE THE PART', title: 'Resistor colour-band decoder.',
    subtitle: 'Select each band and see the resistance, tolerance range, and the value’s role in the LED circuit.', tone: 'blue', visual: 'bands',
    points: [
      { title: '4-band mode', body: 'Two significant digits, multiplier, tolerance.', example: 'Orange–orange–brown–gold = 330 Ω ±5%.' },
      { title: '5-band mode', body: 'Three significant digits, multiplier, tolerance. Often used for tighter-tolerance values.', example: 'Brown–black–black–red–brown = 10 kΩ ±1%.' },
      { title: 'Check the tolerance interval', body: 'A 330 Ω ±5% resistor can range nominally from 313.5 Ω to 346.5 Ω before other conditions are considered.', example: 'Lower resistance causes higher LED current for the same supply and LED drop.' },
    ],
    question: 'Can the colour bands prove the exact resistance?', answer: 'No. They communicate a nominal value and tolerance. Measurement equipment gives an observed value, and the circuit still has LED/supply variation.',
    takeaway: 'Decode the nominal value, then include tolerance in worst-case current reasoning.',
  },
  15: {
    eyebrow: 'QUICK CHALLENGE / RESISTOR CODE', title: 'Decode before you reveal.',
    subtitle: 'Read the four bands left to right. Choose the correct nominal resistance and tolerance.', tone: 'lime', visual: 'bands',
    points: [
      { title: 'Try it mentally', body: 'Red · Violet · Brown · Gold', example: 'Red = 2, violet = 7, brown = ×10, gold = ±5%.' },
      { title: 'Use the decoder', body: 'Set the four controls to match the bands, then compare the computed output.', example: 'A good decoder also displays the tolerance range.' },
      { title: 'Apply it to an LED', body: 'Would this value be appropriate for the worked 9 V single-white-LED example?', example: 'Compare nominal current against the 20 mA design target and the LED datasheet.' },
    ],
    question: 'What is the answer?', answer: '270 Ω ±5%. At 9 V with a nominal 3.2 V LED, current is approximately 5.8/270 = 21.5 mA, slightly above a 20 mA target; check the actual LED rating and consider a higher standard value.',
    takeaway: 'A decoded resistor still needs a circuit-context check.',
  },
  16: {
    eyebrow: 'LED REFERENCE / TYPICAL ONLY', title: 'LED colour hints at Vf, but the datasheet decides.',
    subtitle: 'These are broad educational ranges, not guaranteed specifications. Forward voltage changes with current, temperature, and device construction.', tone: 'blue', visual: 'spectrum',
    points: [
      { title: 'Lower typical drop', body: 'Many red and infrared LEDs have lower forward voltage than blue/white devices.', example: 'A rough red example might be around 1.8–2.2 V at a stated test current.' },
      { title: 'Higher typical drop', body: 'Blue, white, and some modern green LEDs commonly require a higher forward voltage.', example: 'A rough white example might be around 2.8–3.5 V at a stated test current.' },
      { title: 'Colour is not a specification', body: 'Two LEDs of the same visible colour can differ by manufacturer, chemistry, package, and operating current.', example: 'Use the exact part datasheet’s forward-voltage curve/range at the intended current.' },
    ],
    question: 'Can I calculate a safe resistor from colour alone?', answer: 'No. Colour is a rough clue only. Use the actual LED forward-voltage specification at a relevant current and include supply/resistor tolerance.',
    takeaway: 'Reference charts teach scale; datasheets support real component choices.',
  },
  17: {
    eyebrow: 'DEVICE PHYSICS / CURRENT-VOLTAGE', title: 'An LED’s I–V curve has a knee.',
    subtitle: 'Below the knee, current is tiny; above it, current can rise steeply with a small voltage change.', tone: 'coral', visual: 'iv',
    points: [
      { title: 'Forward region', body: 'As forward voltage approaches the device’s conduction region, current begins increasing rapidly.', example: 'There is no single exact “on voltage” independent of current and temperature.' },
      { title: 'Why a resistor matters', body: 'A voltage source alone plus a steep diode curve can produce excessive current. A series resistor adds a predictable slope and sets an operating point.', example: 'The resistor load line intersects the LED I–V curve at the circuit operating point.' },
      { title: 'Reverse region', body: 'LED reverse-voltage limits are often low. A simple teaching circuit should use correct forward polarity rather than relying on reverse operation.', example: 'Check the device datasheet; do not intentionally test breakdown.' },
    ],
    question: 'Why can a small voltage increase cause a large current increase?', answer: 'The diode’s forward I–V relationship is nonlinear and steep near conduction. The series resistance limits how far the current can rise.',
    takeaway: 'The source, resistor, and LED curve together determine the operating point.',
  },
  18: {
    eyebrow: 'INTERACTIVE MODEL / LED + LOAD LINE', title: 'Move the operating point safely.',
    subtitle: 'Explore a simplified LED I–V curve and resistor load line. The chart is illustrative, not a specific component datasheet.', tone: 'coral', visual: 'iv',
    points: [
      { title: 'Choose a model LED', body: 'Select a colour and its nominal forward-voltage reference point.', example: 'The curve is a teaching approximation calibrated at a typical current.' },
      { title: 'Change supply or resistance', body: 'A higher supply or lower resistance shifts the circuit toward higher current.', example: 'Watch the operating point relative to the 20 mA teaching reference.' },
      { title: 'Observe the danger zone', body: 'If the model current exceeds the selected design reference, the indicator warns that a real part may be overstressed.', example: 'Absolute maximum and continuous current limits are part-specific; use the datasheet.' },
    ],
    question: 'Does this simulator predict the exact LED lifetime or failure point?', answer: 'No. It uses a simplified mathematical curve and does not model junction temperature, pulse conditions, package thermal resistance, ageing, or exact part variation.',
    takeaway: 'Use the model to reason about trends; use measured data and the datasheet for engineering decisions.',
  },
  19: {
    eyebrow: 'FAILURE MODE / OVERCURRENT', title: 'Overcurrent creates heat—and can destroy the LED.',
    subtitle: 'A bare LED connected directly to a 9 V battery has no reliable current-limiting mechanism.', tone: 'coral', visual: 'damage',
    points: [
      { title: 'Current rises too far', body: 'The forward junction conducts heavily once driven beyond its normal operating point.', example: 'A battery’s internal resistance is not a design resistor.' },
      { title: 'Heat accumulates', body: 'Electrical power in the LED junction rises, temperature increases, and light output/forward voltage may shift.', example: 'Excess temperature can accelerate degradation or cause immediate failure.' },
      { title: 'Failure is not a protection strategy', body: 'An LED may go open-circuit, short, flicker, or fail unpredictably. It can also stress other components or the source.', example: 'Use a resistor/driver sized from supply, LED data, and the intended operating point.' },
    ],
    question: 'Will a 9 V battery always supply enough current to burn an LED?', answer: 'The outcome varies by battery and circuit, but relying on source internal resistance is unsafe and unpredictable. Always design current limiting.',
    takeaway: 'Protection belongs in the circuit design, not in hoping the component survives.',
  },
  20: {
    eyebrow: 'MICROCONTROLLER / DIGITAL OUTPUT', title: 'GPIO is a logic signal, not a power rail.',
    subtitle: 'For an Uno LED circuit, the pin switches a small current through a resistor and LED; it does not replace the resistor.', tone: 'lime', visual: 'gpio',
    points: [
      { title: 'Pin direction', body: 'Set a pin to OUTPUT before commanding HIGH or LOW. A pin configured incorrectly may not produce the state you expect.', example: 'D3 and D5 are used in the LED/button examples.' },
      { title: 'Stay within limits', body: 'Consult official board documentation for per-pin and total-port current/voltage limits. Limits depend on the exact controller and board.', example: 'An LED series resistor reduces current; a motor needs a driver.' },
      { title: 'Status and signal', body: 'A digital output can represent a state. High/low voltage is board-specific, even though code uses HIGH/LOW names.', example: 'Uno R3 uses 5 V logic; ESP32 GPIO is generally 3.3 V and not 5 V tolerant.' },
    ],
    question: 'If an LED looks dim, should I remove the resistor?', answer: 'No. Check polarity, wiring, resistor value, supply, and component specifications. Never remove the required current limit to make it brighter.',
    takeaway: 'Logic pins command circuits; they are not substitutes for load design.',
  },
  23: {
    eyebrow: 'CODE TRACE / SETUP AND LOOP', title: 'The program repeats a predictable sequence.',
    subtitle: 'Week 2 code starts with setup, reads a pin or sets an output, then repeats the main behaviour.', tone: 'blue', visual: 'code',
    points: [
      { title: 'Configure once', body: '`setup()` runs after reset. Set pin modes and start serial communication here.', example: '`pinMode(LED_PIN, OUTPUT);`' },
      { title: 'Repeat behaviour', body: '`loop()` runs again and again. Each pass can set a state, wait, sample an input, and update an output.', example: 'Avoid adding delays without thinking about what else cannot be checked during that wait.' },
      { title: 'Observe and test', body: 'Use Serial output and visible pins to compare expected and observed behaviour. Compile success does not prove circuit correctness.', example: 'Change one thing, state a prediction, run, then record the result.' },
    ],
    question: 'Why use named constants for pin numbers?', answer: 'Names express intent and reduce mistakes when reading or changing the sketch; the pin map should still match the physical/simulated wiring.',
    takeaway: 'Write code that a teammate can trace against the diagram.',
  },
  24: {
    eyebrow: 'DIGITAL INPUT / BUTTON', title: 'A button is a circuit state, not a software event by itself.',
    subtitle: 'The input pin needs a defined electrical level when the switch is open and when it is closed.', tone: 'blue', visual: 'button',
    points: [
      { title: 'Open switch', body: 'Without a pull-up or pull-down, the pin may float and noise can make it appear to change randomly.', example: 'A floating input is not a reliable “off” state.' },
      { title: 'Closed switch', body: 'The button connects the input to a known reference, such as GND in an INPUT_PULLUP circuit. The flat edge on many LED packages marks the cathode.', example: 'With an internal pull-up, released = HIGH; pressed = LOW.' },
      { title: 'Mechanical bounce', body: 'Contacts can chatter for a few milliseconds, producing multiple transitions. A held-state demo may tolerate this; count-once actions may need debounce.', example: 'We will focus on stable state reading first, then revisit edge handling.' },
    ],
    question: 'Why can pressed = LOW be correct?', answer: 'The pull-up holds the pin HIGH while open; pressing connects the pin to GND, producing LOW. Software can invert that state into a named “pressed” Boolean.',
    takeaway: 'Understand the circuit’s electrical truth table before writing the if-statement.',
  },
  25: {
    eyebrow: 'DIGITAL INPUT / INTERNAL PULL-UP', title: 'INPUT_PULLUP gives an open button a default state.',
    subtitle: 'One side of the button goes to the input pin and the other to ground; the microcontroller enables a weak internal pull-up.', tone: 'lime', visual: 'pullup',
    points: [
      { title: 'Released', body: 'The pull-up gently biases the input toward logic HIGH, preventing it from floating.', example: 'digitalRead(pin) returns HIGH.' },
      { title: 'Pressed', body: 'The switch connects the input to GND, which is the defined LOW state.', example: 'digitalRead(pin) returns LOW.' },
      { title: 'Logic interpretation', body: 'Convert the electrical level to a meaningful Boolean name so the program reads naturally.', example: 'bool pressed = (digitalRead(BUTTON_PIN) == LOW);' },
    ],
    question: 'Do you need an external resistor for this exact internal-pull-up wiring?', answer: 'Usually not for a simple button input, because the MCU provides a pull-up. Follow the board documentation and the particular circuit; external networks may be needed for other constraints.',
    takeaway: 'Name states by meaning, not just by raw voltage level.',
  },
};

const chapters = [
  { index: 0, name: 'OPENING' }, { index: 3, name: 'LED PHYSICS' },
  { index: 9, name: 'RESISTOR LAB' }, { index: 16, name: 'LED CHARACTERISTICS' },
  { index: 20, name: 'DIGITAL I/O' }, { index: 28, name: 'TEST + APPLY' },
];
const slideDurations = [2, 3, 4, 6, 5, 6, 6, 7, 6, 12, 6, 6, 5, 12, 8, 10, 6, 6, 10, 6, 6, 16, 8, 6, 6, 10, 14, 10, 8, 18, 6];
const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const e24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];

const bandColorOptions = [
  { name: 'Red', vf: 2.0, range: '1.8–2.2', hex: '#ff625c' },
  { name: 'Amber', vf: 2.1, range: '2.0–2.3', hex: '#ff9b43' },
  { name: 'Yellow', vf: 2.1, range: '2.0–2.4', hex: '#f4d447' },
  { name: 'Green', vf: 2.2, range: '2.0–3.2', hex: '#6ed484' },
  { name: 'Blue', vf: 3.1, range: '2.8–3.5', hex: '#62b7ff' },
  { name: 'White', vf: 3.2, range: '2.8–3.5', hex: '#e9f4f4' },
  { name: 'Infrared', vf: 1.3, range: '1.1–1.6', hex: '#d887ff' },
];

function formatTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

function chapterAt(index: number) {
  for (let chapterIndex = chapters.length - 1; chapterIndex >= 0; chapterIndex--) {
    if (index >= chapters[chapterIndex].index) return chapterIndex;
  }
  return 0;
}

function formatOhms(value: number) {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toPrecision(4))} MΩ`;
  if (value >= 1_000) return `${Number((value / 1_000).toPrecision(4))} kΩ`;
  return `${Number(value.toPrecision(4))} Ω`;
}

function formatWatts(value: number) {
  if (value < 0.001) return `${(value * 1000).toPrecision(3)} mW`;
  return `${value.toPrecision(3)} W`;
}

function nextPreferredResistance(ideal: number, seriesName: 'E12' | 'E24') {
  const series = seriesName === 'E12' ? e12 : e24;
  for (let decade = -1; decade <= 8; decade++) {
    const scale = 10 ** decade;
    for (const base of series) {
      const candidate = base * scale;
      if (candidate + 1e-9 >= ideal) return candidate;
    }
  }
  return ideal;
}

type AppProps = { addPoints: (amount: number) => void; motionEnabled: boolean };

function App() {
  const [slide, setSlide] = useState(0);
  const [points, setPoints] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const animated = motionEnabled && !reducedMotion;
  const elapsedMinutes = slideDurations.slice(0, slide).reduce((total, duration) => total + duration, 0);
  const activeChapter = chapterAt(slide);
  const goTo = (index: number) => setSlide(Math.min(slideNames.length - 1, Math.max(0, index)));
  const addPoints = (amount: number) => setPoints((current) => current + amount);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); setSlide((value) => Math.min(slideNames.length - 1, value + 1)); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); setSlide((value) => Math.max(0, value - 1)); }
      if (event.key === 'Home') setSlide(0);
      if (event.key === 'End') setSlide(slideNames.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { document.title = `EEE4015 / Week 02 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; }, [slide]);

  const props: AppProps = { addPoints, motionEnabled: animated };

  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar">
        <div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems">
          <span className="course-mark__symbol"><Cpu size={21} /></span>
          <span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span>
        </div>
        <div className="topbar-center"><span className="week-tag">WEEK 02</span><span className="topbar-divider" /><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsedMinutes)}<i>/</i>04:00</b></span></div>
        <div className="topbar-tools">
          <div className="score-chip" aria-live="polite"><Sparkles size={16} /><span>{points} XP</span></div>
          <button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17} /> : <Play size={17} />}</button>
          <button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17} /></button>
        </div>
      </header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsedMinutes)} of 04:00`}>
        <motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? 0.4 : 0 }} />
        <span className="progress-track__glint" />
      </div>
      <main className="stage" ref={stageRef}>
        <div className="stage-grid" aria-hidden="true" />
        <div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.section className="slide" key={slide} aria-labelledby={`week2-title-${slide}`} initial={animated ? { opacity: 0, y: 16, filter: 'blur(5px)' } : false} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={animated ? { opacity: 0, y: -10, filter: 'blur(4px)' } : { opacity: 0 }} transition={{ duration: animated ? 0.28 : 0, ease: 'easeOut' }}>
            {renderSlide(slide, props, goTo)}
          </motion.section>
        </AnimatePresence>
      </main>
      <footer className="bottombar">
        <div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div>
        <nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, chapterIndex) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === chapterIndex ? 'is-active' : ''}`} aria-label={`Go to chapter ${chapterIndex + 1}: ${chapter.name}`} aria-current={activeChapter === chapterIndex ? 'step' : undefined} onClick={() => goTo(chapter.index)} />)}</nav>
        <div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18} /></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18} /></button></div>
      </footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, props: AppProps, goTo: (index: number) => void) {
  switch (index) {
    case 0: return <Welcome {...props} onStart={() => goTo(2)} />;
    case 1: return <Agenda />;
    case 2: return <RecallQuiz {...props} />;
    case 9: return <ResistorLab />;
    case 13: return <BandCalculator />;
    case 14: return <BandQuiz />;
    case 15: return <BreakSlide />;
    case 16: return <LedReference />;
    case 18: return <IvLab />;
    case 19: return <OvercurrentDemo />;
    case 21: return <LedCircuitSimulation />;
    case 22: return <CodeTrace />;
    case 25: return <ButtonSimulation />;
    case 26: return <ButtonLedSimulation />;
    case 27: return <BreakSlide second />;
    case 28: return <DebugSlide />;
    case 29: return <TeamChallenge />;
    case 30: return <ExitTicket />;
    default: return lessonData[index] ? <Explainer slideIndex={index} data={lessonData[index]} /> : <Agenda />;
  }
}

function Eyebrow({ children, tone = 'lime' }: { children: React.ReactNode; tone?: 'lime' | 'coral' | 'blue' }) {
  return <p className={`eyebrow eyebrow--${tone}`}><span />{children}</p>;
}

function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: React.ReactNode; subtitle: string; tone?: 'lime' | 'coral' | 'blue' }) {
  return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week2-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>;
}

function Explainer({ slideIndex, data }: { slideIndex: number; data: LessonData }) {
  return <article className="teaching-layout"><header className="teaching-heading"><Heading slide={slideIndex} eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} tone={data.tone} /><div className="reading-time"><span>TAKE YOUR TIME</span><b>{slideDurations[slideIndex]}<small>MIN</small></b></div></header><div className="teaching-body"><div className="teaching-points">{data.points.map((point, pointIndex) => <article className="teaching-point" key={point.title}><span className={`teaching-point__number teaching-point__number--${data.tone}`}>0{pointIndex + 1}</span><div><h2>{point.title}</h2><p>{point.body}</p><small>{point.example}</small></div></article>)}</div><aside className="teaching-aside"><Visual kind={data.visual} /><div className={`answer-card answer-card--${data.tone}`}><span className="answer-card__label"><CircleHelp size={15} /> A QUESTION WE SHOULD ANSWER</span><h2>{data.question}</h2><p>{data.answer}</p></div><div className="class-prompt"><span>PAUSE & ASK</span><p>{data.takeaway}</p></div></aside></div><div className="lesson-takeaway"><Lightbulb size={18} /><span>TAKEAWAY</span><p>{data.takeaway}</p><small>{formatTime(slideDurations.slice(0, slideIndex).reduce((total, duration) => total + duration, 0))} START</small></div></article>;
}

function Visual({ kind }: { kind: LessonData['visual'] }) {
  const labels: Record<LessonData['visual'], { title: string; caption: string; description: string }> = {
    led: { title: 'LED CROSS-SECTION', caption: 'Forward current through a junction releases light.', description: 'Schematic LED symbol with anode, cathode, and emitted light.' },
    polarity: { title: 'FORWARD BIAS', caption: 'Anode toward positive through a resistor; cathode toward return.', description: 'LED polarity diagram showing anode positive and cathode negative.' },
    ohms: { title: 'SERIES LOOP', caption: 'Current is shared; voltage drops add around the loop.', description: 'Battery, resistor, and LED in one series circuit.' },
    battery: { title: '9 V DESIGN CASE', caption: 'Two LED drops leave the voltage that the resistor must absorb.', description: 'A 9 volt battery feeds a resistor and two series LEDs.' },
    formula: { title: 'RESISTOR METHOD', caption: 'Vsupply − total Vf, then divide by target current.', description: 'Three-stage resistor sizing calculation.' },
    power: { title: 'POWER CHECK', caption: 'Compute resistor watts, then compare with its rated dissipation.', description: 'Resistor power formula and safety margin scale.' },
    gpio: { title: 'GPIO + LED', caption: 'A logic pin commands; the resistor limits LED branch current.', description: 'Uno output pin connected to series resistor and LED to ground.' },
    bands: { title: 'BAND ORDER', caption: 'Digits → multiplier → tolerance.', description: 'Resistor body with four labelled color bands.' },
    spectrum: { title: 'TYPICAL Vf RANGES', caption: 'Indicative values only; actual LED data sheet takes priority.', description: 'Color spectrum showing approximate forward voltage ranges for LED colors.' },
    iv: { title: 'I–V + LOAD LINE', caption: 'The intersection is the model operating point.', description: 'LED current voltage characteristic and resistor load line graph.' },
    damage: { title: 'CURRENT LIMIT', caption: 'Too much current causes excess junction heating and failure risk.', description: 'LED with a safe current region and a marked overcurrent region.' },
    code: { title: 'SKETCH FLOW', caption: 'Configure once; repeat the observable behavior.', description: 'Arduino setup, loop, pin state, and output flow.' },
    button: { title: 'BUTTON INPUT', caption: 'A pull-up or pull-down keeps an open input from floating.', description: 'Button switch changes a GPIO input between a defined high and low level.' },
    pullup: { title: 'INPUT_PULLUP', caption: 'Released = HIGH; pressed to ground = LOW.', description: 'Internal pull-up resistor connects input toward supply and button to ground.' },
    test: { title: 'TEST → OBSERVE → EXPLAIN', caption: 'Change one condition and record what the circuit actually does.', description: 'Test loop from prediction through observation to explanation.' },
    branches: { title: 'LED BRANCHES', caption: 'Each parallel LED string needs its own current-limiting resistor.', description: 'Parallel LED strings each have a separate series resistor and LED chain connected across the same supply.' },
  };
  const meta = labels[kind];
  return <figure className={`visual-panel visual-panel--${kind}`}><div className="visual-panel__heading"><span>{meta.title}</span><i>W02</i></div><svg className="lesson-visual" viewBox="0 0 360 142" role="img" aria-label={meta.description}>{drawVisual(kind)}</svg><figcaption>{meta.caption}</figcaption></figure>;
}

function VBlock({ x, y, w, h, title, sub, tone = 'lime' }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: 'lime' | 'coral' | 'blue' }) {
  return <g className={`v-block v-block--${tone}`}><rect x={x} y={y} width={w} height={h} rx="5" /><text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle" className="v-title">{title}</text>{sub && <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" className="v-sub">{sub}</text>}</g>;
}

function drawVisual(kind: LessonData['visual']) {
  switch (kind) {
    case 'led': return <><path d="M52 72 H130 M130 52 V92 L185 72 Z M185 52 V92" className="v-wire" /><path d="M150 47 L170 31 M158 56 L178 40" className="v-ray" /><text x="71" y="61" className="v-label">ANODE +</text><text x="181" y="109" className="v-label">CATHODE −</text><text x="212" y="42" className="v-label">LIGHT</text><circle cx="146" cy="72" r="3" className="v-node" /></>;
    case 'polarity': return <><text x="24" y="42" className="v-blue">+ SUPPLY</text><path d="M42 70 H125 M125 52 V88 L179 70 Z M179 50 V90 H318" className="v-wire" /><text x="117" y="112" className="v-label">ANODE</text><text x="173" y="112" className="v-label">CATHODE</text><path d="M207 58 L223 44 M215 66 L231 52" className="v-ray" /><text x="245" y="42" className="v-coral">FORWARD CURRENT →</text></>;
    case 'ohms': return <><rect x="20" y="24" width="56" height="92" rx="8" className="v-battery" /><text x="48" y="67" textAnchor="middle" className="v-title">V</text><path d="M76 70 H118 M188 70 H226 M282 70 H322 V118 H48 V116" className="v-wire" /><VBlock x={118} y={48} w={70} h={44} title="R" sub="limits I" tone="coral" /><VBlock x={226} y={48} w={56} h={44} title="LED" sub="drops Vf" tone="blue" /><text x="206" y="128" textAnchor="middle" className="v-small">Vsource = VR + Vf</text></>;
    case 'battery': return <><VBlock x={14} y={43} w={68} h={49} title="9 V" sub="battery" tone="coral" /><VBlock x={112} y={43} w={74} h={49} title="R" sub="series" /><VBlock x={215} y={30} w={50} h={38} title="LED 1" sub="Vf" tone="blue" /><VBlock x={284} y={76} w={50} h={38} title="LED 2" sub="Vf" tone="blue" /><path d="M82 68 H109 M186 68 H199 V49 H212 M265 49 H274 V95 H281 M334 95 H346 V130 H48 V94" className="v-wire" /><text x="184" y="23" textAnchor="middle" className="v-small">ONE SERIES STRING</text></>;
    case 'formula': return <><VBlock x={12} y={42} w={99} h={53} title="1  SUBTRACT" sub="Vs − ΣVf" tone="blue" /><path d="M111 68 H130 M230 68 H249" className="v-arrow" /><VBlock x={130} y={42} w={100} h={53} title="2  DIVIDE" sub="VR / Itarget" /><VBlock x={249} y={42} w={100} h={53} title="3  CHECK" sub="Iactual + P" tone="coral" /><text x="180" y="125" textAnchor="middle" className="v-small">R = (Vs − ΣVf) / I</text></>;
    case 'power': return <><rect x="15" y="21" width="205" height="96" rx="7" className="v-card" /><text x="32" y="53" className="v-formula">P = I²R</text><text x="32" y="77" className="v-formula">P = VR × I</text><path d="M244 35 V111" className="v-axis" /><rect x="258" y="78" width="82" height="28" rx="4" className="v-safe" /><rect x="258" y="48" width="82" height="23" rx="4" className="v-warn" /><text x="299" y="66" textAnchor="middle" className="v-small">RATING</text><text x="299" y="97" textAnchor="middle" className="v-small">OPERATING P</text></>;
    case 'gpio': return <><VBlock x={11} y={49} w={87} h={44} title="UNO D3" sub="logic output" tone="blue" /><VBlock x={135} y={49} w={75} h={44} title="330 Ω" sub="resistor" tone="coral" /><VBlock x={250} y={49} w={88} h={44} title="LED → GND" sub="load path" /><path d="M98 71 H132 M210 71 H247" className="v-wire" /><text x="179" y="124" textAnchor="middle" className="v-small">PIN COMMAND ≠ UNLIMITED CURRENT</text></>;
    case 'bands': return <><rect x="47" y="47" width="265" height="49" rx="24" className="v-resistor" /><rect x="101" y="47" width="18" height="49" className="band band--orange" /><rect x="145" y="47" width="18" height="49" className="band band--orange" /><rect x="192" y="47" width="18" height="49" className="band band--brown" /><rect x="272" y="47" width="18" height="49" className="band band--gold" /><text x="110" y="31" textAnchor="middle" className="v-label">DIGIT</text><text x="154" y="31" textAnchor="middle" className="v-label">DIGIT</text><text x="201" y="31" textAnchor="middle" className="v-label">×10</text><text x="281" y="31" textAnchor="middle" className="v-label">TOL.</text><text x="180" y="126" textAnchor="middle" className="v-small">ORANGE · ORANGE · BROWN · GOLD = 330 Ω ±5%</text></>;
    case 'spectrum': return <><line x1="28" y1="105" x2="333" y2="105" className="v-axis" /><text x="30" y="126" className="v-small">1 V</text><text x="318" y="126" className="v-small">4 V</text>{[['IR',1.3,'#d887ff'],['RED',2.0,'#ff625c'],['GREEN',2.5,'#6ed484'],['BLUE',3.1,'#62b7ff'],['WHITE',3.2,'#e9f4f4']].map(([label,value,color],itemIndex)=><g key={String(label)}><circle cx={65 + Number(value)*68} cy={43+itemIndex*10} r="5" fill={String(color)} /><text x={75+Number(value)*68} y={47+itemIndex*10} className="v-label">{String(label)} · {Number(value).toFixed(1)}V</text></g>)}</>;
    case 'iv': return <><path d="M44 118 V22 M44 118 H335" className="v-axis" /><path d="M48 113 C190 113 235 109 260 98 C280 89 281 63 286 35" className="v-curve" /><path d="M54 31 L322 112" className="v-loadline" /><circle cx="274" cy="86" r="7" className="v-point" /><text x="52" y="20" className="v-label">I (mA)</text><text x="304" y="135" className="v-label">Vf (V)</text><text x="236" y="112" className="v-small">operating point</text><text x="183" y="37" className="v-blue">LED CURVE</text><text x="74" y="45" className="v-coral">RESISTOR LOAD LINE</text></>;
    case 'damage': return <><circle cx="83" cy="71" r="37" className="v-diode-safe" /><path d="M47 72 H75 M75 51 V93 L115 72 Z M115 51 V93 H142" className="v-wire" /><path d="M154 108 C176 108 181 34 202 34 H324" className="v-safe-line" /><path d="M202 34 V108 H324" className="v-danger-fill" /><text x="223" y="28" className="v-green">SAFE DESIGN REGION</text><text x="223" y="126" className="v-coral">OVER-CURRENT RISK</text></>;
    case 'code': return <><VBlock x={15} y={37} w={91} h={58} title="setup()" sub="pinMode" tone="blue" /><VBlock x={135} y={37} w={91} h={58} title="loop()" sub="repeat" /><VBlock x={255} y={37} w={91} h={58} title="OUTPUT" sub="HIGH / LOW" tone="coral" /><path d="M106 66 H132 M226 66 H252" className="v-arrow" /><path d="M300 102 V122 H180 V99" className="v-loop" /><text x="178" y="139" textAnchor="middle" className="v-small">CONFIGURE → EXECUTE → OBSERVE → REPEAT</text></>;
    case 'button': return <><VBlock x={16} y={45} w={92} h={52} title="INPUT PIN" sub="read logic" tone="blue" /><path d="M108 71 H152" className="v-wire" /><circle cx="175" cy="71" r="18" className="v-switch" /><path d="M157 71 H193 M175 53 V40" className="v-wire" /><VBlock x={230} y={45} w={112} h={52} title="BUTTON" sub="open / closed" tone="coral" /><text x="180" y="124" textAnchor="middle" className="v-small">INPUT MUST HAVE A DEFINED DEFAULT LEVEL</text></>;
    case 'pullup': return <><VBlock x={25} y={20} w={80} h={30} title="VCC" tone="blue" /><VBlock x={25} y={83} w={80} h={30} title="INPUT" tone="lime" /><VBlock x={145} y={45} w={70} h={35} title="PULL-UP" sub="internal R" tone="coral" /><path d="M105 35 H180 V44 M105 98 H130 V62 H142" className="v-wire" /><path d="M215 62 H272 V45 M272 45 L299 73 M299 73 H328 V100" className="v-wire" /><text x="284" y="32" className="v-small">SWITCH</text><text x="180" y="132" textAnchor="middle" className="v-small">RELEASED HIGH · PRESSED LOW</text></>;
    case 'branches': return <><VBlock x={8} y={27} w={57} h={82} title="9 V" sub="supply" tone="blue"/><VBlock x={91} y={26} w={76} h={30} title="R1" sub="branch 1" tone="coral"/><VBlock x={91} y={81} w={76} h={30} title="R2" sub="branch 2" tone="coral"/><VBlock x={221} y={26} w={77} h={30} title="LED 1" sub="string 1"/><VBlock x={221} y={81} w={77} h={30} title="LED 2" sub="string 2"/><path d="M65 68 H78 V41 H88 M78 96 H88 M167 41 H218 M167 96 H218 M298 41 H327 V68 H344 M298 96 H327" className="v-wire"/><text x="344" y="64" className="v-label">RETURN</text></>;
    case 'test': return <><VBlock x={9} y={48} w={79} h={49} title="PREDICT" sub="expected" tone="blue" /><VBlock x={101} y={48} w={79} h={49} title="RUN" sub="one change" /><VBlock x={193} y={48} w={79} h={49} title="OBSERVE" sub="actual" tone="coral" /><VBlock x={285} y={48} w={68} h={49} title="LOG" sub="evidence" /><path d="M88 72 H98 M180 72 H190 M272 72 H282" className="v-arrow" /><text x="180" y="128" textAnchor="middle" className="v-small">ONE VARIABLE AT A TIME</text></>;
  }
}

function Welcome({ addPoints, onStart }: AppProps & { onStart: () => void }) {
  return <div className="welcome-layout"><div className="welcome-copy"><Eyebrow>FIELD NOTES / 02</Eyebrow><h1 id="week2-title-0">Light it.<br /><span>Limit it.</span></h1><p className="welcome-lede">A four-hour practical lesson on digital I/O, LED physics, resistor selection, and beginner Arduino circuits.</p><div className="welcome-meta"><span><b>31</b> SCREENS</span><span><b>2</b> BREAKS</span><span><b>240</b> MINUTES</span></div><button className="primary-button" onClick={onStart} type="button">START THE MISSION <ArrowRight size={18} /></button></div><div className="welcome-art"><div className="hero-orbit"/><div className="hero-battery"><Battery size={58}/><span>9 V</span></div><div className="hero-resistor"><span>R</span></div><div className="hero-led"/><div className="hero-current">I →</div><div className="hero-caption">SUPPLY <i>→</i> LIMIT <i>→</i> LIGHT</div><button className="art-answer" type="button" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 READY POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Calculate a safe LED resistor</div><div><Check size={16}/> Read colour bands</div><div><Check size={16}/> Explain a button input</div></div></div>;
}

function Agenda() {
  const blocks = [
    ['00:00–01:02', 'LED physics + resistor sizing', 'Polarity, 9 V example, live calculator'],
    ['01:02–01:46', 'Resistor codes + LED characteristics', 'Band decoder, colour Vf, I–V explorer'],
    ['01:46–02:02', 'BREAK', 'Optional 10-minute silent timer + transition'],
    ['02:02–02:54', 'Arduino digital output + LED circuit', 'GPIO, Tinkercad model, code trace'],
    ['02:54–03:08', 'BREAK', 'Optional 10-minute silent timer + transition'],
    ['03:08–04:00', 'Digital inputs + design practice', 'Buttons, tests, team challenge, exit ticket'],
  ];
  return <div className="agenda-layout"><div className="agenda-heading"><Heading slide={1} eyebrow="TODAY’S ROUTE / 240 MINUTES" title={<>Understand the part.<br/><span className="text-lime">Then trust the circuit.</span></>} subtitle="Short theory blocks alternate with prediction, simulation, explanation, and evidence."/><div className="duration-seal"><b>04:00</b><span>CLASS TIME</span><small>2 BREAKS</small></div></div><div className="agenda-list">{blocks.map((block, index)=><div className={`agenda-row ${block[1] === 'BREAK' ? 'agenda-row--break' : ''}`} key={block[1]}><span>0{index+1}</span><b>{block[0]}</b><div><strong>{block[1]}</strong><p>{block[2]}</p></div><i/></div>)}</div><p className="agenda-note"><b>LEARNING LOOP</b> Explain → predict → simulate → compare → record. The simulation demonstrates a model; physical measurements, when available, are labelled separately.</p></div>;
}

function RecallQuiz({ addPoints }: AppProps) {
  const [choice, setChoice] = useState<number | null>(null);
  const choices = ['A rule that acts on an input and changes an output', 'A particular Arduino model', 'A computer that must be connected to the internet'];
  return <div className="quiz-layout"><div><Heading slide={2} eyebrow="WEEK 1 RECALL / 90 SECONDS" title={<>A quick system<br/><span className="text-blue">check-in.</span></>} subtitle="Before the LED, remember the model: input → decision → output." tone="blue"/><div className="recall-flow"><VBlock x={10} y={32} w={94} h={52} title="INPUT" sub="button / sensor" tone="blue"/><VBlock x={133} y={32} w={94} h={52} title="DECISION" sub="program rule"/><VBlock x={256} y={32} w={94} h={52} title="OUTPUT" sub="LED / status" tone="coral"/><path d="M104 58 H130 M227 58 H253" className="v-arrow"/></div></div><div className="quiz-panel"><span className="quiz-label">CHOOSE THE BEST ANSWER</span><h2>What makes the controller part of an embedded system?</h2>{choices.map((text,index)=><button key={text} className={`quiz-choice ${choice===index?(index===0?'is-correct':'is-wrong'):''}`} onClick={()=>{if(choice!==null)return;setChoice(index);if(index===0)addPoints(10);}} disabled={choice!==null}><span>{String.fromCharCode(65+index)}</span>{text}{choice===index&&(index===0?<Check size={17}/>:<X size={17}/>)}</button>)}{choice!==null&&<p className="quiz-response" aria-live="polite">{choice===0?'Exactly. The controller reads the input, follows its program, and drives the output.':'Think system-level: what information comes in, what decision happens, and what can we observe?'}</p>}</div></div>;
}

function ResistorLab() {
  const [supply, setSupply] = useState(9);
  const [ledName, setLedName] = useState('White');
  const [ledCount, setLedCount] = useState(1);
  const [targetMa, setTargetMa] = useState(20);
  const [branchCount, setBranchCount] = useState(1);
  const [seriesName, setSeriesName] = useState<'E12'|'E24'>('E12');
  const led = bandColorOptions.find((item)=>item.name===ledName)!;
  const resistorVoltage = supply-led.vf*ledCount;
  const ideal = resistorVoltage/(targetMa/1000);
  const selected = resistorVoltage>0?nextPreferredResistance(ideal,seriesName):0;
  const currentMa = selected>0?resistorVoltage/selected*1000:0;
  const powerEach = selected>0?(currentMa/1000)**2*selected:0;
  const wattage = standardWattages.find((rating)=>rating>=powerEach*2)??standardWattages[standardWattages.length-1];
  const valid = resistorVoltage>0&&Number.isFinite(ideal);
  return <div className="resistor-lab-layout"><div className="lab-heading"><Heading slide={9} eyebrow="INTERACTIVE DESIGN BENCH / 01" title={<>Size the resistor.<br/><span className="text-lime">See the trade-off.</span></>} subtitle="Start with the supplied 9 V LED circuit, then change one design input at a time."/><p className="sim-label"><Activity size={15}/> LIVE CALCULATION · IDEAL COMPONENT MODEL</p></div><div className="resistor-lab-grid"><div className="lab-controls"><div className="control-title"><span>01</span><b>DESIGN INPUTS</b></div><label>Supply voltage <div className="input-with-unit"><input type="number" min="1" max="24" step="0.5" value={supply} onChange={(event)=>setSupply(Number(event.target.value)||0)}/><span>V</span></div></label><label>LED colour / typical Vf <select value={ledName} onChange={(event)=>setLedName(event.target.value)}>{bandColorOptions.map((item)=><option key={item.name} value={item.name}>{item.name} · {item.vf.toFixed(1)} V nominal</option>)}</select></label><label>LEDs in series <div className="range-line"><input type="range" min="1" max="4" value={ledCount} onChange={(event)=>setLedCount(Number(event.target.value))}/><b>{ledCount}</b></div></label><label>Target current <div className="input-with-unit"><input type="number" min="1" max="30" step="1" value={targetMa} onChange={(event)=>setTargetMa(Number(event.target.value)||1)}/><span>mA</span></div></label><label>Parallel strings <div className="range-line"><input type="range" min="1" max="4" value={branchCount} onChange={(event)=>setBranchCount(Number(event.target.value))}/><b>{branchCount}</b></div></label><label>Preferred series<select value={seriesName} onChange={(event)=>setSeriesName(event.target.value as 'E12'|'E24')}><option>E12</option><option>E24</option></select></label></div><div className="circuit-model"><div className="control-title"><span>02</span><b>ONE RESISTOR PER PARALLEL STRING</b></div><svg viewBox="0 0 620 300" role="img" aria-label={`9 volt circuit with ${branchCount} parallel branches; each has its own ${formatOhms(selected)} resistor and ${ledName.toLowerCase()} LED`}>{drawInteractiveCircuit({branchCount,resistor:valid?formatOhms(selected):'—',ledColor:led.hex})}</svg><div className="circuit-legend"><span><i className="legend-dot legend-dot--signal"/>CONVENTIONAL CURRENT</span><span><i className="legend-dot legend-dot--power"/>SUPPLY / RETURN</span></div></div></div><div className="results-strip"><Result label="LED DROP / STRING" value={valid?`${(led.vf*ledCount).toFixed(1)} V`:'Exceeds supply'} tone={valid?'blue':'danger'}/><Result label="IDEAL R" value={valid?formatOhms(ideal):'No valid value'} tone="neutral"/><Result label={`CHOOSE (${seriesName})`} value={valid?formatOhms(selected):'Redesign string'} tone="lime"/><Result label="ACTUAL BRANCH I" value={valid?`${currentMa.toFixed(1)} mA`:'—'} tone={currentMa>targetMa*1.03?'danger':'blue'}/><Result label="RESISTOR POWER" value={valid?`${formatWatts(powerEach)} each`:'—'} tone="neutral"/><Result label="MIN. RATING ×2 MARGIN" value={valid?`${wattage} W`:'—'} tone="neutral"/></div><div className={`lab-warning ${!valid||currentMa>targetMa*1.03?'lab-warning--danger':''}`} aria-live="polite">{!valid?<><AlertTriangle size={18}/><p><b>Series string exceeds the supply.</b> {ledCount} × {led.vf.toFixed(1)} V = {(ledCount*led.vf).toFixed(1)} V, above {supply} V. Reduce series count or use a suitable supply.</p></>:currentMa>targetMa*1.03?<><AlertTriangle size={18}/><p><b>Chosen current is above target.</b> Check the requested target and choose an appropriate larger resistance.</p></>:<><ShieldCheck size={18}/><p><b>Nominal calculation only.</b> Actual Vf, battery voltage, resistor tolerance, temperature, and part ratings vary. Verify the LED datasheet and use one resistor in every parallel branch.</p></>}</div><p className="lab-note">Example: one white LED at nominal Vf 3.2 V, 9 V supply, 20 mA target → 290 Ω ideal → 330 Ω E12 → about 17.6 mA nominal.</p></div>;
}

function Result({label,value,tone}:{label:string;value:string;tone:'blue'|'neutral'|'lime'|'danger'}) { return <div className={`result result--${tone}`}><span>{label}</span><b>{value}</b></div>; }

function drawInteractiveCircuit({branchCount,resistor,ledColor}:{branchCount:number;resistor:string;ledColor:string}) {
  const paths = Array.from({length:branchCount},(_,branchIndex)=>{
    const y=70+branchIndex*(170/Math.max(1,branchCount-1));
    const r=branchCount===1?145:y;
    return <g key={branchIndex}><path d={`M178 140 H215 V${r} H248 M360 ${r} H404 V140 H442`} className="wire wire--blue"/><rect x="248" y={r-12} width="72" height="24" rx="5" className="resistor-shape"/><path d={`M320 ${r} H334`} className="wire"/><path d={`M334 ${r-19} V${r+19} L367 ${r} Z M367 ${r-19} V${r+19}`} fill="none" stroke={ledColor} strokeWidth="3"/><path d={`M350 ${r-24} l10 -10 M358 ${r-17} l10 -10`} stroke={ledColor} strokeWidth="2"/><text x="284" y={r+4} className="circuit-text circuit-text--dark" textAnchor="middle">{resistor}</text><text x="286" y={r-19} className="circuit-small" textAnchor="middle">R{branchIndex+1}</text></g>;
  });
  return <><rect x="20" y="73" width="94" height="134" rx="10" className="battery-body"/><rect x="47" y="59" width="40" height="15" rx="3" className="battery-cap"/><text x="67" y="139" textAnchor="middle" className="battery-label">9 V</text><text x="67" y="229" textAnchor="middle" className="circuit-small">SUPPLY</text>
    {paths}
    <text x="376" y="365" textAnchor="middle" className="diagram-small">SERIES RESISTOR LIMITS CURRENT THROUGH EACH LED STRING</text>
  </>;
}

function CodeTrace() { const [line,setLine] = useState(0);const code=['const byte LED_PIN = 3;','void setup() {','  pinMode(LED_PIN, OUTPUT);','}','void loop() {','  digitalWrite(LED_PIN, HIGH);','  delay(500);','  digitalWrite(LED_PIN, LOW);','  delay(500);','}'];return <div className="code-layout"><div><Heading slide={22} eyebrow="CODE TRACE / LED BLINK" title={<>Follow the instruction.<br/><span className="text-blue">Predict the pin.</span></>} subtitle="Step through a minimal sketch. Which line configures the pin? Which lines change its output state?" tone="blue"/><div className="code-steps"><button onClick={()=>setLine((value)=>(value+1)%code.length)}><ArrowRight size={16}/> STEP NEXT LINE</button><button onClick={()=>setLine(0)}><RotateCcw size={15}/> RESET TRACE</button></div></div><div className="code-trace-panel"><div className="code-window-head"><span><i/>sketch.ino</span><b>{line<4?'setup()':'loop()'} / LINE {line+1}</b></div><pre>{code.map((text,index)=><div key={index} className={`code-line ${index===line?'code-line--active':''}`}><span>{String(index+1).padStart(2,'0')}</span><code>{text||' '}</code></div>)}</pre><div className="pin-state"><span>PIN D3</span><b className={line===5?'pin-high':line===7?'pin-low':''}>{line===5?'HIGH / LED ON':line===7?'LOW / LED OFF':line<4?'OUTPUT CONFIGURATION':'WAIT / LOOP'}</b><div className={`mini-led ${line===5?'mini-led--on':''}`}/></div><p className="trace-caption" aria-live="polite">{line===2?'pinMode configures D3 as an output.':line===5?'HIGH drives the output state high; with a resistor and correctly oriented LED, the LED lights.':line===7?'LOW drives the output state low; the LED turns off in this example.':'The repeated loop makes the on/off pattern observable.'}</p></div></div>; }

function ButtonSimulation() {
  const [pressed, setPressed] = useState(false);
  const [raw, setRaw] = useState<'pullup' | 'pulldown'>('pullup');
  const isHigh = raw === 'pullup' ? !pressed : pressed;
  return (
    <div className="digital-sim-layout">
      <div>
        <Heading slide={25} eyebrow="SIMULATION 02 / BUTTON INPUT" title={<>Press the switch.<br /><span className="text-blue">Watch the logic.</span></>} subtitle="Choose a pull-up or pull-down and compare the raw level with its meaning." tone="blue" />
      </div>
      <div className="digital-sim-card">
        <div className="segmented-control"><button className={raw === 'pullup' ? 'is-active' : ''} onClick={() => setRaw('pullup')}>INTERNAL PULL-UP</button><button className={raw === 'pulldown' ? 'is-active' : ''} onClick={() => setRaw('pulldown')}>EXTERNAL PULL-DOWN</button></div>
        <svg viewBox="0 0 520 230" role="img" aria-label="Interactive button circuit model">
          <VBlock x={20} y={70} w={116} h={65} title="GPIO INPUT" sub={isHigh ? 'HIGH' : 'LOW'} tone={isHigh ? 'lime' : 'coral'} />
          <path d="M136 102 H193" className="v-wire" /><path d={pressed ? 'M193 102 H243' : 'M193 102 L236 74'} className="v-switch-line" />
          <circle cx="193" cy="102" r="5" className="v-node" /><circle cx="244" cy="102" r="5" className="v-node" />
          <VBlock x={274} y={70} w={104} h={65} title="BUTTON" sub={pressed ? 'PRESSED' : 'RELEASED'} tone="blue" />
          <path d="M378 102 H453" className="v-wire" /><text x="446" y="83" className="v-label">{raw === 'pullup' ? 'GND' : 'VCC'}</text>
          <text x="31" y="179" className="v-small">{raw === 'pullup' ? 'PULL-UP BIASES HIGH; PRESSED CONNECTS TO GND.' : 'PULL-DOWN BIASES LOW; PRESSED CONNECTS TO VCC.'}</text>
        </svg>
        <button className={`large-switch ${pressed ? 'large-switch--pressed' : ''}`} onClick={() => setPressed((value) => !value)} aria-pressed={pressed}><span />{pressed ? 'RELEASE BUTTON' : 'PRESS BUTTON'}</button>
      </div>
      <TinkercadEmbed title="Button Interfacing" thingId="ereRywZmqTI" shareCode="q4XndsqV91jkzBPxvPxd6GVIGgEwnBmpIPb3BHotNF4" publicUrl="https://www.tinkercad.com/things/ereRywZmqTI-button-interfacing?sharecode=q4XndsqV91jkzBPxvPxd6GVIGgEwnBmpIPb3BHotNF4" />
    </div>
  );
}

function ExitTicket() {const questions=[{q:'Why must a bare LED use a series resistor?',answers:['It limits current through the LED','It increases the supply voltage','It changes digital input to analogue'],correct:0},{q:'With INPUT_PULLUP, a switch to GND reads what when pressed?',answers:['HIGH','LOW','Floating'],correct:1},{q:'What should parallel LED strings normally have?',answers:['One shared resistor','A resistor in each branch','No resistor if supply is 9 V'],correct:1}];const [answers,setAnswers]=useState<Record<number,number>>({});const score=questions.reduce((sum,item,index)=>sum+(answers[index]===item.correct?1:0),0);return <div className="exit-layout"><div className="exit-heading"><Heading slide={30} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Leave with<br/><span className="text-blue">a safe circuit.</span></>} subtitle="Check the key ideas, then log one uncertainty to revisit in lab." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{Object.keys(answers).length===3?`${score} / 3`:`${Object.keys(answers).length} / 3`}</b><small>{Object.keys(answers).length===3?'COMPLETE':'QUESTIONS'}</small></div></div><div className="exit-quiz">{questions.map((item,questionIndex)=><section className="exit-question" key={item.q}><div className="exit-question__prompt"><span>0{questionIndex+1}</span><b>{item.q}</b></div><div className="exit-options">{item.answers.map((answer,answerIndex)=><button key={answer} onClick={()=>setAnswers((current)=>({...current,[questionIndex]:answerIndex}))} className={answers[questionIndex]===answerIndex?(answerIndex===item.correct?'is-correct':'is-wrong'):''}>{answer}</button>)}</div></section>)}<label className="reflection-field"><span>ONE THING I WILL CHECK IN THE PHYSICAL LAB</span><textarea rows={2} placeholder="e.g. actual LED Vf, resistor tolerance, or breadboard row continuity"/></label><div className="exit-footer"><div><span className="logbook-stamp">LOGBOOK</span><p>Save today's circuit, values, evidence, and one question.</p></div><div className="exit-complete"><Check size={16}/> WEEK 2 COMPLETE</div></div></div><div className="next-week-strip"><span>NEXT</span><b>Week 03</b><i/>Analogue sensors, ADC readings, calibration, and thresholds.</div></div>;
}

function TeamChallenge() {const [selected,setSelected]=useState({supply:'9',led:'white',count:'1',target:'20',parallel:'1'});const [checked,setChecked]=useState(false);const vf=bandColorOptions.find((led)=>led.name.toLowerCase()===selected.led)?.vf??3.2;const drop=Number(selected.supply)-vf*Number(selected.count);const ideal=drop/(Number(selected.target)/1000);const safe=drop>0&&ideal>0;const actual=safe?drop/nextPreferredResistance(ideal,'E12')*1000:0;return <div className="challenge-layout"><div><Heading slide={29} eyebrow="TEAM DESIGN CHALLENGE / 18 MINUTES" title={<>Design the first<br/><span className="text-lime">safe indicator.</span></>} subtitle="In teams, propose a 9 V demonstration circuit, calculate a resistor, and state what you must verify before building."/></div><div className="challenge-board"><div className="challenge-inputs"><label>Supply<select value={selected.supply} onChange={(event)=>setSelected({...selected,supply:event.target.value})}><option value="9">9 V battery</option><option value="5">5 V supply</option><option value="12">12 V bench supply</option></select></label><label>LED colour<select value={selected.led} onChange={(event)=>setSelected({...selected,led:event.target.value.toLowerCase()})}>{bandColorOptions.map((led)=><option key={led.name} value={led.name.toLowerCase()}>{led.name}</option>)}</select></label><label>LEDs in series<select value={selected.count} onChange={(event)=>setSelected({...selected,count:event.target.value})}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><label>Target branch current<select value={selected.target} onChange={(event)=>setSelected({...selected,target:event.target.value})}><option value="5">5 mA</option><option value="10">10 mA</option><option value="20">20 mA (example)</option></select></label><label>Parallel strings<select value={selected.parallel} onChange={(event)=>setSelected({...selected,parallel:event.target.value})}><option value="1">1 branch</option><option value="2">2 branches</option><option value="3">3 branches</option></select></label><button className="primary-button primary-button--small" onClick={()=>setChecked(true)}>REVEAL CHECK <Check size={15}/></button></div><div className="challenge-output"><span>TEAM WORKSHEET</span><b>{safe?`Rideal = ${formatOhms(ideal)}`:'This series string exceeds supply'}</b><p>{safe?`Choose next E12: ${formatOhms(nextPreferredResistance(ideal,'E12'))}. Nominal branch current ≈ ${actual.toFixed(1)} mA; total across ${selected.parallel} branches ≈ ${(actual*Number(selected.parallel)).toFixed(1)} mA.`:'Reduce the number of series LEDs or choose an appropriate supply.'}</p>{checked&&<div className="challenge-checks"><span><Check size={14}/> Diagram labels supply, resistor and LED polarity</span><span><Check size={14}/> One resistor per parallel string</span><span><Check size={14}/> Current and power rechecked at chosen value</span><span><Check size={14}/> Exact component data still to verify</span></div>}</div></div><div className="challenge-footer"><b>DELIVERABLES</b><p>One annotated circuit sketch · resistor math · three acceptance checks · assigned team roles · individual logbook evidence</p></div></div>;
}

function BreakSlide({second=false}:{second?:boolean}) {const [seconds,setSeconds]=useState(600);const [running,setRunning]=useState(false);useEffect(()=>{if(!running||seconds<=0)return;const timer=window.setInterval(()=>setSeconds((value)=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[running,seconds]);useEffect(()=>{if(seconds===0)setRunning(false);},[seconds]);const minutes=Math.floor(seconds/60);const remainder=seconds%60;return <div className="break-layout"><div className="break-copy"><Eyebrow tone="blue">PAUSE / {second?'02':'01'} OF 02</Eyebrow><h1 id={`week2-title-${second?27:15}`}>{second?'Reset before the challenge.':'Step away. Let the model settle.'}</h1><p>{second?'You have explored inputs and outputs. Come back ready to design a circuit and defend the choices.':'You have worked through LED behavior, resistor sizing, colour bands, and I–V characteristics.'}</p><div className="break-cues"><span><b>01</b> Rest your eyes and step away.</span><span><b>02</b> Write one question to revisit.</span><span><b>03</b> Return ready for the next block.</span></div></div><div className="break-timer-panel"><span className="break-timer-label">OPTIONAL SILENT TIMER</span><div className="break-timer">{String(minutes).padStart(2,'0')}<i>:</i>{String(remainder).padStart(2,'0')}</div><div className="break-timer-controls"><button className="primary-button primary-button--small" onClick={()=>setRunning((value)=>!value)}>{running?<Pause size={14}/>:<Play size={14}/>} {running?'PAUSE':'START 10 MIN'}</button><button className="reset-button" onClick={()=>{setSeconds(600);setRunning(false);}} aria-label="Reset timer"><RotateCcw size={15}/></button></div><p>Lesson will not advance automatically.</p></div></div>;
}

function OvercurrentDemo() {
  const [resistance, setResistance] = useState(330);
  const led = bandColorOptions.find((item) => item.name === 'White')!;
  const limited = resistance > 0;
  const currentMa = limited ? Math.max(0, (9 - led.vf) / resistance * 1000) : 100;
  const over = !limited || currentMa > 20;
  return (
    <div className="overcurrent-layout">
      <div><Heading slide={19} eyebrow="FAILURE MODE / SAFE SIMULATION ONLY" title={<>What happens<br /><span className="text-coral">without enough R?</span></>} subtitle="Explore a software model. No real LED is being overloaded." tone="coral" /></div>
      <div className="overcurrent-panel">
        <div className="overcurrent-top"><div><span className="quiz-label">SERIES RESISTOR</span><strong>{limited ? `${resistance} Ω` : 'NONE'}</strong></div><label>Choose a case<select value={resistance} onChange={(event) => setResistance(Number(event.target.value))}><option value="0">No resistor · unsafe case</option><option value="68">68 Ω</option><option value="100">100 Ω</option><option value="220">220 Ω</option><option value="330">330 Ω</option><option value="470">470 Ω</option></select></label></div>
        <div className="current-meter"><div className="current-meter__labels"><span>ESTIMATED CURRENT</span><b>{limited ? `${currentMa.toFixed(1)} mA` : 'NOT PREDICTED'}</b></div><div className="current-meter__track"><div className={`current-meter__fill ${over ? 'is-danger' : ''}`} style={{ width: `${Math.min(100, currentMa / 60 * 100)}%` }} /></div><div className="current-meter__scale"><span>0 mA</span><span>20 mA reference*</span><span>60 mA</span></div></div>
        <div className={`thermal-state ${over ? 'thermal-state--danger' : 'thermal-state--safe'}`}><div className={`large-led ${over ? 'large-led--burn' : 'large-led--on'}`} /><div><b>{!limited ? 'CURRENT NOT LIMITED' : over ? 'MODEL OVERCURRENT WARNING' : 'CURRENT-LIMITED EXAMPLE'}</b><p>{!limited ? 'Current cannot be calculated from LED Vf alone. The real result depends on the battery, wiring, and LED; do not make this connection.' : over ? 'The simple estimate is above the illustrative reference. A real LED may heat, degrade, or fail. Recalculate and check the exact datasheet.' : 'The simple estimate is below the illustrative reference. Check component ratings and tolerances before building.'}</p></div></div>
        <div className="overcurrent-facts"><span>SUPPLY<b>9 V</b></span><span>LED MODEL<b>White · {led.vf} V (typ.)</b></span><span>MODEL<b>{limited ? 'Vf-subtracted / R' : 'No-resistor case'}</b></span></div>
        <p className="model-disclaimer">*20 mA is a comparison value, not a universal maximum. This simplified estimate is not a datasheet model and does not predict junction temperature, lifetime, or a failure point. Consult the exact LED datasheet.</p>
      </div>
    </div>
  );
}

const debugCases = [
  { title: 'The LED stays dark.', options: ['Remove the resistor', 'Check polarity, series path, pin mode, and connection', 'Connect the LED directly to 9 V'], answer: 1, explain: 'Check the full circuit and pin configuration first. Keep current limiting in place; do not bypass it.' },
  { title: 'The button reading changes by itself.', options: ['The input may be floating or missing a defined pull state', 'Use a higher LED current', 'Increase the battery voltage'], answer: 0, explain: 'A floating input has no reliable logic level. Use the specified pull-up or pull-down and verify the switch path.' },
  { title: 'The LED is too bright and becomes hot.', options: ['Lower series resistance without checking', 'Stop and recalculate current and resistor power', 'Connect two GPIO pins together'], answer: 1, explain: 'Treat unexpected heating as a stop condition. Recalculate branch current and resistor dissipation, then check component ratings.' },
];

function DebugSlide() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const current = debugCases[caseIndex];
  return (
    <div className="debug-layout">
      <div><Heading slide={28} eyebrow="DEBUG BY EVIDENCE / CASE FILES" title={<>Stop guessing.<br /><span className="text-blue">Trace the circuit.</span></>} subtitle="Choose a safe first investigation. Change one thing, then retest." tone="blue" /><div className="debug-sequence"><span>OBSERVE</span><ArrowRight size={14} /><span>HYPOTHESISE</span><ArrowRight size={14} /><span>TEST</span><ArrowRight size={14} /><span>RECORD</span></div></div>
      <div className="debug-card"><span className="quiz-label">CASE {caseIndex + 1} / {debugCases.length}</span><h2>{current.title}</h2><div className="debug-options">{current.options.map((option, optionIndex) => <button key={option} className={`quiz-choice ${answer === optionIndex ? (optionIndex === current.answer ? 'is-correct' : 'is-wrong') : ''}`} onClick={() => { if (answer !== null) return; setAnswer(optionIndex); }} disabled={answer !== null}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}{answer === optionIndex && (optionIndex === current.answer ? <Check size={17} /> : <X size={17} />)}</button>)}</div>{answer !== null && <div className="debug-feedback"><b>{answer === current.answer ? 'Good first check.' : 'Not a safe first step.'}</b><p>{current.explain}</p><button className="text-button" onClick={() => { setCaseIndex((value) => (value + 1) % debugCases.length); setAnswer(null); }}>NEXT CASE <ArrowRight size={15} /></button></div>}</div>
    </div>
  );
}

export default App;
