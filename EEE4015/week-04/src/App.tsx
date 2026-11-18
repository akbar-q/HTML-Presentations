import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Check, CircleHelp, Clock3, Cpu,
  Expand, Lightbulb, MonitorPlay, Pause, Play, RotateCcw, Sparkles,
  Volume2, X,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const slideNames = [
  'Start here', 'The session route', 'Interfaces speak to people', 'Matrix rows and columns',
  'A key becomes an event', 'Trace the keypad map', 'Keypad station', 'Buzzer: output level or sound?',
  'Duty cycle changes average drive', 'Frequency changes pitch', 'Sweep a buzzer model',
  'Break one', 'Seven segments make a character', 'Common cathode or common anode?',
  'Segment map: make A', 'Limit current in every segment', 'Display pattern trainer',
  'Test combinations and polarity', 'TinkerCAD: 4×4 keypad', 'TinkerCAD: buzzer PWM',
  'TinkerCAD: seven-segment', 'Trace the interface code', 'Debug from evidence',
  'Team interface challenge', 'Evidence logbook', 'Break two', 'Debrief and compare', 'Exit ticket',
];
const slideDurations = [2, 5, 6, 9, 9, 9, 20, 8, 10, 8, 20, 10, 10, 10, 12, 12, 20, 12, 25, 25, 25, 18, 22, 40, 18, 10, 20, 10];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'KEYPAD', index: 3 }, { name: 'BUZZER + PWM', index: 7 },
  { name: 'SEVEN SEGMENT', index: 12 }, { name: 'SIMULATIONS', index: 18 }, { name: 'APPLY + EVIDENCE', index: 23 },
];
const keypadRows = [4, 5, 6, 7];
const keypadColumns = [8, 9, 10, 11];
const keyMap = [['D', 'C', 'B', 'A'], ['#', '9', '6', '3'], ['0', '8', '5', '2'], ['*', '7', '4', '1']];
const segmentNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as const;
type SegmentName = typeof segmentNames[number];
const characterPatterns: Record<string, SegmentName[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'], '1': ['b', 'c'], '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'], '4': ['b', 'c', 'f', 'g'], '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'], '7': ['a', 'b', 'c'], '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'], A: ['a', 'b', 'c', 'e', 'f', 'g'], b: ['c', 'd', 'e', 'f', 'g'],
  C: ['a', 'd', 'e', 'f'], E: ['a', 'd', 'e', 'f', 'g'], F: ['a', 'e', 'f', 'g'], '-': ['g'],
};
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }

function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week4-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

