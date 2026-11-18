import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, ClipboardCheck,
  Cpu, Expand, FileText, Lightbulb, LockKeyhole, Pause, Play,
  RotateCcw, ShieldCheck, Sparkles, Wrench,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const slideNames = [
  'Start here', 'The session route', 'Simulation is not hardware', 'A001 evidence map',
  'Safety gate before power', 'Board and module compatibility', 'Known-good board check',
  'Build in small increments', 'Add one input', 'Add one output', 'Status and control',
  'Theory bridge: what changed?', 'Record a measurement', 'Trace a requirement',
  'Write the first test plan', 'Normal and boundary test', 'Manual/test mode',
  'Invalid input: approved simulation', 'Integrate after subsystem checks',
  'Debug by hypothesis', 'Debug record one', 'Debug record two', 'Continue supervised build',
  'A001 initial test review', 'Individual demonstration', 'Evidence pack check',
  'Hardware availability plan', 'Exit ticket',
];
const slideDurations = [2, 5, 8, 10, 8, 12, 15, 12, 10, 15, 15, 15, 10, 12, 12, 20, 20, 15, 15, 12, 12, 30, 30, 20, 20, 15, 10, 25];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'SAFETY + SETUP', index: 4 },
  { name: 'BUILD + MEASURE', index: 7 }, { name: 'TEST + DEBUG', index: 13 },
  { name: 'INTEGRATE', index: 18 }, { name: 'EVIDENCE', index: 23 },
];
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }

function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week6-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

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
  useEffect(() => { document.title = `EEE4015 / Week 06 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 06</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsed)}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsed)} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week6-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch(index) {
    case 0: return <Welcome onStart={()=>goTo(1)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <ConceptSlide slide={2} eyebrow="SIMULATION → HARDWARE" title="A model predicts. A prototype adds reality." subtitle="Physical parts add tolerance, noise, contact resistance, supply variation, and handling effects." tone="blue" visual="model" points={[["What simulation helps with","Repeat a logical scenario and explore expected behavior quickly.","Label outputs SIMULATION."],["What hardware adds","Component variation, wiring quality, electrical limits, instruments, and real supply behavior.","Record the actual board, modules, and conditions."],["Evidence boundary","A simulator screenshot cannot prove a physical measurement or workshop skill.","Keep simulated and measured datasets separate."]]} takeaway="Never relabel simulated observations as hardware results."/>;
    case 3: return <ConceptSlide slide={3} eyebrow="A001 / LO1 + LO2 EVIDENCE" title="Connect requirements to build and test." subtitle="Task 1.3 asks for a safe build, incremental implementation, initial tests, and documented debugging." tone="lime" visual="trace" points={[["LO1: integrated approach","Show how inputs, decisions, interfaces, power, and outputs work as one design.","Link Task 1.1 requirements to the Task 1.2 architecture."],["LO2: practical investigation","Demonstrate supervised assembly, measurement, and safe use of tools.","Identify your own physical contribution."],["Evidence over assertion","Use dated code, pin map, measurements, tests, and issue/retest records.","A screenshot without conditions is weak evidence."]]} takeaway="Every test result should point to a requirement and an evidence reference."/>;
    case 4: return <SafetyGate/>;
    case 5: return <CompatibilityCheck/>;
    case 6: return <BoardCheck/>;
    case 7: return <BuildSequence/>;
    case 8: return <ConceptSlide slide={8} eyebrow="INCREMENT 1 / INPUT" title="Add one input. Prove its path." subtitle="Before integrating control, verify the sensor signal, reference, range, and reporting independently." tone="blue" visual="input" points={[["Inspect","Compare module pin labels and datasheet with the approved wiring plan.","Do not infer pinout from package shape alone."],["Observe","Record raw values with conditions and units; use a meter only as instructed.","Serial logs can show code values; a meter observes voltage."],["Check","Exercise plausible normal values before the boundary case.","Record expected and observed behavior separately."]]} takeaway="An input is not verified until its physical path and observed range are recorded."/>;
    case 9: return <ConceptSlide slide={9} eyebrow="INCREMENT 2 / OUTPUT" title="Add one output and confirm its limits." subtitle="Check signal pin, load path, current limiting or driver, and default state before combining subsystems." tone="coral" visual="output" points={[["Identify the load","An LED, display, servo, and motor need different interfaces.","GPIO logic is not a general-purpose power source."],["Check the path","Trace supply, control, driver, return, and common reference where required.","Use the approved circuit and exact component ratings."],["Start with a safe state","Set outputs to a known state before enabling automatic control.","Do not energize an unchecked motor circuit."]]} takeaway="Separate the command path from the energy path."/>;
    case 10: return <ConceptSlide slide={10} eyebrow="INCREMENT 3 / STATUS + DECISION" title="Add status before automatic action." subtitle="A visible state makes the controller's interpretation easier to inspect and test." tone="lime" visual="state" points={[["Read and validate","Check whether an input is plausible and recent.","Define what invalid means for this subsystem."],["Decide","Use a named state and documented threshold or rule.","Avoid hidden magic values."],["Report","Display or log the state and associated output request.","Make manual/test mode distinguishable from automatic mode."]]} takeaway="Status helps explain a decision; it does not replace checking the circuit."/>;
    case 11: return <ConceptSlide slide={11} eyebrow="THEORY BRIDGE / MEASURED VS SIMULATED" title="Why did the bench differ from the model?" subtitle="Use the observed difference as data; do not silently tune until the expected answer appears." tone="blue" visual="difference" points={[["Physical variation","Tolerances, noise, wiring resistance, and supply sag affect measurements.","Record the instrument and setup."],["Calibration","A simulator's sensor values are not a physical calibration dataset.","Use known conditions and repeated readings."],["Interpretation","Compare with the model's assumptions and state limitations.","Explain the difference rather than hiding it."]]} takeaway="Every result is conditional on its setup, range, and measurement method."/>;
    case 12: return <MeasurementLog/>;
    case 13: return <Traceability/>;
    case 14: return <TestPlan/>;
    case 15: return <BoundaryTest/>;
    case 16: return <ManualModeTest/>;
    case 17: return <FaultScenario/>;
    case 18: return <IntegrationGate/>;
    case 19: return <DebugMethod/>;
    case 20: return <DebugRecord which={1}/>;
    case 21: return <DebugRecord which={2}/>;
    case 22: return <SupervisedBuild/>;
    case 23: return <AcceptanceReview/>;
    case 24: return <IndividualDemo/>;
    case 25: return <EvidencePack/>;
    case 26: return <Contingency/>;
    case 27: return <ExitTicket/>;
    default: return null;
  }
}

function Agenda() {
  const sessions=[['00:00–00:45','Safety + compatibility','Inspect approved kit; isolate before changes'],['00:45–01:30','Known-good board check','Power, upload, Serial output, safe isolation'],['01:30–03:30','Supervised subsystem build','One input and one output; test separately'],['03:30–04:00','Theory bridge','Measured vs simulated, tolerance, calibration'],['04:00–05:30','Continue + integrate','Control logic, status, manual/test mode'],['05:30–06:15','Requirement tests + debug','Normal, boundary, manual, tutor-approved invalid input'],['06:15–06:45','Demonstrate + evidence','Individual explanation, logbook, evidence review']];
  return <div className="w6-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Safety, build, measure, explain." subtitle="The instructor controls energizing decisions. The slide tools organize evidence; they do not measure the bench."/><div className="w6-agenda-list">{sessions.map(([time,title,detail],index)=><div className="w6-agenda-row" key={title}><span>{String(index+1).padStart(2,'0')}</span><b>{time}</b><strong>{title}</strong><small>{detail}</small></div>)}</div><p className="w6-callout"><AlertTriangle size={16}/> Tutor approval is required before energizing a changed circuit. Never connect this prototype to mains-powered loads.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function ConceptSlide({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w6-concept"><div className="w6-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span>{slideDurations[slide]} MIN</span></div><div className="w6-concept__body"><div className="w6-points">{points.map(([head, body, example], index) => <article className="w6-point" key={head}><span>0{index + 1}</span><div><h2>{head}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><ConceptVisual kind={visual}/></div><div className="w6-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function ConceptVisual({ kind }: { kind: string }) {
  const stages = kind === 'trace' ? [['REQUIREMENT','criterion'],['SUBSYSTEM','pin / code'],['TEST','method'],['EVIDENCE','reference']] : kind === 'output' ? [['GPIO','logic'],['DRIVER','interface'],['LOAD','energy']] : [['SIMULATION','model'],['PHYSICAL','measured'],['COMPARE','explain']];
  return <figure className="w6-visual"><div className="w6-visual__heading">{kind === 'trace' ? 'A001 TRACEABILITY' : kind === 'output' ? 'SIGNAL / POWER PATH' : 'EVIDENCE BOUNDARY'} <i>W06</i></div><div className="w6-flow">{stages.map(([title, sub], index) => <div className={`w6-flow-node w6-flow-node--${index}`} key={title}><b>{title}</b><small>{sub}</small></div>)}</div><figcaption>{kind === 'trace' ? 'Requirement → implementation → method → evidence.' : kind === 'output' ? 'A control signal is not the load energy source.' : 'Label the source of every recorded value.'}</figcaption></figure>;
}

const safetyItems = [
  'Tutor has approved the station and extra-low-voltage supply.',
  'Board, sensor, display, and actuator part numbers are identified.',
  'Operating voltage, GPIO limits, and supply capability checked.',
  'Signal path, power path, ground/reference, and polarity reviewed.',
  'Power is isolated before wiring changes; no mains-connected load.',
  'Tutor will inspect the circuit before it is energized.',
];

function SafetyGate() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [tutorReviewed, setTutorReviewed] = useState(false);
  const count = Object.values(checked).filter(Boolean).length;
  const readyForReview = count === safetyItems.length;
  return <div className="w6-tool"><Heading slide={4} eyebrow="SAFETY GATE / BEFORE POWER" title="Inspect first. Get the tutor check." subtitle="This checklist organizes the review; checking boxes is not electrical approval or permission to energize a circuit." tone="coral"/><div className="w6-safety-layout"><div className="w6-checklist">{safetyItems.map((item) => <label key={item}><input type="checkbox" checked={checked[item] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className={`w6-gate-state ${tutorReviewed ? 'is-reviewed' : ''}`}><ShieldCheck size={30}/><span>REVIEW STATUS</span><strong>{tutorReviewed ? 'TUTOR REVIEW RECORDED' : readyForReview ? 'READY TO REQUEST REVIEW' : `${count} / ${safetyItems.length} CHECKS`}</strong><p>{tutorReviewed ? 'Follow the tutor’s station-specific direction. Recheck after any wiring change.' : readyForReview ? 'Stop here and request tutor inspection before energizing.' : 'Do not energize. Resolve each item with the tutor.'}</p><button className="primary-button primary-button--small" disabled={!readyForReview} onClick={() => setTutorReviewed(true)}>{tutorReviewed ? 'REVIEW RECORDED' : 'RECORD TUTOR REVIEW'} <Check size={15}/></button><button className="text-button" onClick={() => { setChecked({}); setTutorReviewed(false); }}><RotateCcw size={14}/> RESET CHECKLIST</button></div></div><p className="w6-danger-note"><AlertTriangle size={15}/> Never connect a classroom prototype to mains-powered heaters, pumps, or fans. Do not copy an unverified motor supply from a simulator diagram.</p></div>;
}

function CompatibilityCheck() {
  const [board, setBoard] = useState('Uno R3');
  const [module, setModule] = useState('I2C LCD backpack');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const requirements = ['Exact board variant and pinout recorded', 'Module supply and logic voltage compatible', 'GPIO direction/current limits checked', 'Pull-ups, common reference, and driver needs checked', 'Supply rating matches connected loads'];
  const count = Object.values(checks).filter(Boolean).length;
  return <div className="w6-tool"><Heading slide={5} eyebrow="COMPATIBILITY REVIEW / RECORD ACTUAL PARTS" title="Board names are not enough." subtitle="Use the exact board and module documentation available at your station. This form records a review; it does not detect electrical compatibility." tone="blue"/><div className="w6-compat-layout"><div className="w6-controls"><label>Controller in your station<select value={board} onChange={(event) => setBoard(event.target.value)}><option>Uno R3</option><option>ESP32-S1</option><option>ESP32-C3</option><option>Tutor-approved equivalent</option></select></label><label>Module under review<select value={module} onChange={(event) => setModule(event.target.value)}><option>I2C LCD backpack</option><option>Analogue sensor</option><option>Servo</option><option>H-bridge + motor</option><option>Other approved module</option></select></label><div className="w6-part-card"><span>REVIEW TARGET</span><b>{board} + {module}</b><small>Record actual make/model and documentation reference in the logbook.</small></div></div><div className="w6-checklist">{requirements.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}<p className="w6-progress-note">COMPATIBILITY REVIEW {count} / {requirements.length}</p></div></div><p className="w6-danger-note"><AlertTriangle size={15}/> ESP32 GPIO is generally 3.3 V and not 5 V tolerant. Check exact board and module electrical levels before connection.</p></div>;
}

function BoardCheck() {
  const [uploaded, setUploaded] = useState(false);
  const [serial, setSerial] = useState('');
  const [codeVersion, setCodeVersion] = useState('');
  const [evidence, setEvidence] = useState('');
  return <div className="w6-tool"><Heading slide={6} eyebrow="KNOWN-GOOD BOARD CHECK / RECORD REAL OBSERVATION" title="Verify the board and serial path first." subtitle="Complete this at the bench with the tutor-approved check sketch. This form does not communicate with or measure the board." tone="blue"/><div className="w6-entry-layout"><div className="w6-controls"><label>Code version or sketch name<input value={codeVersion} onChange={(event) => setCodeVersion(event.target.value)} placeholder="e.g. board_check_v1.ino"/></label><label>Observed Serial output<textarea rows={4} value={serial} onChange={(event) => setSerial(event.target.value)} placeholder="Paste or transcribe the output you actually observed"/></label><label>Evidence reference<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Photo/log filename or portfolio reference"/></label><label className="w6-check"><input type="checkbox" checked={uploaded} onChange={(event) => setUploaded(event.target.checked)}/> I uploaded and ran the approved check sketch</label></div><div className={`w6-observation ${uploaded && serial.trim() ? 'has-observation' : ''}`}><span>BOARD CHECK RECORD</span><strong>{uploaded && serial.trim() ? 'OBSERVATION ENTERED' : 'AWAITING BENCH OBSERVATION'}</strong><p>Board: {codeVersion || 'not recorded'}</p><p>Output: {serial.trim() ? 'learner-entered' : 'no result entered'}</p><p>Evidence: {evidence || 'not linked'}</p><small>This interface never reports a test as passed automatically.</small></div></div></div>;
}

function BuildSequence() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const steps = [
    ['Board / serial check', 'Confirm programming and serial evidence.'],
    ['One physical input', 'Build and verify one sensor/input subsystem.'],
    ['One physical output/status', 'Build one approved output and verify its path.'],
    ['Automatic decision', 'Add the rule after input and output checks pass.'],
    ['Manual/test mode', 'Add and test the agreed manual/test behavior.'],
  ];
  const active = steps.find(([title]) => !done[title])?.[0] ?? 'ALL STAGES LOGGED';
  return <div className="w6-tool"><Heading slide={7} eyebrow="INCREMENTAL BUILD / ONE SUBSYSTEM AT A TIME" title="Prove each stage before integrating." subtitle="Use power isolation during changes and request a tutor check before energizing. These checkboxes track progress only."/><div className="w6-build-layout"><div className="w6-build-list">{steps.map(([title, note], index) => <label className={done[title] ? 'is-complete' : title === active ? 'is-current' : ''} key={title}><input type="checkbox" checked={done[title] ?? false} onChange={(event) => setDone((current) => ({ ...current, [title]: event.target.checked }))}/><b>0{index + 1}</b><span><strong>{title}</strong><small>{note}</small></span></label>)}</div><div className="w6-build-current"><span>CURRENT STAGE</span><strong>{active}</strong><p>Record the wiring/code version, expected behavior, observed result, and evidence reference before moving on.</p><div className="w6-stage-track">{steps.map(([title]) => <i key={title} className={done[title] ? 'is-done' : title === active ? 'is-active' : ''}/>)}</div><small>Progress is a log, not proof of safe operation; tutor review remains required.</small></div></div></div>;
}

function MeasurementLog() {
  const [instrument, setInstrument] = useState('Serial log');
  const [setup, setSetup] = useState('');
  const [units, setUnits] = useState('');
  const [observed, setObserved] = useState('');
  const [repeat, setRepeat] = useState('');
  const fieldsReady = setup.trim() !== '' && units.trim() !== '' && observed.trim() !== '';
  return <div className="w6-tool"><Heading slide={12} eyebrow="MEASUREMENT RECORD / LEARNER-ENTERED" title="Record conditions with every reading." subtitle="This form stores your notes in the current page only. It does not read a meter, sensor, or serial port." tone="blue"/><div className="w6-entry-layout"><div className="w6-controls"><label>Instrument/source<select value={instrument} onChange={(event) => setInstrument(event.target.value)}><option>Serial log</option><option>Digital multimeter</option><option>Oscilloscope (tutor-supervised)</option><option>Other tutor-approved instrument</option></select></label><label>Setup and conditions<textarea rows={3} value={setup} onChange={(event) => setSetup(event.target.value)} placeholder="Board/module, test point, supply, condition"/></label><div className="w6-two-fields"><label>Units<input value={units} onChange={(event) => setUnits(event.target.value)} placeholder="V, counts, ms"/></label><label>Observed value<input value={observed} onChange={(event) => setObserved(event.target.value)} placeholder="Enter actual reading"/></label></div><label>Repeat/uncertainty note<input value={repeat} onChange={(event) => setRepeat(event.target.value)} placeholder="Repeat count, resolution, variation"/></label></div><div className={`w6-observation ${fieldsReady ? 'has-observation' : ''}`}><span>MEASUREMENT ENTRY</span><strong>{fieldsReady ? 'RECORD FIELDS COMPLETE' : 'WAITING FOR OBSERVATION'}</strong><p>Source: {instrument}</p><p>Setup: {setup || 'not entered'}</p><p>Observed: {observed ? `${observed} ${units}` : 'not entered'}</p><small>{repeat || 'State resolution or repeatability when known.'}</small><div className="w6-source-label">PHYSICAL DATA: only select this form for readings you actually took at the supervised bench.</div></div></div></div>;
}

function Traceability() {
  const [requirement, setRequirement] = useState('FR-01');
  const [criterion, setCriterion] = useState('');
  const [subsystem, setSubsystem] = useState('');
  const [method, setMethod] = useState('');
  const [evidence, setEvidence] = useState('');
  const complete = [criterion, subsystem, method, evidence].every((value) => value.trim());
  return <div className="w6-tool"><Heading slide={13} eyebrow="REQUIREMENT TRACE / A001" title="Link a requirement to a test and evidence." subtitle="A requirement is not verified by a screenshot alone; state the acceptance criterion and method."/><div className="w6-trace-layout"><div className="w6-controls"><label>Requirement ID<input value={requirement} onChange={(event) => setRequirement(event.target.value)} /></label><label>Measurable acceptance criterion<textarea rows={2} value={criterion} onChange={(event) => setCriterion(event.target.value)} placeholder="What observable result counts as pass?"/></label><label>Subsystem / code function<input value={subsystem} onChange={(event) => setSubsystem(event.target.value)} placeholder="Input, decision, output"/></label><label>Verification method<input value={method} onChange={(event) => setMethod(event.target.value)} placeholder="Steps and conditions"/></label><label>Evidence reference<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Filename, log row, photo ID"/></label></div><div className="w6-trace-card"><span>TRACE CHAIN</span><strong>{requirement || 'REQ-ID'}</strong><div><i>{criterion ? 'CRITERION ENTERED' : 'ACCEPTANCE CRITERION'}</i><ArrowRight size={14}/><i>{subsystem ? 'SUBSYSTEM ENTERED' : 'IMPLEMENTATION'}</i><ArrowRight size={14}/><i>{method ? 'METHOD ENTERED' : 'TEST METHOD'}</i><ArrowRight size={14}/><i>{evidence ? 'EVIDENCE LINKED' : 'EVIDENCE'}</i></div><p>{complete ? 'Trace record fields complete; tutor/team review still needed.' : 'Fill each field to build the trace record.'}</p><small>Align to A001 Tasks 1.1–1.3. Keep simulation and physical evidence clearly identified.</small></div></div></div>;
}

function TestPlan() {
  const [feature, setFeature] = useState('Sensor threshold output');
  const [precondition, setPrecondition] = useState('');
  const [stimulus, setStimulus] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [result, setResult] = useState<'Not run' | 'Pass' | 'Fail'>('Not run');
  return <div className="w6-tool"><Heading slide={14} eyebrow="INITIAL TEST PLAN / EXPECTED BEFORE OBSERVED" title="Make the first tests repeatable." subtitle="Write the expected behavior before running. Record actual behavior and pass/fail only after observing it." tone="blue"/><div className="w6-test-layout"><div className="w6-controls"><label>Feature<select value={feature} onChange={(event) => setFeature(event.target.value)}><option>Sensor threshold output</option><option>Manual/test mode</option><option>Display status</option><option>Startup/reset state</option><option>Invalid input handling</option></select></label><label>Preconditions<input value={precondition} onChange={(event) => setPrecondition(event.target.value)} placeholder="Known state, tutor approval, setup"/></label><label>Input / steps<input value={stimulus} onChange={(event) => setStimulus(event.target.value)} placeholder="Exact action or value"/></label><label>Expected result<input value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="Measurable acceptance result"/></label><label>Observed result<input value={actual} onChange={(event) => setActual(event.target.value)} placeholder="Enter after test"/></label><div className="w6-test-buttons"><button onClick={() => setResult('Pass')} disabled={!actual.trim()}>MARK PASS</button><button onClick={() => setResult('Fail')} disabled={!actual.trim()}>MARK FAIL</button><button onClick={() => setResult('Not run')}>RESET</button></div></div><div className={`w6-test-card w6-test-card--${result.toLowerCase().replace(' ','-')}`}><span>TEST CASE / {feature.toUpperCase()}</span><strong>{result.toUpperCase()}</strong><p>Precondition: {precondition || 'not specified'}</p><p>Stimulus: {stimulus || 'not specified'}</p><p>Expected: {expected || 'not specified'}</p><p>Observed: {actual || 'not yet run'}</p><small>This interface does not execute or verify hardware.</small></div></div></div>;
}

function BoundaryTest() {
  const [threshold, setThreshold] = useState(500);
  const [offset, setOffset] = useState(0);
  const raw = clamp(threshold + offset, 0, 1023);
  const result = raw < threshold ? 'BELOW' : raw > threshold ? 'ABOVE' : 'EQUAL';
  return <div className="w6-tool"><Heading slide={15} eyebrow="TEST CASE DESIGN / BOUNDARY" title="Probe just below, equal, and just above." subtitle="Use your agreed requirement threshold. These controls design test values; they are not connected to a sensor." tone="blue"/><div className="w6-boundary"><div className="w6-controls"><label>Requirement threshold<input type="number" value={threshold} min={0} max={1023} onChange={(event) => setThreshold(clamp(Number(event.target.value) || 0, 0, 1023))}/></label><div className="w6-offsets">{[-1, 0, 1].map((value) => <button key={value} className={offset === value ? 'is-selected' : ''} onClick={() => setOffset(value)}>{value < 0 ? 'BELOW (T−1)' : value === 0 ? 'EQUAL (T)' : 'ABOVE (T+1)'}</button>)}</div><p className="w6-subtle">Add normal, minimum/maximum plausible, and fault cases to the test plan as needed.</p></div><div className={`w6-boundary-result w6-boundary-result--${result.toLowerCase()}`}><span>PLANNED TEST INPUT</span><strong>{raw}</strong><b>{result} THRESHOLD {threshold}</b><small>Write the expected state before applying this value to the approved test setup.</small></div></div></div>;
}

function ManualModeTest() {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL/TEST'>('AUTO');
  const [request, setRequest] = useState(false);
  const [fault, setFault] = useState(false);
  const output = fault ? 'SAFE / DISABLED' : mode === 'MANUAL/TEST' && request ? 'MANUAL REQUEST' : mode === 'AUTO' ? 'AUTOMATIC RULE' : 'NO REQUEST';
  return <div className="w6-tool"><Heading slide={16} eyebrow="REQUIREMENT TEST / MANUAL MODE" title="Prove manual mode is bounded and distinguishable." subtitle="This logic sketch helps plan test cases. It does not control or validate a physical output."/><div className="w6-manual-layout"><div className="w6-controls"><div className="segmented-control"><button className={mode === 'AUTO' ? 'is-active' : ''} onClick={() => setMode('AUTO')}>AUTO</button><button className={mode === 'MANUAL/TEST' ? 'is-active' : ''} onClick={() => setMode('MANUAL/TEST')}>MANUAL / TEST</button></div><label className="w6-check"><input type="checkbox" checked={request} onChange={(event) => setRequest(event.target.checked)}/> Manual output request</label><label className="w6-check"><input type="checkbox" checked={fault} onChange={(event) => setFault(event.target.checked)}/> Invalid input / fault condition</label></div><div className={`w6-manual-state ${fault ? 'is-fault' : ''}`}><span>PLANNED SYSTEM STATE</span><strong>{output}</strong><p>Document how the selected mode is entered/exited and what takes priority on reset or invalid input.</p></div></div></div>;
}

function FaultScenario() {
  const [scenario, setScenario] = useState('Invalid sensor input');
  const [response, setResponse] = useState('');
  const cases: Record<string, string> = {
    'Invalid sensor input': 'Tutor-approved simulated value; do not disconnect or short a live physical input unless specifically directed.',
    'Reset / startup': 'Observe whether outputs begin in the agreed safe state; only test reset when the tutor approves the setup.',
    'Boundary noise': 'Use a planned set of values around the threshold or an approved simulator input; never create an electrical fault.',
  };
  return <div className="w6-tool"><Heading slide={17} eyebrow="FAULT CASE / APPROVED TEST ONLY" title="Plan an abnormal case without creating unsafe faults." subtitle="Use tutor-approved simulated invalid input or a safe restart procedure. Do not short, overload, reverse-power, or disconnect energized hardware." tone="coral"/><div className="w6-fault-layout"><div className="w6-controls"><label>Scenario<select value={scenario} onChange={(event) => setScenario(event.target.value)}>{Object.keys(cases).map((item) => <option key={item}>{item}</option>)}</select></label><div className="w6-warning"><AlertTriangle size={17}/><span>{cases[scenario]}</span></div><label>Expected safe response<textarea rows={3} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="What should status and outputs do?"/></label></div><div className="w6-fault-state"><LockKeyhole size={28}/><strong>{response.trim() ? 'EXPECTED RESPONSE RECORDED' : 'DEFINE SAFE RESPONSE FIRST'}</strong><p>After approval, capture the actual outcome and recovery action in the test record.</p><small>No fault is injected by this slide.</small></div></div></div>;
}

function IntegrationGate() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = ['Input tested independently', 'Output/status tested independently', 'Pin map and power path reviewed', 'Automatic rule stated and bounded', 'Manual/test mode behavior stated', 'Invalid/reset state defined'];
  const complete = items.every((item) => checks[item]);
  return <div className="w6-tool"><Heading slide={18} eyebrow="INTEGRATION GATE / AFTER SUBSYSTEM TESTS" title="Connect only after both sides are understood." subtitle="This checklist organizes an integration review; tutor approval still governs physical wiring and energizing."/><div className="w6-integration"><div className="w6-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className={`w6-gate-state ${complete ? 'is-reviewed' : ''}`}><Wrench size={29}/><span>INTEGRATION STATUS</span><strong>{complete ? 'READY TO REQUEST TUTOR CHECK' : 'SUBSYSTEM CHECKS REMAIN'}</strong><p>{complete ? 'Ask for review before reconnecting or applying power.' : 'Complete independent checks and record evidence first.'}</p></div></div></div>;
}

function DebugMethod() {
  return <div className="w6-tool"><Heading slide={19} eyebrow="DEBUGGING / REPRODUCE → HYPOTHESIZE → CHANGE ONE THING" title="A fix is not proven until the retest." subtitle="Keep the original symptom and evidence. Change one factor, rerun the same steps, and compare." tone="blue"/><div className="w6-debug-loop">{[['01','REPRODUCE','Record setup and exact symptom.'],['02','HYPOTHESIZE','Name one likely cause and why.'],['03','CHANGE ONE THING','Power off and get approval before wiring changes.'],['04','RETEST','Repeat the same steps and compare results.'],['05','RECORD','Keep before/after evidence and limitations.']].map(([number,title,detail]) => <article key={number}><span>{number}</span><b>{title}</b><small>{detail}</small></article>)}</div><p className="w6-callout"><ClipboardCheck size={16}/> A001 asks for at least two issues, diagnosis, corrective action, and retest result.</p></div>;
}

type DebugRecordProps = { which: 1 | 2 };
function DebugRecord({ which }: DebugRecordProps) {
  const [issue, setIssue] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [change, setChange] = useState('');
  const [retest, setRetest] = useState('');
  const [evidence, setEvidence] = useState('');
  const ready = [issue, hypothesis, change, retest, evidence].every((value) => value.trim());
  return <div className="w6-tool"><Heading slide={which === 1 ? 20 : 21} eyebrow={`DEBUG RECORD / ISSUE ${which} OF 2 MINIMUM`} title={which === 1 ? 'Capture the first issue and retest.' : 'Capture a second issue and retest.'} subtitle="Use an observed issue from your supervised build. Do not invent a successful result; record what happened." tone="blue"/><div className="w6-debug-record"><div className="w6-controls"><label>Observed issue<textarea rows={2} value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Exact symptom, state, and conditions"/></label><label>Hypothesis<textarea rows={2} value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder="One likely cause and reason"/></label><label>Corrective action<textarea rows={2} value={change} onChange={(event) => setChange(event.target.value)} placeholder="One change made after power isolation/review"/></label><label>Retest result<textarea rows={2} value={retest} onChange={(event) => setRetest(event.target.value)} placeholder="Same steps; expected vs observed"/></label><label>Evidence reference<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Photo, log, code version, test ID"/></label></div><div className={`w6-debug-summary ${ready ? 'is-ready' : ''}`}><span>ISSUE / RETEST RECORD {which}</span><strong>{ready ? 'RECORD FIELDS COMPLETE' : 'INCOMPLETE RECORD'}</strong><p>Issue: {issue || 'not entered'}</p><p>Hypothesis: {hypothesis || 'not entered'}</p><p>Change: {change || 'not entered'}</p><p>Retest: {retest || 'not entered'}</p><small>Field completeness is not an assessment of whether the fix worked; review with your tutor/team.</small></div></div></div>;
}

function SupervisedBuild() {
  const [block, setBlock] = useState<'subsystem' | 'integration'>('subsystem');
  const tasks = block === 'subsystem'
    ? ['Identify approved board and module', 'Review pinout, voltage, and load path', 'Tutor checks circuit before energizing', 'Test one input or output independently', 'Capture observed result and code version']
    : ['Power off/isolate before changes', 'Tutor reviews updated circuit', 'Connect only tested subsystems', 'Check startup and safe output state', 'Run one normal and one approved edge test'];
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  return <div className="w6-tool"><Heading slide={22} eyebrow="SUPERVISED BUILD BLOCK / 30 MINUTES" title="Work from the approved subsystem outward." subtitle="Use the instructor's station rules and components. This checklist supports team coordination; it is not a substitute for direct supervision."/><div className="w6-build-session"><div className="segmented-control"><button className={block === 'subsystem' ? 'is-active' : ''} onClick={() => { setBlock('subsystem'); setChecks({}); }}>SUBSYSTEM</button><button className={block === 'integration' ? 'is-active' : ''} onClick={() => { setBlock('integration'); setChecks({}); }}>INTEGRATION</button></div><div className="w6-checklist">{tasks.map((task) => <label key={task}><input type="checkbox" checked={checks[task] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [task]: event.target.checked }))}/><span>{task}</span></label>)}</div><div className="w6-build-note"><LockKeyhole size={21}/><p>Stop and ask the tutor if the pinout, voltage, current path, or expected state is uncertain. Do not improvise a power source.</p></div></div></div>;
}

function AcceptanceReview() {
  const [rows, setRows] = useState([
    { requirement: 'Normal sensor response', expected: '', observed: '', evidence: '', result: 'Not run' },
    { requirement: 'Threshold / boundary', expected: '', observed: '', evidence: '', result: 'Not run' },
    { requirement: 'Manual / test mode', expected: '', observed: '', evidence: '', result: 'Not run' },
    { requirement: 'Invalid input / safe response', expected: '', observed: '', evidence: '', result: 'Not run' },
  ]);
  const update = (index: number, field: 'expected' | 'observed' | 'evidence', value: string) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  const setResult = (index: number, result: 'Pass' | 'Fail') => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, result } : row));
  return <div className="w6-tool"><Heading slide={23} eyebrow="A001 INITIAL TEST REVIEW" title="Test against requirements, not impressions." subtitle="Record the expected and observed result, pass/fail, and evidence reference. Only enter results you actually observed." tone="blue"/><div className="w6-test-matrix">{rows.map((row, index) => <article className="w6-test-row" key={row.requirement}><b>{row.requirement}</b><input value={row.expected} onChange={(event) => update(index, 'expected', event.target.value)} placeholder="Expected"/><input value={row.observed} onChange={(event) => update(index, 'observed', event.target.value)} placeholder="Observed"/><input value={row.evidence} onChange={(event) => update(index, 'evidence', event.target.value)} placeholder="Evidence ref"/><div className="w6-test-buttons"><button onClick={() => setResult(index, 'Pass')} disabled={!row.observed.trim()}>PASS</button><button onClick={() => setResult(index, 'Fail')} disabled={!row.observed.trim()}>FAIL</button><span>{row.result}</span></div></article>)}</div><p className="w6-subtle">Include at least one normal, threshold/boundary, manual/test-mode, and safe invalid-input case as specified by your agreed requirements.</p></div>;
}

function IndividualDemo() {
  const [explained, setExplained] = useState<Record<string, boolean>>({});
  const items = ['Identify one physical connection safely', 'Trace signal and power paths', 'Explain one actual measurement and its units', 'Describe your personal contribution', 'Compare one physical observation with simulation'];
  return <div className="w6-tool"><Heading slide={24} eyebrow="INDIVIDUAL DEMONSTRATION / 20 MINUTES" title="Each student explains one part they built or tested." subtitle="The demonstration is an opportunity to verify individual practical contribution and interpretation."/><div className="w6-demo-layout"><div className="w6-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={explained[item] ?? false} onChange={(event) => setExplained((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className="w6-demo-card"><span>DEMONSTRATION PROMPT</span><strong>What did you expect, what did you observe, and what evidence supports your explanation?</strong><p>Use your actual setup and logbook. Distinguish your own work from shared team work.</p></div></div></div>;
}

function EvidencePack() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = ['Updated circuit and pin map', 'Dated code version and subsystem notes', 'Physical photos/logs labelled with conditions', 'Requirement-linked initial test table', 'At least two issue → fix → retest records', 'Individual logbook contribution', 'Simulation evidence labelled separately'];
  const complete = Object.values(checks).filter(Boolean).length;
  return <div className="w6-tool"><Heading slide={25} eyebrow="PORTFOLIO PACK / TASKS 1.2–1.3" title="Make the evidence findable and attributable." subtitle="Use filenames and references that connect diagrams, code, tests, and individual logbook records." tone="blue"/><div className="w6-evidence-layout"><div className="w6-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className="w6-evidence-card"><FileText size={28}/><span>EVIDENCE PACK CHECK</span><strong>{complete} / {items.length}</strong><p>Organize files so a reviewer can trace each requirement to a build, test, result, and contributor.</p></div></div></div>;
}

function Contingency() {
  return <div className="w6-tool"><Heading slide={26} eyebrow="HARDWARE AVAILABILITY / LO2" title="A missing kit does not turn simulation into hardware evidence." subtitle="The tutor must arrange an equivalent supervised laboratory/workshop investigation if physical hardware is unavailable to the cohort." tone="coral"/><div className="w6-contingency"><div><ShieldCheck size={26}/><b>IF YOUR TEAM HAS APPROVED HARDWARE</b><p>Build and test a physical subsystem; label measurements with setup, instrument, units, and date.</p></div><div><AlertTriangle size={26}/><b>IF HARDWARE IS NOT AVAILABLE</b><p>Notify the tutor and arrange an equivalent supervised physical investigation for LO2. Keep simulator evidence clearly labelled SIMULATION.</p></div></div></div>;
}

function ExitTicket() {
  const questions = [
    { prompt: 'What must happen before changing a physical circuit?', options: ['Power down/isolate and follow tutor procedure', 'Change wires while it runs', 'Assume the simulator matches'], answer: 0 },
    { prompt: 'What makes a measurement interpretable?', options: ['Value only', 'Instrument/setup, units, conditions, and uncertainty/limits', 'A screenshot without context'], answer: 1 },
    { prompt: 'What demonstrates a diagnosed fix?', options: ['A hypothesis, one corrective change, and retest', 'Only the final code', 'A successful simulator run'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={27} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Build in steps.<br/><span className="text-blue">Prove each one.</span></>} subtitle="Check the practical workflow, then note one piece of evidence you still need for A001." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>ONE A001 EVIDENCE ITEM TO COMPLETE</span><textarea rows={2} placeholder="e.g. boundary test observation or second issue/retest record"/></label></div></div>;
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w6-welcome"><div className="w6-welcome__copy"><Eyebrow>FIELD NOTES / 06</Eyebrow><h1 id="week6-title-0">Build safely.<br/><span>Prove the behavior.</span></h1><p>A supervised physical prototype session focused on incremental construction, measurable tests, and A001 evidence.</p><div className="w6-meta"><span><b>28</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>LO2</b> PRACTICAL</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w6-hero"><div className="w6-hero__bench"><Wrench size={34}/><span>SUPERVISED BENCH</span></div><div className="w6-hero__path"><i/><i/><i/><i/></div><div className="w6-hero__check"><ShieldCheck size={30}/><b>CHECK</b></div><div className="w6-hero__label">ISOLATE → VERIFY → BUILD → TEST</div><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 SAFETY POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Build one subsystem at a time</div><div><Check size={16}/> Record real observations</div><div><Check size={16}/> Retest two diagnosed issues</div></div></div>;
}

export default App;