function App() {
  const [slide, setSlide] = useState(0);
  const [points, setPoints] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const reducedMotion = useReducedMotion();
  const animated = motionEnabled && !reducedMotion;
  const stageRef = useRef<HTMLElement>(null);
  const elapsed = elapsedAt(slide);
  const activeChapter = chapterAt(slide);
  const goTo = (index: number) => setSlide(clamp(index, 0, slideNames.length - 1));
  const addPoints = (amount: number) => setPoints((value) => value + amount);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); setSlide((value) => Math.min(slideNames.length - 1, value + 1)); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); setSlide((value) => Math.max(0, value - 1)); }
      if (event.key === 'Home') setSlide(0);
      if (event.key === 'End') setSlide(slideNames.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { document.title = `EEE4015 / Week 04 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 04</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsed)}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsed)} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week4-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(2)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <ConceptSlide slide={2} eyebrow="USER INTERFACE / INPUT → EVENT → FEEDBACK" title="A controller can listen and respond." subtitle="Keypads, sound, and displays turn GPIO into a user-facing interface." tone="lime" visual="interface" points={[["Input: key matrix", "Rows and columns let the controller scan many switches with fewer pins.", "A 4×4 keypad uses eight matrix lines for sixteen key positions."], ["Feedback: sound", "A buzzer can provide an audible status, but active and passive devices behave differently.", "Separate control pattern from the buzzer's current requirement."], ["Feedback: segments", "A display character is a set of independently controlled LED segments.", "Map a–g and decimal point before writing a pattern."]]} takeaway="An interface is a contract between a physical input/output and the user."/>;
    case 3: return <ConceptSlide slide={3} eyebrow="KEYPAD / ROW-COLUMN SCANNING" title="Sixteen keys, eight matrix connections." subtitle="Each key joins one row to one column; the library handles the scan and reports a character." tone="blue" visual="matrix" points={[["Rows and columns", "The key switch lies at the intersection of one row conductor and one column conductor.", "Four row pins + four column pins = eight I/O connections."], ["Scan and detect", "The library drives/scans the matrix and identifies a newly pressed key.", "getKey() returns NO_KEY when there is no new event."], ["Pin order matters", "The keypad's physical lead order must match the row/column arrays.", "The 4x4 component lead order is not guaranteed by the key labels."]]} takeaway="Confirm matrix lead order and pin arrays before interpreting a key event."/>;
    case 4: return <ConceptSlide slide={4} eyebrow="SOFTWARE / EVENT VALUES" title="A press becomes a character event." subtitle="The library abstracts electrical scanning; your code decides what the returned key means." tone="blue" visual="event" points={[["No new press", "getKey() reports NO_KEY until a new key press is detected.", "Avoid repeatedly treating a held key as many unrelated events."], ["Key mapping", "A two-dimensional character map assigns each row/column position a symbol.", "The supplied map uses D, C, B, A across the first row."], ["Application behavior", "Filter allowed keys, build a value, clear it, or report a status.", "The starter's empty numeric-key conditional had no behavior."]]} takeaway="Separate the library's key event from the application rule that consumes it."/>;
    case 5: return <KeypadMap/>;
    case 6: return <KeypadLab/>;
    case 7: return <ConceptSlide slide={7} eyebrow="BUZZER / TWO DIFFERENT QUESTIONS" title="How loud? How high-pitched?" subtitle="PWM duty cycle and signal frequency are separate controls; the buzzer type determines what you hear." tone="coral" visual="buzzer" points={[["Duty cycle", "Duty cycle is the proportion of each period for which the pin is high.", "analogWrite() on the Uno uses a 0–255 duty command."], ["Frequency", "Frequency is how many periods occur each second; a passive piezo's pitch follows it.", "tone(pin, frequencyHz) is a separate tone-generation concept."], ["Active or passive", "An active buzzer has an oscillator; a passive piezo needs an audio-frequency drive.", "Check the component and its rated voltage/current."]]} takeaway="Do not claim analogWrite changes pitch: it changes duty; frequency controls pitch for a passive buzzer."/>;
    case 8: return <ConceptSlide slide={8} eyebrow="PWM / AVERAGE DRIVE" title="Duty cycle changes the high-time fraction." subtitle="The output still switches between digital LOW and HIGH; PWM is not a true analogue voltage." tone="lime" visual="duty" points={[["0 / 255", "The output is low for nearly all of each period.", "A connected load receives little average drive."], ["128 / 255", "The output is high for roughly half of each period.", "A suitable LED may appear dimmer; sound response depends on the buzzer."], ["255 / 255", "The output is high for nearly all of each period.", "Check GPIO and component ratings; a load may need a driver."]]} takeaway="Duty is a ratio; frequency is a rate. Keep those variables distinct in explanations and tests."/>;
    case 9: return <ConceptSlide slide={9} eyebrow="SOUND / FREQUENCY" title="Pitch changes when frequency changes." subtitle="A passive piezo needs an audio-frequency waveform; an active buzzer generates its own tone." tone="blue" visual="frequency" points={[["Low frequency", "Fewer cycles per second generally produce a lower pitch for a passive piezo.", "Frequency is measured in hertz."], ["High frequency", "More cycles per second generally produce a higher pitch.", "The PWM duty can be held fixed while frequency changes."], ["Device response", "An active buzzer may not follow an external pitch command like a passive piezo.", "Use the part specification and listen/observe in the simulator."]]} takeaway="Change one dimension at a time: duty for high-time fraction, frequency for cycles per second."/>;
    case 10: return <BuzzerLab/>;
    case 11: return <BreakSlide second={false}/>;
    case 12: return <ConceptSlide slide={12} eyebrow="DISPLAY / SEGMENT ANATOMY" title="Seven segments combine into a character." subtitle="Every segment is an LED with an individual pin and a current path." tone="lime" visual="segments" points={[["Name the segments", "The display labels its bars a through g and usually includes a decimal point.", "Letter A lights a, b, c, e, f, and g."], ["Map pin to label", "Trace each display lead to its GPIO before creating a lookup pattern.", "The supplied teaching map assigns a to D4, b to D5, and so on."], ["Check the display type", "Common-cathode is active-HIGH in this example; common-anode uses inverted logic.", "Identify the exact part before wiring or driving it."]]} takeaway="A character pattern is a pin map plus a polarity convention."/>;
    case 13: return <ConceptSlide slide={13} eyebrow="POLARITY / COMMON CONNECTION" title="Common cathode and common anode invert the logic." subtitle="The same desired lit segments require opposite output levels on the two display types." tone="coral" visual="polarity" points={[["Common cathode", "The shared cathode connects toward ground; a segment lights when its GPIO is HIGH.", "This is the assumption in the supplied sketch."], ["Common anode", "The shared anode connects toward its specified supply; a segment lights when its GPIO is LOW.", "Invert the pattern logic for a common-anode part."], ["Verify, do not guess", "The package outline and pin count are not enough to determine segment pinout.", "Check the manufacturer or component documentation."]]} takeaway="Polarity is part of the interface contract; invert ON/OFF levels when the display type changes."/>;
    case 14: return <ConceptSlide slide={14} eyebrow="PIN MAP / CHARACTER A" title="Make A: six segments on, two off." subtitle="For the supplied common-cathode example, ON is HIGH and OFF is LOW." tone="blue" visual="letterA" points={[["ON: a, b, c", "These are the top, upper-right, and lower-right segments.", "GPIO HIGH in the common-cathode teaching circuit."], ["ON: e, f, g", "Bottom-left, upper-left, and middle complete the letter.", "GPIO HIGH in the common-cathode teaching circuit."], ["OFF: d, dp", "Leave the lower bar and decimal point unlit.", "GPIO LOW for this common-cathode example."]]} takeaway="Write and test the segment truth table before transferring it into a code lookup."/>;
    case 15: return <ConceptSlide slide={15} eyebrow="CURRENT LIMIT / EVERY SEGMENT" title="One resistor per bare LED segment." subtitle="Several segments may be on simultaneously. A single shared resistor makes current depend on how many are lit." tone="coral" visual="resistors" points={[["Each segment is a diode", "Every active segment needs current limiting in its own branch.", "Use the actual LED forward voltage and target current."], ["Avoid one shared resistor", "The display's common pin is not a substitute for individual segment current limits.", "Brightness and current can vary with the pattern."], ["Check the whole port", "GPIO current limits apply per pin and across groups/ports.", "A driver may be required for a larger display or load."]]} takeaway="The teaching model shows a resistor on each active segment; verify ratings before any physical build."/>;
    case 16: return <SegmentTrainer/>;
    case 17: return <SegmentTruthTable/>;
    case 18: return <SimulationSlide slide={18} title="Keypad: scan, press, record." note="The supplied matrix map uses rows D4–D7 and columns D8–D11. Compare a physical key with the reported character." thingId="88epWAg2CJn" shareCode="VD_UD4eTBkRxoJB0yTuWrd9MkfY7-tP8dbMt13p7leI" publicUrl="https://www.tinkercad.com/things/88epWAg2CJn-4x4-keypad-interfacing?sharecode=VD_UD4eTBkRxoJB0yTuWrd9MkfY7-tP8dbMt13p7leI"/>
    case 19: return <SimulationSlide slide={19} title="Buzzer PWM: listen, measure, explain." note="The supplied ramp changes duty from 0 to 255. It does not change PWM frequency; compare with tone() on a passive piezo." thingId="fcNlCTTIRhf" shareCode="nZh9f4peSA7BCmLvmXxTewymqCG1EwDfGoCq6hK3riE" publicUrl="https://www.tinkercad.com/things/fcNlCTTIRhf-buzzer-interfacing-pwm?sharecode=nZh9f4peSA7BCmLvmXxTewymqCG1EwDfGoCq6hK3riE"/>
    case 20: return <SimulationSlide slide={20} title="Seven-segment: map and verify." note="The starter pattern assumes common cathode. Add one suitable series resistor per bare segment before a physical build." thingId="8VipHyKr9po" shareCode="-V-sPeApqYiHrkFJZMW_f-Qn3iHLoNIKTQrbgxOr20g" publicUrl="https://www.tinkercad.com/things/8VipHyKr9po-7-segment-display-interfacing?sharecode=-V-sPeApqYiHrkFJZMW_f-Qn3iHLoNIKTQrbgxOr20g"/>
    case 21: return <CodeTrace/>;
    case 22: return <KeypadDebug/>;
    case 23: return <TeamChallenge/>;
    case 24: return <EvidenceLog/>;
    case 25: return <BreakSlide second/>;
    case 26: return <Debrief addPoints={addPoints}/>;
    case 27: return <ExitTicket/>;
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w4-welcome"><div className="w4-welcome__copy"><Eyebrow>FIELD NOTES / 04</Eyebrow><h1 id="week4-title-0">Listen.<br/><span>Show the state.</span></h1><p>Connect key events, sound, and segmented displays to the systems you are building.</p><div className="w4-meta"><span><b>28</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>03</b> SIMULATIONS</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w4-hero"><div className="w4-hero__key">A</div><div className="w4-hero__wave"><i/><i/><i/><i/><i/><i/><i/></div><SegmentGlyph active={characterPatterns.A}/><div className="w4-hero__label">PRESS → EVENT → FEEDBACK</div><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 READY POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Trace row/column scanning</div><div><Check size={16}/> Separate duty from frequency</div><div><Check size={16}/> Map a display character</div></div></div>;
}

function Agenda() {
  const sessions = [
    ['00:00–00:42', 'Matrix keypad', 'Rows/columns, library events, pin map'],
    ['00:42–01:52', 'Keypad simulation', 'Press numeric/special keys; capture Serial events'],
    ['01:52–02:02', 'BREAK', 'Short reset and station change'],
    ['02:02–03:32', 'Buzzer + PWM', 'Duty cycle, frequency, passive/active buzzer'],
    ['03:32–04:32', 'Seven-segment display', 'Segment map, common pin polarity, resistor paths'],
    ['04:32–04:42', 'BREAK', 'Prepare for display and evidence stations'],
    ['04:42–05:52', 'Simulation stations', 'Complete buzzer and seven-segment Tinkercad tasks'],
    ['05:52–06:45', 'Challenge + evidence', 'Character truth table, test record, team debrief'],
  ];
  return <div className="w4-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Three interfaces. One test habit." subtitle="Pair each interface concept with a circuit station, prediction, run, and explanation."/><div className="w4-agenda-list">{sessions.map(([time, title, detail], index) => <div className={`w4-agenda-row ${title === 'BREAK' ? 'is-break' : ''}`} key={title}><span>{String(index + 1).padStart(2, '0')}</span><b>{time}</b><strong>{title}</strong><small>{detail}</small></div>)}</div><p className="w3-callout"><Clock3 size={16}/> Simulator outputs are labelled SIMULATION; they are not physical lab evidence.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function ConceptSlide({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w3-concept"><div className="w3-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span className="w3-timing">{slideDurations[slide]} MIN</span></div><div className="w3-concept__body"><div className="w3-points">{points.map(([heading, body, example], index) => <article className="w3-point" key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><ConceptVisual kind={visual}/></div><div className="w3-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function SegmentGlyph({ active }: { active: SegmentName[] }) {
  const on = (segment: SegmentName) => active.includes(segment);
  const line = (segment: SegmentName, x1: number, y1: number, x2: number, y2: number) => <g key={segment}><line x1={x1} y1={y1} x2={x2} y2={y2} className={`segment-line ${on(segment) ? 'is-on' : ''}`}/><circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="3" className="segment-resistor-dot"/></g>;
  return <svg className="segment-glyph" viewBox="0 0 120 190" role="img" aria-label={`Seven-segment display with segments ${active.join(', ') || 'none'} illuminated`}>
    {line('a',35,20,85,20)}{line('b',91,28,91,78)}{line('c',91,103,91,153)}{line('d',35,161,85,161)}{line('e',29,103,29,153)}{line('f',29,28,29,78)}{line('g',35,90,85,90)}<circle cx="105" cy="158" r="5" className={`segment-dot ${on('dp') ? 'is-on' : ''}`}/><text x="9" y="181" className="segment-pin-label">R EACH SEGMENT</text>
  </svg>;
}

function ConceptVisual({ kind }: { kind: string }) {
  if (kind === 'interface') return <figure className="w3-visual"><div className="w3-visual__heading">USER INTERFACE PATH <i>W04</i></div><div className="chain-diagram">{[['KEYPAD','event'],['CODE','interpret'],['BUZZER','sound'],['DISPLAY','visual']].map(([label, sub], index) => <div key={label} className={`chain-node chain-node--${index}`}><b>{label}</b><small>{sub}</small></div>)}</div><figcaption>Inputs become events; outputs communicate a state.</figcaption></figure>;
  if (kind === 'matrix') return <figure className="w3-visual"><div className="w3-visual__heading">4 × 4 MATRIX <i>W04</i></div><div className="matrix-mini"><span>R1</span><span>R2</span><span>R3</span><span>R4</span>{keyMap.map((row, rowIndex) => row.map((key, colIndex) => <b key={`${rowIndex}-${colIndex}`}>{key}</b>))}<small>C1 · C2 · C3 · C4</small></div><figcaption>Each switch is one row/column intersection.</figcaption></figure>;
  if (kind === 'event') return <figure className="w3-visual"><div className="w3-visual__heading">SCAN → EVENT <i>W04</i></div><div className="key-event-flow"><span>ROW + COLUMN</span><ArrowRight size={18}/><strong>KEY '7'</strong><ArrowRight size={18}/><span>APPLICATION RULE</span></div><figcaption>NO_KEY means there is no new key press to process.</figcaption></figure>;
  if (kind === 'buzzer') return <figure className="w3-visual"><div className="w3-visual__heading">DUTY ≠ FREQUENCY <i>W04</i></div><svg viewBox="0 0 360 142" role="img" aria-label="Two pulse trains with equal frequency but different duty cycles"><path d="M22 35 H90 V62 H158 V35 H226 V62 H338" className="pwm-wave pwm-wave--lime"/><text x="24" y="24" className="w3-svg-label">LOW DUTY</text><path d="M22 88 H126 V115 H158 V88 H262 V115 H338" className="pwm-wave pwm-wave--blue"/><text x="24" y="78" className="w3-svg-label">HIGH DUTY</text><text x="240" y="133" className="w3-svg-label">same period / frequency</text></svg><figcaption>Duty changes the high-time fraction; frequency is cycles per second.</figcaption></figure>;
  if (kind === 'duty') return <figure className="w3-visual"><div className="w3-visual__heading">PWM DUTY VALUES <i>W04</i></div><div className="duty-ladder">{[0,64,128,192,255].map((value) => <div key={value}><span>{value}</span><i><b style={{width:`${value/255*100}%`}}/></i></div>)}</div><figcaption>Uno example command: 0–255. The output remains a digital pulse train.</figcaption></figure>;
  if (kind === 'frequency') return <figure className="w3-visual"><div className="w3-visual__heading">PITCH / FREQUENCY <i>W04</i></div><svg viewBox="0 0 360 142" role="img" aria-label="Low and high frequency pulse trains"><path d="M20 42 H92 V68 H164 V42 H236 V68 H338" className="pwm-wave pwm-wave--blue"/><text x="21" y="31" className="w3-svg-label">LOWER FREQUENCY</text><path d="M20 100 H48 V124 H76 V100 H104 V124 H132 V100 H160 V124 H188 V100 H216 V124 H244 V100 H272 V124 H300 V100 H338" className="pwm-wave pwm-wave--coral"/><text x="21" y="91" className="w3-svg-label">HIGHER FREQUENCY</text></svg><figcaption>Changing period changes pitch for a passive piezo; device response varies.</figcaption></figure>;
  if (kind === 'segments' || kind === 'letterA') return <figure className="w3-visual"><div className="w3-visual__heading">SEGMENT MAP / A <i>W04</i></div><div className="segment-visual-wrap"><SegmentGlyph active={kind === 'letterA' ? characterPatterns.A : ['a','b','c','e','f','g']}/><div className="segment-legend"><span>ON <b>a b c e f g</b></span><span>OFF <b>d dp</b></span><small>Assume common cathode</small></div></div><figcaption>Pin map and polarity convention define the output pattern.</figcaption></figure>;
  if (kind === 'polarity') return <figure className="w3-visual"><div className="w3-visual__heading">LOGIC POLARITY <i>W04</i></div><div className="polarity-compare"><div><b>COMMON CATHODE</b><span>HIGH → segment ON</span><i className="polarity-led is-on"/></div><div><b>COMMON ANODE</b><span>LOW → segment ON</span><i className="polarity-led is-on is-inverted"/></div></div><figcaption>Same visual result; opposite electrical logic level.</figcaption></figure>;
  if (kind === 'resistors') return <figure className="w3-visual"><div className="w3-visual__heading">ONE R PER SEGMENT <i>W04</i></div><div className="resistor-row">{['a','b','c','d','e','f','g'].map((segment) => <div key={segment}><span>{segment}</span><i/><b>R</b><i/><em>LED</em></div>)}</div><figcaption>Each bare segment branch gets its own current-limiting resistor.</figcaption></figure>;
  return <figure className="w3-visual"><div className="w3-visual__heading">SEGMENT OUTPUTS <i>W04</i></div><SegmentGlyph active={characterPatterns['8']}/><figcaption>Eight lights the seven bars; decimal point is controlled separately.</figcaption></figure>;
}

function KeypadMap() {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  return <div className="w4-keypad-map"><Heading slide={5} eyebrow="INTERACTIVE MAP / ROW × COLUMN" title="Press a virtual key. Trace its wiring." subtitle="The local model connects the key position to its matrix row, column pin, and character map." tone="blue"/><div className="keypad-map-layout"><div className="keypad-board"><div className="keypad-pin-row">{keypadRows.map((pin,index)=><span key={pin}>R{index+1} / D{pin}</span>)}</div><div className="keypad-grid">{keyMap.flatMap((row,rowIndex)=>row.map((key,colIndex)=><button key={`${rowIndex}-${colIndex}`} className={selected?.row===rowIndex&&selected.col===colIndex?'is-selected':''} onClick={()=>setSelected({row:rowIndex,col:colIndex})} aria-label={`Key ${key}, row ${rowIndex+1}, column ${colIndex+1}`}>{key}</button>))}</div><div className="keypad-pin-row keypad-pin-row--columns">{keypadColumns.map((pin,index)=><span key={pin}>C{index+1} / D{pin}</span>)}</div></div><div className="keypad-inspector"><span>SELECTED POSITION</span>{selected?<><strong>KEY “{keyMap[selected.row][selected.col]}”</strong><p>Row {selected.row+1} / D{keypadRows[selected.row]}</p><p>Column {selected.col+1} / D{keypadColumns[selected.col]}</p><small>KEY_MAP[{selected.row}][{selected.col}] → '{keyMap[selected.row][selected.col]}'</small></>:<p>Select a key to inspect its row and column.</p>}</div></div></div>;
}

function KeypadLab() {
  const [events,setEvents] = useState<string[]>([]);
  const [numericOnly,setNumericOnly] = useState(false);
  const pressKey=(key:string)=>{if(numericOnly&&!/^\d$/.test(key)){setEvents((current)=>[`IGNORED ${key}`, ...current].slice(0,6));return;}setEvents((current)=>[`KEY '${key}'`, ...current].slice(0,6));};
  return <div className="w4-tool"><Heading slide={6} eyebrow="INTERACTIVE STATION / KEYPAD EVENTS" title="Test the key map and event filter." subtitle="Tap a key. The log shows a newly detected event; optional numeric filtering rejects symbols." tone="blue"/><div className="w4-keypad-lab"><div className="keypad-grid keypad-grid--lab">{keyMap.flatMap((row,rowIndex)=>row.map((key,colIndex)=><button key={`${rowIndex}-${colIndex}`} onClick={()=>pressKey(key)} aria-label={`Press key ${key}, row ${rowIndex+1}, column ${colIndex+1}`}>{key}</button>))}</div><div className="key-log"><div className="key-log__header"><span>EVENT LOG / SERIAL 9600</span><button className="text-button" onClick={()=>setEvents([])}><RotateCcw size={14}/> CLEAR</button></div><label className="w4-toggle"><input type="checkbox" checked={numericOnly} onChange={(event)=>setNumericOnly(event.target.checked)}/> Accept digits only</label><div className="key-log__entries" aria-live="polite">{events.length?events.map((event,index)=><code key={`${event}-${index}`}>{event}</code>):<span>NO_KEY / waiting for press</span>}</div><p className="w3-model-warning">The actual keypad library scans the matrix and returns one key event. This local click model illustrates mapping/filter behavior, not contact bounce or wiring.</p></div></div></div>;
}

function BuzzerLab() {
  const [duty,setDuty]=useState(128);
  const [frequency,setFrequency]=useState(440);
  const percent=duty/255*100;
  return <div className="w4-tool"><Heading slide={10} eyebrow="INTERACTIVE MODEL / DUTY VS FREQUENCY" title="Change duty and pitch separately." subtitle="Move one control at a time. Duty is the high-time fraction; frequency is cycles per second." tone="coral"/><div className="buzzer-lab"><div className="w4-tool-controls"><label className="w3-range"><span>PWM duty <b>{duty} / 255 · {percent.toFixed(0)}%</b></span><input type="range" min="0" max="255" value={duty} onChange={(event)=>setDuty(Number(event.target.value))}/></label><label className="w3-range"><span>Tone frequency <b>{frequency} Hz</b></span><input type="range" min="120" max="1500" step="10" value={frequency} onChange={(event)=>setFrequency(Number(event.target.value))}/></label><div className="buzzer-readouts"><div><span>AVERAGE DRIVE MODEL</span><b>{percent.toFixed(0)}%</b></div><div><span>PASSIVE PIEZO PITCH</span><b>{frequency} Hz</b></div></div><p className="w3-model-warning">Illustrative controls only. An active buzzer may not follow frequency; check its type and current rating. A higher-current load needs a driver.</p></div><div className="buzzer-display"><div className="buzzer-icon" style={{'--buzzer-glow':`${Math.max(0,percent/100)*26}px`} as CSSProperties}><Volume2 size={54}/></div><div className="buzzer-wave"><span className="buzzer-wave__label">DUTY / HIGH-TIME</span><div className="buzzer-wave__track"><i style={{width:`${percent}%`}}/></div><span className="buzzer-wave__label">{percent.toFixed(0)}%</span></div><div className="frequency-ruler"><span>LOWER</span><div><i style={{left:`${(frequency-120)/(1500-120)*100}%`}}/></div><span>{frequency} Hz</span></div><p>Changing duty while holding frequency leaves pitch unchanged in the passive piezo model.</p></div></div></div>;
}

function SegmentTrainer() {
  const [character,setCharacter]=useState('A');
  const [type,setType]=useState<'cathode'|'anode'>('cathode');
  const [manual,setManual]=useState(false);
  const [active,setActive]=useState<SegmentName[]>(characterPatterns.A);
  const requested=characterPatterns[character]??[];
  const shown=manual?active:requested;
  const setCharacterPattern=(next:string)=>{setCharacter(next);setManual(false);setActive(characterPatterns[next]??[]);};
  const toggleSegment=(segment:SegmentName)=>{setManual(true);setActive((current)=>current.includes(segment)?current.filter((item)=>item!==segment):[...current,segment]);};
  const pins:Record<SegmentName,number>={a:4,b:5,c:8,d:7,e:6,f:3,g:2,dp:9};
  return <div className="w4-tool"><Heading slide={16} eyebrow="INTERACTIVE TRAINER / SEGMENT MAP" title="Choose a character, then toggle its segments." subtitle="The supplied map assumes common cathode. Switch to common anode and notice the required output-level inversion."/><div className="segment-trainer"><div className="w4-tool-controls"><label>Character<select value={character} onChange={(event)=>setCharacterPattern(event.target.value)}>{Object.keys(characterPatterns).map((value)=><option key={value}>{value}</option>)}</select></label><div className="segmented-control"><button className={type==='cathode'?'is-active':''} onClick={()=>setType('cathode')}>COMMON CATHODE</button><button className={type==='anode'?'is-active':''} onClick={()=>setType('anode')}>COMMON ANODE</button></div><button className="text-button" onClick={()=>{setManual(false);setActive(characterPatterns[character]??[]);}}><RotateCcw size={14}/> RESET CHARACTER PATTERN</button><p className="w3-model-warning">Pin map: a D4, b D5, c D8, d D7, e D6, f D3, g D2, dp D9. Verify the exact component before wiring.</p></div><div className="segment-stage"><SegmentGlyph active={shown}/><div className="segment-controls">{segmentNames.map((segment)=><button key={segment} className={shown.includes(segment)?'is-active':''} onClick={()=>toggleSegment(segment)}>{segment.toUpperCase()}<small>D{pins[segment]}</small></button>)}</div><div className="segment-output"><span>COMMON {type==='cathode'?'CATHODE':'ANODE'}</span><b>{shown.length?shown.join(' ').toUpperCase():'ALL OFF'}</b><small>ON level: {type==='cathode'?'HIGH':'LOW'} · OFF level: {type==='cathode'?'LOW':'HIGH'}</small><div className="resistor-status">{shown.length} active branch{shown.length===1?'':'es'} / {shown.length} individual resistor{shown.length===1?'':'s'} required</div></div></div></div></div>;
}

function SegmentTruthTable() {
  const [answer,setAnswer]=useState<number|null>(null);
  const options=['a, b, c, e, f, g ON; d and dp OFF','a, b, c, d, e, f, g ON; dp OFF','Only a, b, c ON'];
  return <div className="w4-quiz"><Heading slide={17} eyebrow="FORMATIVE CHECK / COMMON CATHODE" title="Which pattern displays A?" subtitle="Use the supplied convention: HIGH lights a segment, LOW leaves it dark." tone="blue"/><div className="w4-quiz-card"><SegmentGlyph active={characterPatterns.A}/><div className="w4-choice-list">{options.map((option,index)=><button key={option} className={`w3-choice ${answer===index?(index===0?'is-right':'is-wrong'):''}`} onClick={()=>setAnswer(index)}><span>{String.fromCharCode(65+index)}</span>{option}</button>)}</div>{answer!==null&&<p className="w3-feedback">{answer===0?'Correct. Segment d and the decimal point remain LOW in the supplied common-cathode example.':'Check the standard letter A shape and the common-cathode ON level.'}</p>}</div></div>;
}

function SimulationSlide({slide,title,note,thingId,shareCode,publicUrl}:{slide:number;title:string;note:string;thingId:string;shareCode:string;publicUrl:string}) {
  const [open,setOpen]=useState(false);
  const embedUrl=`https://www.tinkercad.com/embed/${thingId}?sharecode=${encodeURIComponent(shareCode)}&editbtn=1`;
  const station=slide===18?'KEYPAD':slide===19?'BUZZER PWM':'SEVEN-SEGMENT';
  return <div className="w4-simulation"><Heading slide={slide} eyebrow={`GUIDED SIMULATION / ${station}`} title={title} subtitle={note} tone="blue"/><div className="w4-sim-task"><div><span>BEFORE RUN</span><b>Trace the pin map and predict the result.</b></div><div><span>DURING RUN</span><b>Change one input; record Serial/output behavior.</b></div><div><span>AFTER RUN</span><b>Explain the mapping, polarity, and limitation.</b></div></div><section className="tinkercad-embed" aria-label={`${station} Tinkercad embed`}><div className="tinkercad-embed__bar"><button className="tinkercad-embed__toggle" type="button" aria-expanded={open} onClick={()=>setOpen((value)=>!value)}>{open?<X size={15}/>:<MonitorPlay size={15}/>} {open?'HIDE EMBED':'OPEN TINKERCAD HERE'}</button><a className="tinkercad-embed__external" href={publicUrl} target="_blank" rel="noreferrer">OPEN IN NEW TAB <ArrowRight size={14}/></a></div>{open&&<iframe className="tinkercad-embed__frame" src={embedUrl} title={`${station} interactive circuit`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="clipboard-read; clipboard-write" allowFullScreen/>}<p className="tinkercad-embed__note">If the embed requests sign-in or does not load, open the public Tinkercad design in a new tab.</p></section><p className="w3-model-warning">SIMULATION EVIDENCE: save circuit/pin map, sketch version, changed input, observed output, and explanation. This is not physical hardware evidence.</p></div>;
}

function KeypadDebug() {
  const [caseIndex,setCaseIndex]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const cases=[['The wrong character appears.','Verify the physical lead order against ROW_PINS, COLUMN_PINS, and KEY_MAP.'],['A held key prints repeatedly.','Check whether the library reports a new key event or the code polls/prints continuously.'],['Special keys should be ignored.','Add an explicit filter and preserve a separate event for rejected symbols.']];
  return <div className="w4-tool"><Heading slide={22} eyebrow="DEBUG FROM EVIDENCE / KEYPAD CASES" title="Trace the coordinate before editing code." subtitle="Check one row, one column, and the character mapping. Avoid changing three arrays at once." tone="blue"/><div className="debug-card"><span className="quiz-label">CASE {caseIndex+1} / {cases.length}</span><h2>{cases[caseIndex][0]}</h2>{revealed?<div className="debug-feedback"><b>First checks</b><p>{cases[caseIndex][1]}</p></div>:<button className="primary-button primary-button--small" onClick={()=>setRevealed(true)}>REVEAL CHECKS <CircleHelp size={15}/></button>}<div className="debug-controls"><button onClick={()=>{setCaseIndex((value)=>(value+1)%cases.length);setRevealed(false);}}><ArrowRight size={15}/> NEXT CASE</button><span>Record expected → observed → explanation.</span></div></div></div>;
}

function CodeTrace() {
  const [line, setLine] = useState(0);
  const code = [
    '#include <Keypad.h>',
    'const byte ROWS = 4, COLS = 4;',
    'char keys[ROWS][COLS] = { ... };',
    'byte rowPins[ROWS] = {4, 5, 6, 7};',
    'byte colPins[COLS] = {8, 9, 10, 11};',
    'Keypad keypad = Keypad(makeKeymap(keys), ...);',
    'void setup() { Serial.begin(9600); }',
    'void loop() {',
    '  char key = keypad.getKey();',
    '  if (key != NO_KEY) Serial.println(key);',
    '}',
  ];
  const explanation = line === 0 ? 'The Keypad library handles row/column scanning.' : line === 2 ? 'The 2D map assigns a character to each matrix intersection.' : line === 3 || line === 4 ? 'Pin arrays must match the actual keypad lead order.' : line === 8 ? 'getKey() reports a new key event or NO_KEY.' : line === 9 ? 'The application reports the event; filtering can be added here.' : 'Separate constants, pin map, setup, scan, and event handling.';
  return <div className="w4-code-layout"><div><Heading slide={21} eyebrow="CODE TRACE / KEYPAD EVENT" title="Follow the scan to the Serial output." subtitle="Step through a simplified sketch and identify where mapping, pin allocation, and event handling happen." tone="blue"/><div className="w4-code-buttons"><button onClick={()=>setLine((value)=>(value+1)%code.length)}><ArrowRight size={15}/> STEP LINE</button><button onClick={()=>setLine(0)}><RotateCcw size={14}/> RESET</button></div></div><div className="code-trace-panel"><div className="code-window-head"><span><i/>keypad.ino</span><b>LINE {line+1} / {code.length}</b></div><pre>{code.map((text,index)=><div className={`code-line ${index===line?'code-line--active':''}`} key={index}><span>{String(index+1).padStart(2,'0')}</span><code>{text}</code></div>)}</pre><p className="trace-caption" aria-live="polite">{explanation}</p></div></div>;
}

function TeamChallenge() {
  const [character,setCharacter]=useState('A');
  const [type,setType]=useState<'cathode'|'anode'>('cathode');
  const [status,setStatus]=useState('Draft a display and input test plan.');
  const active=characterPatterns[character]??[];
  return <div className="w4-tool"><Heading slide={23} eyebrow="TEAM DESIGN CHALLENGE / 40 MINUTES" title="Design a clear, testable interface." subtitle="Combine one keypad command with an audible or visual status. Document the event and the display polarity."/><div className="team-design"><div className="w4-tool-controls"><label>Displayed character<select value={character} onChange={(event)=>setCharacter(event.target.value)}>{Object.keys(characterPatterns).map((value)=><option key={value}>{value}</option>)}</select></label><div className="segmented-control"><button className={type==='cathode'?'is-active':''} onClick={()=>setType('cathode')}>COMMON CATHODE</button><button className={type==='anode'?'is-active':''} onClick={()=>setType('anode')}>COMMON ANODE</button></div><button className="primary-button primary-button--small" onClick={()=>setStatus('Test one digit, one special key, all required segments, and one invalid event.')}>CHECK DESIGN <Check size={15}/></button></div><div className="team-board"><div><span>KEY INPUT</span><b>KEY_MAP event</b></div><div><span>CHARACTER</span><b>{character}</b></div><div><span>LOGIC</span><b>{type==='cathode'?'HIGH = ON':'LOW = ON'}</b></div><p>{status}</p><ul><li>What should happen for a valid key?</li><li>How will special/invalid keys be handled?</li><li>How will the audible/display state be tested?</li></ul><SegmentGlyph active={active}/></div></div></div>;
}

function EvidenceLog() {
  const [checks,setChecks]=useState<Record<string,boolean>>({});
  const items=['Keypad row/column pin map captured','Key event and Serial output recorded','Duty and frequency observations separated','Segment-to-pin truth table recorded','Display polarity stated','One resistor per segment noted','Screenshot labelled SIMULATION'];
  const completed=Object.values(checks).filter(Boolean).length;
  return <div className="w4-tool"><Heading slide={24} eyebrow="INDIVIDUAL EVIDENCE / LOGBOOK" title="Make the interface test reproducible." subtitle="Record the pin map, component type, code version, input event, observed response, and explanation." tone="blue"/><div className="evidence-layout"><div className="evidence-checklist">{items.map((item)=><label key={item}><input type="checkbox" checked={checks[item]??false} onChange={(event)=>setChecks((current)=>({...current,[item]:event.target.checked}))}/><span>{item}</span></label>)}</div><div className="evidence-score"><span>CHECKLIST</span><strong>{completed} / {items.length}</strong><p>Keep simulator output separate from any later physical measurement evidence.</p></div></div></div>;
}

function Debrief({addPoints}:{addPoints:(amount:number)=>void}) {
  const [choice,setChoice]=useState<string|null>(null);
  return <div className="w4-tool"><Heading slide={26} eyebrow="STATION DEBRIEF / COMPARE" title="The same code can behave differently on another module." subtitle="Compare component type, pin map, polarity, library behavior, and measured output before blaming the loop."/><div className="debrief-card"><span className="quiz-label">DISCUSSION PROMPT</span><h2>Which detail must be verified before wiring the seven-segment display?</h2><div className="debrief-options">{['Common-anode/cathode type and segment pinout','Only the letter pattern in the sketch','The keypad character map'].map((item)=><button key={item} className={choice===item?'is-selected':''} onClick={()=>setChoice(item)}>{item}{choice===item&&<Check size={15}/>}</button>)}</div>{choice&&<p>Correct focus: verify the display type and actual pinout; polarity changes every segment ON/OFF level.</p>}<button className="text-button" onClick={()=>addPoints(5)}><Sparkles size={14}/> ADD CONTRIBUTION POINTS</button></div></div>;
}

function ExitTicket() {
  const questions=[
    {prompt:'What does a 4×4 keypad library return?',options:['A key event/character or NO_KEY','An ADC voltage','PWM frequency'],answer:0},
    {prompt:'Which change controls passive-piezo pitch?',options:['PWM duty only','Signal frequency','Seven-segment polarity'],answer:1},
    {prompt:'What is needed for each bare segment?',options:['One current-limiting resistor per segment branch','One shared resistor on common pin','No resistor at 5 V'],answer:0},
  ];
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const score=questions.reduce((sum,item,index)=>sum+(answers[index]===item.answer?1:0),0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={27} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Map the pins.<br/><span className="text-blue">Test the response.</span></>} subtitle="Check the key concepts, then note one setup detail you will verify before a physical build." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((item,index)=><section className="exit-question" key={item.prompt}><div className="exit-question__prompt"><span>0{index+1}</span><b>{item.prompt}</b></div><div className="exit-options">{item.options.map((option,optionIndex)=><button key={option} className={answers[index]===optionIndex?(optionIndex===item.answer?'is-correct':'is-wrong'):''} onClick={()=>setAnswers((current)=>({...current,[index]:optionIndex}))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>ONE DETAIL TO VERIFY IN THE HARDWARE LAB</span><textarea rows={2} placeholder="e.g. display polarity, segment pinout, buzzer rating"/></label><p className="w3-model-warning">Week 6 physical lab evidence comes from supervised physical measurement, not these simulators.</p></div></div>;
}

function BreakSlide({second}:{second:boolean}) {
  const [seconds,setSeconds]=useState(600);
  const [running,setRunning]=useState(false);
  useEffect(()=>{if(!running||seconds<=0)return;const timer=window.setInterval(()=>setSeconds((value)=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[running,seconds]);
  useEffect(()=>{if(seconds===0)setRunning(false);},[seconds]);
  const minutes=Math.floor(seconds/60);
  return <div className="break-layout"><div className="break-copy"><Eyebrow tone="blue">PAUSE / {second?'02':'01'} OF 02</Eyebrow><h1 id={`week4-title-${second?25:11}`}>{second?'Reset before synthesis.':'Pause between the interface stations.'}</h1><p>{second?'Return ready to compare pin maps and explain the user-facing behavior.':'You have explored matrix events and buzzer duty. Take a short break before display polarity and segment mapping.'}</p><div className="break-cues"><span><b>01</b> Rest your eyes.</span><span><b>02</b> Note an open question.</span><span><b>03</b> Return ready to test.</span></div></div><div className="break-timer-panel"><span className="break-timer-label">OPTIONAL SILENT TIMER</span><div className="break-timer">{String(minutes).padStart(2,'0')}<i>:</i>{String(seconds%60).padStart(2,'0')}</div><div className="break-timer-controls"><button className="primary-button primary-button--small" onClick={()=>setRunning((value)=>!value)}>{running?<Pause size={14}/>:<Play size={14}/>} {running?'PAUSE':'START 10 MIN'}</button><button className="reset-button" onClick={()=>{setSeconds(600);setRunning(false);}} aria-label="Reset timer"><RotateCcw size={15}/></button></div><p>The lesson will not advance automatically.</p></div></div>;
}

export default App;
