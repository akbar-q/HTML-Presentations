import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check,
  ClipboardCheck, Cpu, Expand, FileText, GitBranch, Lightbulb,
  Pause, Play, Sparkles, Target, TimerReset, Users, Wrench,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const slideNames = [
  'Start here', 'The session route', 'Verification is not validation', 'Test from component to system',
  'Bring the requirement set back', 'Write an unambiguous acceptance limit', 'The anatomy of a test case',
  'Build a reproducible test case', 'Coverage is more than normal operation', 'Check normal input behavior',
  'Probe boundary values', 'Plan a safe invalid-input test', 'Verify manual and test modes',
  'Test reset and power restart', 'Walk safe recovery step by step', 'Inspect requirement coverage',
  'Repeat readings and record conditions', 'Read a signal trace with threshold crossings',
  'Record actual results with evidence', 'Run the full-system test session', 'Investigate a failure with evidence',
  'Record the fix and retest', 'Rerun the affected regression set', 'Peer-review a test for reproducibility',
  'State what the data can and cannot prove', 'Prepare the operator guide', 'A002 Task 2.2 evidence clinic', 'Exit ticket',
];
const slideDurations = [5, 10, 10, 10, 15, 15, 15, 20, 15, 15, 15, 15, 15, 15, 20, 15, 15, 15, 15, 20, 15, 15, 15, 15, 15, 15, 15, 10];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'REQUIREMENTS', index: 4 },
  { name: 'COVERAGE', index: 8 }, { name: 'EXECUTE TESTS', index: 14 },
  { name: 'DEBUG + REVIEW', index: 20 }, { name: 'EVIDENCE', index: 26 },
];
const requirements = [
  { id: 'FR-01', label: 'Read sensor input' },
  { id: 'FR-02', label: 'Apply decision threshold' },
  { id: 'FR-03', label: 'Show status to user' },
  { id: 'FR-04', label: 'Support manual/test mode' },
];
const coverageCases = [
  'Normal operating range', 'Lower boundary', 'Threshold equality', 'Upper boundary',
  'Invalid input (simulation)', 'Manual / test mode', 'Reset / startup', 'Power restart',
  'Safe recovery', 'Required output behavior',
];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }
function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week8-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

function App() {
  const [slide, setSlide] = useState(0);
  const [points, setPoints] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const reducedMotion = useReducedMotion();
  const animated = motionEnabled && !reducedMotion;
  const stageRef = useRef<HTMLElement>(null);
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
  useEffect(() => { document.title = `EEE4015 / Week 08 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; window.scrollTo({ top: 0, behavior: 'auto' }); }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 08</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsedAt(slide))}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsedAt(slide))} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week8-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(1)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <Concept slide={2} eyebrow="A002 / TASK 2.2" title="Test the implementation. Then judge the requirement." subtitle="Verification asks whether the system meets its stated requirement. Validation asks whether that requirement solves the intended user need." tone="blue" visual="verify" points={[["Verification","Compare actual behavior with a measurable acceptance criterion.","Did the system do what its requirement states?"],["Validation","Check whether the chosen requirement is useful for the user and context.","Did we specify the right behavior?"],["Evidence boundary","Code review helps explain behavior but does not replace observed results.","Separate planned, simulated, and measured outcomes."]]} takeaway="A pass/fail decision needs an agreed limit and an observed result."/>;
    case 3: return <TestLevels/>;
    case 4: return <RequirementMap/>;
    case 5: return <AcceptanceLimit/>;
    case 6: return <CaseAnatomy/>;
    case 7: return <TestCaseBuilder variant="functional"/>;
    case 8: return <CoverageMatrix/>;
    case 9: return <NormalTest/>;
    case 10: return <BoundaryExplorer/>;
    case 11: return <FaultPlanner/>;
    case 12: return <ModeTest/>;
    case 13: return <ResetTest/>;
    case 14: return <RecoveryFlow/>;
    case 15: return <CoverageReview/>;
    case 16: return <MeasurementRecord/>;
    case 17: return <SignalTrace/>;
    case 18: return <ResultsLog/>;
    case 19: return <ExecutionBoard/>;
    case 20: return <DebugFlow/>;
    case 21: return <TestCaseBuilder variant="failure"/>;
    case 22: return <RegressionPlan/>;
    case 23: return <PeerRepro/>;
    case 24: return <Limitations/>;
    case 25: return <OperatorGuide/>;
    case 26: return <EvidenceClinic/>;
    case 27: return <ExitTicket/>;
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w8-welcome"><div className="w8-welcome__copy"><Eyebrow>FIELD NOTES / 08</Eyebrow><h1 id="week8-title-0">Test the whole system.<br/><span>Trust the evidence.</span></h1><p>Turn requirements into repeatable tests, follow failures to their cause, and keep every result tied to its evidence.</p><div className="w8-meta"><span><b>28</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>A002</b> TASK 2.2</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w8-hero"><svg viewBox="0 0 640 360" role="img" aria-labelledby="w8-hero-title w8-hero-desc"><title id="w8-hero-title">Test the system from requirement to result</title><desc id="w8-hero-desc">A requirement flows through setup, input, system behavior, measured result, and evidence.</desc><path className="w8-hero-track" d="M98 180 H540"/><path className="w8-hero-track w8-hero-track--secondary" d="M98 180 C160 70 245 70 308 180 S458 290 540 180"/><g className="w8-hero-node w8-hero-node--1"><circle cx="98" cy="180" r="39"/><text x="98" y="176" textAnchor="middle">REQ</text><text x="98" y="194" textAnchor="middle">LIMIT</text></g><g className="w8-hero-node w8-hero-node--2"><circle cx="208" cy="180" r="31"/><text x="208" y="184" textAnchor="middle">SETUP</text></g><g className="w8-hero-node w8-hero-node--3"><circle cx="320" cy="180" r="43"/><text x="320" y="176" textAnchor="middle">SYSTEM</text><text x="320" y="194" textAnchor="middle">UNDER TEST</text></g><g className="w8-hero-node w8-hero-node--4"><circle cx="432" cy="180" r="31"/><text x="432" y="184" textAnchor="middle">RESULT</text></g><g className="w8-hero-node w8-hero-node--5"><circle cx="542" cy="180" r="39"/><text x="542" y="176" textAnchor="middle">EVIDENCE</text><text x="542" y="194" textAnchor="middle">LINK</text></g><text className="w8-hero-label" x="320" y="48" textAnchor="middle">REPEATABLE • TRACEABLE • HONEST</text></svg><button className="art-answer" onClick={() => addPoints(5)}><Target size={14}/> +5 TEST-DESIGN POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Cover boundaries, faults, reset, and recovery</div><div><Check size={16}/> Record actual outcomes and evidence</div><div><Check size={16}/> Debug, retest, and review traceability</div></div></div>;
}

function Agenda() {
  const blocks = [
    ['00:00–01:45', 'Concept + test design', 'Verification, levels, requirements, boundaries, and a traceable test case'],
    ['01:45–05:45', 'Supervised full-system testing', 'Run the test plan; record results; investigate failures; correct and retest'],
    ['05:45–06:45', 'Team review + evidence', 'Each member explains an owned requirement and a peer checks reproducibility'],
  ];
  return <div className="w8-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Plan it. Run it. Make it reproducible." subtitle="The class moves from a testable requirement to observed behavior, corrective action, and a team evidence review."/><div className="w8-agenda-flow">{blocks.map(([time, title, detail], index) => <article key={title}><span>0{index + 1}</span><b>{time}</b><h2>{title}</h2><p>{detail}</p></article>)}</div><p className="w8-callout"><AlertTriangle size={16}/> Fault cases must be tutor-approved and low risk. Do not short, overload, reverse-power, or otherwise stress physical equipment.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function Concept({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w8-concept"><div className="w8-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span>{slideDurations[slide]} MIN</span></div><div className="w8-concept__body"><div className="w8-points">{points.map(([head, body, example], index) => <article className="w8-point" key={head}><span>0{index + 1}</span><div><h2>{head}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><ConceptVisual kind={visual}/></div><div className="w8-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function ConceptVisual({ kind }: { kind: string }) {
  const content: Record<string, { heading: string; nodes: string[]; caption: string }> = {
    verify: { heading: 'TWO QUESTIONS / ONE SYSTEM', nodes: ['REQUIREMENT', 'IMPLEMENTATION', 'OBSERVATION', 'JUDGEMENT'], caption: 'The result can pass verification while the requirement still needs validation.' },
    levels: { heading: 'TEST LEVELS', nodes: ['SUBSYSTEM', 'INTEGRATION', 'SYSTEM', 'ACCEPTANCE'], caption: 'Move from isolated functions to end-to-end user behavior.' },
    trace: { heading: 'TRACEABILITY', nodes: ['REQ-ID', 'SETUP', 'EXPECTED', 'OBSERVED'], caption: 'Keep every test outcome connected to its source requirement.' },
  };
  const item = content[kind] ?? content.verify;
  return <figure className="w8-visual"><div className="w8-visual__heading">{item.heading}<i>W08</i></div><div className="w8-flow">{item.nodes.map((node, index) => <div className={`w8-flow-node w8-flow-node--${index}`} key={node}><b>{node}</b><small>{['define', 'configure', 'measure', 'decide'][index]}</small></div>)}</div><figcaption>{item.caption}</figcaption></figure>;
}

const sampleRequirements = [
  { id: 'FR-01', name: 'Sensor value is read and displayed with units.' },
  { id: 'FR-02', name: 'Output follows the agreed threshold rule.' },
  { id: 'FR-03', name: 'Manual/test mode is visibly distinct from automatic mode.' },
  { id: 'FR-04', name: 'Invalid input produces the agreed safe indication/state.' },
];

function TestLevels() {
  const [level, setLevel] = useState(0);
  const levels = [
    ['SUBSYSTEM', 'Check one sensor, input, output, or code function in isolation.', 'Does the individual part behave within its stated limits?'],
    ['INTEGRATION', 'Check signals and state changes across connected subsystems.', 'Do the parts exchange the right values and states?'],
    ['SYSTEM', 'Run the complete intended sequence, including startup and recovery.', 'Does the whole prototype behave under stated conditions?'],
    ['ACCEPTANCE', 'Compare user-facing behavior against the agreed requirement set.', 'Does the result meet the agreed user need?'],
  ];
  return <div className="w8-tool"><Heading slide={3} eyebrow="TEST LEVELS / CHOOSE THE QUESTION" title="Test one part, then test the connections." subtitle="Each level answers a different question; a successful subsystem check does not prove full-system behavior."/><div className="w8-level-layout"><div className="w8-level-rail">{levels.map(([name], index) => <button key={name} className={index === level ? 'is-active' : ''} onClick={() => setLevel(index)}><span>0{index + 1}</span><b>{name}</b><i className={index < level ? 'is-complete' : ''}/></button>)}</div><div className={`w8-level-detail w8-level-detail--${level}`}><span>SELECTED LEVEL / {String(level + 1).padStart(2, '0')}</span><h2>{levels[level][0]}</h2><p>{levels[level][1]}</p><strong>{levels[level][2]}</strong><div className="w8-mini-flow"><i>INPUT / CONDITION</i><ArrowRight size={15}/><i>BEHAVIOR</i><ArrowRight size={15}/><i>OBSERVED RESULT</i></div></div></div></div>;
}

function RequirementMap() {
  const [selected, setSelected] = useState(0);
  const current = sampleRequirements[selected];
  return <div className="w8-tool"><Heading slide={4} eyebrow="REQUIREMENT INVENTORY / TEST ALL FUNCTIONAL NEEDS" title="Bring the agreed requirement set to the bench." subtitle="These are example cabinet requirements. Replace them with the team's reviewed IDs and acceptance criteria." tone="blue"/><div className="w8-req-layout"><div className="w8-req-list">{sampleRequirements.map((requirement, index) => <button key={requirement.id} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)}><span>{requirement.id}</span><b>{requirement.name}</b></button>)}</div><div className="w8-req-detail"><Target size={26}/><span>SELECTED REQUIREMENT</span><strong>{current.id}</strong><p>{current.name}</p><div className="w8-req-chain"><i>REQUIREMENT</i><ArrowRight size={14}/><i>TEST ID</i><ArrowRight size={14}/><i>EVIDENCE REF</i></div><small>Each requirement needs a test or a recorded reason why it is not testable in this session.</small></div></div></div>;
}

function AcceptanceLimit() {
  const [unit, setUnit] = useState('ADC counts');
  const [lower, setLower] = useState('300');
  const [upper, setUpper] = useState('700');
  const [rule, setRule] = useState('Within inclusive range');
  const valid = lower.trim() !== '' && upper.trim() !== '' && Number(lower) <= Number(upper);
  return <div className="w8-tool"><Heading slide={5} eyebrow="ACCEPTANCE CRITERION / BEFORE YOU RUN" title="Write the pass limit before collecting results." subtitle="A criterion should define units, conditions, and an unambiguous decision rule. Example values below are placeholders."/><div className="w8-limit-layout"><div className="w8-controls"><label>Measurement unit<input value={unit} onChange={(event) => setUnit(event.target.value)} /></label><div className="w8-two-fields"><label>Lower limit<input type="number" value={lower} onChange={(event) => setLower(event.target.value)} /></label><label>Upper limit<input type="number" value={upper} onChange={(event) => setUpper(event.target.value)} /></label></div><label>Decision rule<select value={rule} onChange={(event) => setRule(event.target.value)}><option>Within inclusive range</option><option>Strictly between limits</option><option>At or above lower limit</option><option>At or below upper limit</option></select></label></div><div className={`w8-limit-visual ${valid ? '' : 'is-invalid'}`}><span>EXAMPLE ACCEPTANCE WINDOW</span><div className="w8-limit-axis"><i className="w8-limit-allowed"/><b>{lower || 'LOW'}</b><b>{upper || 'HIGH'}</b><em>OUT</em></div><strong>{valid ? `${lower}–${upper} ${unit}` : 'CHECK LIMITS'}</strong><p>{rule}. State startup, sensor, and supply conditions alongside the limit.</p><small>Replace placeholders with values justified by the team's requirement and data.</small></div></div></div>;
}

function CaseAnatomy() {
  const parts = [
    ['ID + requirement', 'TC-04 → FR-02', 'What need does the test verify?'],
    ['Setup + condition', 'Board version, supply, sensor state', 'Could a teammate reproduce the setup?'],
    ['Input + procedure', 'Exact value or action, in order', 'Is the test specific enough to repeat?'],
    ['Expected + limit', 'Predicted state and pass boundary', 'Was this defined before observing?'],
    ['Observed + decision', 'Actual result; pass/fail/not run', 'Is the result honest and evidence-backed?'],
    ['Evidence + correction', 'File reference and follow-up action', 'Can a reviewer find the supporting record?'],
  ];
  return <div className="w8-tool"><Heading slide={6} eyebrow="TEST CASE / MAKE IT REPRODUCIBLE" title="A test is a recipe plus a decision rule." subtitle="A short 'works' demonstration is not a test record unless conditions and the outcome can be checked." tone="blue"/><div className="w8-anatomy-grid">{parts.map(([title, example, prompt], index) => <article key={title}><span>0{index + 1}</span><b>{title}</b><strong>{example}</strong><small>{prompt}</small></article>)}</div><p className="w8-callout"><ClipboardCheck size={16}/> A useful test includes requirement ID, setup, input, expected, observed, pass/fail, evidence, and corrective action where needed.</p></div>;
}

type BuilderVariant = 'functional' | 'failure';
function TestCaseBuilder({ variant }: { variant: BuilderVariant }) {
  const [requirement, setRequirement] = useState(variant === 'functional' ? 'FR-02' : 'FR-04');
  const [setup, setSetup] = useState('');
  const [input, setInput] = useState('');
  const [expected, setExpected] = useState('');
  const [observed, setObserved] = useState('');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState<'Not run' | 'Pass' | 'Fail'>('Not run');
  const ready = [requirement, setup, input, expected, observed, evidence].every((field) => field.trim());
  const heading = variant === 'functional' ? 'Build a traceable functional test.' : 'Write a failure test, then preserve the retest.';
  return <div className="w8-tool"><Heading slide={variant === 'functional' ? 7 : 21} eyebrow={variant === 'functional' ? 'TEST CASE BUILDER / PLANNING TEMPLATE' : 'FAILURE RECORD / RETEST TEMPLATE'} title={heading} subtitle="The form organizes your record; it does not run or verify the physical system. Use observed results only." tone={variant === 'failure' ? 'coral' : 'blue'}/><div className="w8-builder-layout"><div className="w8-controls"><label>Requirement ID<select value={requirement} onChange={(event) => setRequirement(event.target.value)}>{sampleRequirements.map((item) => <option key={item.id}>{item.id}</option>)}</select></label><label>Setup and conditions<textarea rows={2} value={setup} onChange={(event) => setSetup(event.target.value)} placeholder="Version, equipment, supply, initial state"/></label><label>Input / procedure<textarea rows={2} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Exact stimulus or ordered test steps"/></label><label>Expected result and limit<textarea rows={2} value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="Predicted behavior and acceptance boundary"/></label><label>Observed result<textarea rows={2} value={observed} onChange={(event) => setObserved(event.target.value)} placeholder="Enter only after the test is run"/></label><label>Evidence reference<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Test ID, filename, log row, dated photo"/></label><div className="w8-result-actions"><button onClick={() => setResult('Pass')} disabled={!ready}>MARK PASS</button><button onClick={() => setResult('Fail')} disabled={!ready}>MARK FAIL</button><button onClick={() => setResult('Not run')}>RESET</button></div></div><aside className={`w8-case-card w8-case-card--${result.toLowerCase().replace(' ', '-')}`}><span>TEST RECORD / {requirement}</span><strong>{result.toUpperCase()}</strong><div className="w8-case-progress"><i className={requirement ? 'is-filled' : ''}/><i className={setup ? 'is-filled' : ''}/><i className={input ? 'is-filled' : ''}/><i className={expected ? 'is-filled' : ''}/><i className={observed ? 'is-filled' : ''}/><i className={evidence ? 'is-filled' : ''}/></div><p><b>Setup</b>{setup || 'Not entered'}</p><p><b>Input</b>{input || 'Not entered'}</p><p><b>Expected</b>{expected || 'Not entered'}</p><p><b>Observed</b>{observed || 'Not run'}</p><small>{ready ? 'Record fields complete. Review result with your tutor/team.' : 'Complete the record before making a pass/fail decision.'}</small></aside></div></div>;
}

function CoverageMatrix() {
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const keyFor = (row: string, req: string) => `${row}:${req}`;
  const total = coverageCases.length * requirements.length;
  const count = Object.values(marked).filter(Boolean).length;
  const linkedRows = coverageCases.filter((row) => requirements.some((req) => marked[keyFor(row, req.id)])).length;
  return <div className="w8-tool"><Heading slide={8} eyebrow="COVERAGE / INTERACTIVE REQUIREMENT MAP" title="Every behavior needs a test or a reason." subtitle="Mark the requirement links your team has test cases for. A checked link means 'planned/recorded', not automatically passed."/><div className="w8-coverage-wrap"><table className="w8-coverage"><caption>Example requirement IDs. Replace them with your team's reviewed requirements.</caption><thead><tr><th>TEST CONDITION</th>{requirements.map((req) => <th key={req.id}><span>{req.id}</span><small>{req.label}</small></th>)}</tr></thead><tbody>{coverageCases.map((row) => <tr key={row}><th>{row}</th>{requirements.map((req) => <td key={req.id}><label className="w8-coverage-check"><input aria-label={`${row} linked to ${req.id}`} type="checkbox" checked={marked[keyFor(row, req.id)] ?? false} onChange={(event) => setMarked((current) => ({ ...current, [keyFor(row, req.id)]: event.target.checked }))}/><span/></label></td>)}</tr>)}</tbody></table><div className="w8-coverage-status"><div><span>LINKED CELLS</span><strong>{count} / {total}</strong></div><div><span>CONDITIONS WITH A TEST LINK</span><strong>{linkedRows} / {coverageCases.length}</strong></div><p>Prioritise uncovered requirements and every boundary, invalid-input, manual, reset, and recovery condition required by your project.</p></div></div></div>;
}

function NormalTest() {
  const [sample, setSample] = useState(4);
  const normalSamples = [300, 360, 420, 480, 540, 600, 660];
  const value = normalSamples[sample];
  return <div className="w8-tool"><Heading slide={9} eyebrow="NORMAL OPERATION / PREDICT → RUN → COMPARE" title="Start with the expected operating range." subtitle="Use the requirement's normal conditions first. This slider selects a planned example value; it is not connected to a sensor." tone="blue"/><div className="w8-normal-layout"><div className="w8-controls"><label>Planned input <b>{value} counts</b><input type="range" min="0" max="6" value={sample} onChange={(event) => setSample(Number(event.target.value))}/></label><div className="w8-normal-range"><span>LOW EXAMPLE</span><i style={{ left: `${sample * 16.66}%` }}/><span>HIGH EXAMPLE</span></div><p className="w8-subtle">Write the expected status/output for the selected condition before running the approved project test.</p></div><div className="w8-normal-diagram"><svg viewBox="0 0 540 190" role="img" aria-labelledby="normal-title normal-desc"><title id="normal-title">Normal input test path</title><desc id="normal-desc">A planned sensor input flows through validation and the controller to an observed output.</desc><path className="w8-svg-path" d="M92 93 H448"/><g className="w8-svg-node w8-svg-node--blue"><rect x="22" y="48" width="140" height="90" rx="5"/><text x="92" y="82" textAnchor="middle">INPUT</text><text x="92" y="105" textAnchor="middle">{value} COUNTS</text></g><g className="w8-svg-node"><rect x="200" y="48" width="140" height="90" rx="5"/><text x="270" y="82" textAnchor="middle">VALIDATE</text><text x="270" y="105" textAnchor="middle">RANGE + STATE</text></g><g className="w8-svg-node w8-svg-node--lime"><rect x="378" y="48" width="140" height="90" rx="5"/><text x="448" y="82" textAnchor="middle">OBSERVE</text><text x="448" y="105" textAnchor="middle">STATUS / OUTPUT</text></g></svg><span>PLANNED TEST / NO HARDWARE LINK</span></div></div></div>;
}

function BoundaryExplorer() {
  const [threshold, setThreshold] = useState(520);
  const [offset, setOffset] = useState(-1);
  const value = clamp(threshold + offset, 0, 1023);
  const position = (value / 1023) * 100;
  return <div className="w8-tool"><Heading slide={10} eyebrow="BOUNDARY TEST / LOWER • EQUAL • UPPER" title="Probe just below, exactly at, and just above." subtitle="Set the project's threshold and test its documented equality rule. These are planned inputs, not live sensor readings." tone="blue"/><div className="w8-boundary-layout"><div className="w8-controls"><label>Threshold <b>{threshold} counts</b><input type="range" min="1" max="1022" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))}/></label><div className="w8-boundary-buttons">{[-1, 0, 1].map((delta) => <button key={delta} className={offset === delta ? 'is-active' : ''} onClick={() => setOffset(delta)}>{delta < 0 ? 'T − 1' : delta === 0 ? 'T / EQUAL' : 'T + 1'}</button>)}</div><label>Documented equality rule<select><option>At or above threshold is ACTIVE</option><option>Above threshold is ACTIVE</option><option>Use project-specific rule</option></select></label></div><div className="w8-boundary-visual"><div className="w8-boundary-readout"><span>PLANNED INPUT</span><strong>{value}</strong><b>{offset < 0 ? 'BELOW' : offset > 0 ? 'ABOVE' : 'EQUAL'}</b></div><div className="w8-boundary-track"><i className="w8-boundary-band"/><i className="w8-boundary-marker" style={{ left: `${position}%` }}/><i className="w8-boundary-threshold" style={{ left: `${(threshold / 1023) * 100}%` }}/><span>0</span><span>THRESHOLD {threshold}</span><span>1023</span></div><small>Repeat and record the actual observed state for all three points.</small></div></div></div>;
}

function FaultPlanner() {
  const [fault, setFault] = useState('Invalid sensor value');
  const cases: Record<string, [string, string]> = {
    'Invalid sensor value': ['Use an approved simulator value outside the plausible range.', 'Expected: fault visible; unsafe automatic request inhibited.'],
    'Disconnected sensor (simulation)': ['Represent disconnection in simulation or a tutor-approved safe setup only.', 'Expected: stale/missing input identified and safe response shown.'],
    'Communication unavailable': ['Use a planned tabletop or simulator scenario; do not unplug live wiring without approval.', 'Expected: stale data identified; local fallback or safe hold follows the design.'],
  };
  return <div className="w8-tool"><Heading slide={11} eyebrow="INVALID INPUT / LOW-RISK APPROVED CASE" title="Plan a fault case without creating a physical fault." subtitle="Use only tutor-approved simulation or a specifically approved safe setup. Never short, overload, reverse-power, or stress hardware." tone="coral"/><div className="w8-fault-layout"><div className="w8-controls"><label>Fault condition<select value={fault} onChange={(event) => setFault(event.target.value)}>{Object.keys(cases).map((item) => <option key={item}>{item}</option>)}</select></label><div className="w8-fault-example"><AlertTriangle size={22}/><div><b>SAFE TEST METHOD</b><p>{cases[fault][0]}</p></div></div></div><div className="w8-fault-response"><span>EXPECTED RESPONSE TO VERIFY</span><strong>{cases[fault][1].replace('Expected: ', '')}</strong><div className="w8-response-flow"><i>DETECT</i><ArrowRight size={15}/><i>INDICATE</i><ArrowRight size={15}/><i>SAFE RESPONSE</i></div><small>Record actual observed behavior separately from this plan.</small></div></div></div>;
}

function ModeTest() {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL/TEST'>('AUTO');
  const [request, setRequest] = useState(false);
  const [fault, setFault] = useState(false);
  const state = fault ? 'FAULT / SAFE HOLD' : mode === 'AUTO' ? 'AUTOMATIC RULE' : request ? 'MANUAL REQUEST' : 'NO MANUAL REQUEST';
  return <div className="w8-tool"><Heading slide={12} eyebrow="MODE COVERAGE / DISTINGUISH THE PATHS" title="Test manual behavior without confusing it with auto." subtitle="This is a logic-planning model. Confirm mode indication, priority, and exit behavior in the project's approved test."/><div className="w8-mode-layout"><div className="w8-controls"><div className="segmented-control"><button className={mode === 'AUTO' ? 'is-active' : ''} onClick={() => setMode('AUTO')}>AUTO</button><button className={mode === 'MANUAL/TEST' ? 'is-active' : ''} onClick={() => setMode('MANUAL/TEST')}>MANUAL / TEST</button></div><label className="w8-check"><input type="checkbox" checked={request} onChange={(event) => setRequest(event.target.checked)}/> Request manual output</label><label className="w8-check"><input type="checkbox" checked={fault} onChange={(event) => setFault(event.target.checked)}/> Invalid input condition</label></div><div className={`w8-mode-state ${fault ? 'is-fault' : ''}`}><span>PLANNED LOGIC STATE</span><strong>{state}</strong><svg viewBox="0 0 500 110" role="img" aria-labelledby="mode-title"><title id="mode-title">Mode and fault priority diagram</title><rect x="10" y="26" width="130" height="56" rx="4"/><rect x="185" y="26" width="130" height="56" rx="4"/><rect x="360" y="26" width="130" height="56" rx="4"/><path d="M140 54h44M315 54h44"/><text x="75" y="59" textAnchor="middle">MODE</text><text x="250" y="59" textAnchor="middle">VALIDATE</text><text x="425" y="59" textAnchor="middle">OUTPUT STATE</text></svg><p>Document startup, switching, and priority when a fault occurs.</p></div></div></div>;
}

function ResetTest() {
  const [step, setStep] = useState(0);
  const sequence = [
    ['BEFORE RESET', 'Record active mode and output state.'],
    ['RESET EVENT', 'Start from the designed initialization behavior.'],
    ['CHECK INPUT', 'Validate data freshness and configuration.'],
    ['RESUME / HOLD', 'Resume only when the agreed condition is met.'],
  ];
  return <div className="w8-tool"><Heading slide={13} eyebrow="RESET + POWER RESTART / TEST BOTH PATHS" title="A reset is a state transition, not just a reboot." subtitle="Walk the approved test sequence and check that outputs return to a known condition. No power is controlled by this activity." tone="blue"/><div className="w8-reset-layout"><div className="w8-reset-steps">{sequence.map(([title, detail], index) => <button key={title} className={index === step ? 'is-active' : index < step ? 'is-done' : ''} onClick={() => setStep(index)}><span>0{index + 1}</span><b>{title}</b><small>{detail}</small></button>)}</div><div className="w8-reset-visual"><TimerReset size={27}/><span>TABLETOP SEQUENCE</span><strong>{sequence[step][0]}</strong><p>{sequence[step][1]}</p><div className="w8-step-controls"><button onClick={() => setStep((value) => (value + sequence.length - 1) % sequence.length)}><ArrowLeft size={15}/> PREVIOUS</button><button onClick={() => setStep((value) => (value + 1) % sequence.length)}>NEXT <ArrowRight size={15}/></button></div></div></div><p className="w8-subtle">Repeat for startup reset and power restart; record the actual trigger and observed recovery separately.</p></div>;
}

function RecoveryFlow() {
  const [condition, setCondition] = useState('Sensor invalid');
  const [safeState, setSafeState] = useState('Hold automatic output; show fault status');
  const [recovery, setRecovery] = useState('Valid input + explicit restart check');
  const conditions = ['Sensor invalid', 'Reset during operation', 'Power restored'];
  return <div className="w8-tool"><Heading slide={14} eyebrow="SAFE RECOVERY / DEFINE BEFORE TEST" title="Show how the system gets back to a known state." subtitle="Safe behavior is project-specific. Confirm the transition and restart condition against the agreed requirement and tutor guidance." tone="coral"/><div className="w8-recovery-layout"><div className="w8-controls"><label>Trigger<select value={condition} onChange={(event) => setCondition(event.target.value)}>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Safe state<textarea rows={2} value={safeState} onChange={(event) => setSafeState(event.target.value)}/></label><label>Recovery condition<textarea rows={2} value={recovery} onChange={(event) => setRecovery(event.target.value)}/></label></div><div className="w8-recovery-diagram"><span>STATE TRANSITION / PLANNING VIEW</span><svg viewBox="0 0 560 220" role="img" aria-labelledby="recovery-title recovery-desc"><title id="recovery-title">Fault to safe state to recovery</title><desc id="recovery-desc">A detected condition moves the controller to a defined safe state, then recovery requires a stated condition.</desc><defs><marker id="recovery-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z"/></marker></defs><rect className="w8-state-node w8-state-node--event" x="8" y="76" width="145" height="72" rx="5"/><rect className="w8-state-node w8-state-node--safe" x="207" y="76" width="145" height="72" rx="5"/><rect className="w8-state-node w8-state-node--recover" x="406" y="76" width="145" height="72" rx="5"/><path className="w8-state-arrow" d="M153 112h49" markerEnd="url(#recovery-arrow)"/><path className="w8-state-arrow" d="M352 112h49" markerEnd="url(#recovery-arrow)"/><text x="80" y="104" textAnchor="middle">{condition.toUpperCase()}</text><text x="80" y="126" textAnchor="middle">DETECT</text><text x="279" y="104" textAnchor="middle">SAFE STATE</text><text x="279" y="126" textAnchor="middle">{safeState.length > 18 ? `${safeState.slice(0, 17)}…` : safeState.toUpperCase()}</text><text x="478" y="104" textAnchor="middle">RECOVERY</text><text x="478" y="126" textAnchor="middle">CHECK CONDITION</text></svg><div className="w8-recovery-summary"><b>RESTART WHEN</b><p>{recovery || 'No recovery condition defined.'}</p></div></div></div></div>;
}

function CoverageReview() {
  const [covered, setCovered] = useState<Record<string, boolean>>({});
  const count = coverageCases.filter((item) => covered[item]).length;
  return <div className="w8-tool"><Heading slide={15} eyebrow="COVERAGE REVIEW / REQUIRED CONDITIONS" title="Do not stop at the cases that are easiest to run." subtitle="Use this checklist to find gaps across the complete requirement set and the required fault/restart scenarios."/><div className="w8-coverage-review"><div className="w8-coverage-review-list">{coverageCases.map((item, index) => <label key={item} className={covered[item] ? 'is-covered' : ''}><input type="checkbox" checked={covered[item] ?? false} onChange={(event) => setCovered((current) => ({ ...current, [item]: event.target.checked }))}/><span>0{index + 1}</span><b>{item}</b><small>{covered[item] ? 'TEST LINK RECORDED' : 'GAP TO REVIEW'}</small></label>)}</div><aside className="w8-coverage-meter"><span>CONDITION COVERAGE</span><strong>{count}<i>/ {coverageCases.length}</i></strong><div className="w8-meter-track"><i style={{ width: `${(count / coverageCases.length) * 100}%` }}/></div><p>{count === coverageCases.length ? 'Every category has a recorded test link. Confirm each result and evidence reference.' : 'Unmarked conditions need a test case or a documented reason they do not apply.'}</p></aside></div></div>;
}

function MeasurementRecord() {
  const [instrument, setInstrument] = useState('Serial monitor');
  const [setup, setSetup] = useState('');
  const [units, setUnits] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [readings, setReadings] = useState(['', '', '']);
  const numeric = readings.map(Number).filter((value, index) => readings[index].trim() !== '' && Number.isFinite(value));
  const mean = numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
  const range = numeric.length ? Math.max(...numeric) - Math.min(...numeric) : null;
  return <div className="w8-tool"><Heading slide={16} eyebrow="REPEATABILITY / CONDITIONS + UNITS" title="Keep enough context to interpret the number." subtitle="Record instrument/source, setup, units, stated accuracy or resolution, and repeat readings. Do not imply more precision than the instrument supports." tone="blue"/><div className="w8-measure-layout"><div className="w8-controls"><label>Instrument/source<select value={instrument} onChange={(event) => setInstrument(event.target.value)}><option>Serial monitor</option><option>Digital multimeter</option><option>Oscilloscope (tutor-supervised)</option><option>Other tutor-approved source</option></select></label><label>Setup and conditions<textarea rows={2} value={setup} onChange={(event) => setSetup(event.target.value)} placeholder="Board version, test point, supply, environment"/></label><div className="w8-two-fields"><label>Units<input value={units} onChange={(event) => setUnits(event.target.value)} placeholder="V, counts, ms"/></label><label>Accuracy / resolution<input value={accuracy} onChange={(event) => setAccuracy(event.target.value)} placeholder="Instrument spec or N/A"/></label></div><div className="w8-reading-inputs">{readings.map((reading, index) => <label key={index}>READING 0{index + 1}<input type="number" value={reading} onChange={(event) => setReadings((current) => current.map((item, i) => i === index ? event.target.value : item))}/></label>)}</div></div><aside className="w8-measure-summary"><Activity size={26}/><span>LEARNER-ENTERED READINGS</span><strong>{mean === null ? 'NO DATA YET' : `${mean.toFixed(2)} ${units}`}</strong><div><i>N = {numeric.length}</i><i>RANGE = {range === null ? '—' : `${range} ${units}`}</i></div><p>Source: {instrument}. Setup: {setup || 'not entered'}.</p><small>Summary only; check suitable rounding and uncertainty before reporting.</small></aside></div></div>;
}

function SignalTrace() {
  const [threshold, setThreshold] = useState(520);
  const [profile, setProfile] = useState('Normal rise');
  const profiles: Record<string, number[]> = {
    'Normal rise': [250, 280, 310, 340, 390, 430, 470, 510, 555, 590, 615, 630],
    'Noisy edge': [320, 390, 350, 425, 405, 470, 450, 545, 505, 570, 525, 590],
    'Invalid sample': [280, 310, 340, 380, 420, 1200, 460, 500, 530, 560, 590, 620],
  };
  const values = profiles[profile];
  const x = (index: number) => 52 + (index * 440) / (values.length - 1);
  const y = (value: number) => 206 - (clamp(value, 0, 1023) / 1023) * 160;
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const thresholdY = y(threshold);
  return <div className="w8-tool"><Heading slide={17} eyebrow="SIGNAL TRACE / ILLUSTRATIVE SIMULATION" title="Look for boundaries, noise, and invalid samples." subtitle="This selectable trace is synthetic teaching data, not a sensor measurement. Use your own labelled data only with consent." tone="blue"/><div className="w8-trace-layout"><div className="w8-trace-controls"><label>Illustrative profile<select value={profile} onChange={(event) => setProfile(event.target.value)}>{Object.keys(profiles).map((item) => <option key={item}>{item}</option>)}</select></label><label>Threshold <b>{threshold} counts</b><input type="range" min="200" max="800" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))}/></label><div className="w8-trace-legend"><span><i className="w8-legend-signal"/> SIMULATED INPUT</span><span><i className="w8-legend-limit"/> THRESHOLD</span></div><p className="w8-subtle">Describe the sample condition, units, and expected crossing before comparing with observed results.</p></div><figure className="w8-chart"><svg viewBox="0 0 540 250" role="img" aria-labelledby="trace-title trace-desc"><title id="trace-title">Simulated input trace with threshold</title><desc id="trace-desc">Synthetic sensor values over sample number. The horizontal line is the adjustable threshold; values above it are highlighted.</desc><rect className="w8-chart-bg" x="45" y="28" width="455" height="178" rx="3"/><path className="w8-chart-grid" d="M45 73H500M45 118H500M45 162H500M155 28V206M265 28V206M375 28V206"/><path className="w8-threshold-line" d={`M45 ${thresholdY}H500`}/><polyline className="w8-signal-line" points={points}/>{values.map((value, index) => <circle key={index} className={value > 1023 ? 'w8-signal-point is-invalid' : value >= threshold ? 'w8-signal-point is-above' : 'w8-signal-point'} cx={x(index)} cy={y(value)} r="4"/>)}<text className="w8-axis-label" x="45" y="224">SAMPLE 01</text><text className="w8-axis-label" x="500" y="224" textAnchor="end">SAMPLE 12</text><text className="w8-axis-label" x="46" y="20">ADC COUNTS / SIMULATED</text><text className="w8-axis-label" x="499" y={Math.max(20, thresholdY - 5)} textAnchor="end">T = {threshold}</text></svg><figcaption>SIMULATED EXAMPLE / NOT MEASURED HARDWARE DATA</figcaption></figure></div></div>;
}

function ResultsLog() {
  const [rows, setRows] = useState([
    { id: 'TC-01', requirement: 'FR-01 / Normal input', observed: '', evidence: '', result: 'Not run' },
    { id: 'TC-02', requirement: 'FR-02 / Threshold boundary', observed: '', evidence: '', result: 'Not run' },
    { id: 'TC-03', requirement: 'FR-03 / Manual mode', observed: '', evidence: '', result: 'Not run' },
    { id: 'TC-04', requirement: 'FR-04 / Invalid input', observed: '', evidence: '', result: 'Not run' },
  ]);
  const update = (index: number, field: 'observed' | 'evidence', value: string) => setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const mark = (index: number, result: 'Pass' | 'Fail') => setRows((current) => current.map((row, i) => i === index ? { ...row, result } : row));
  return <div className="w8-tool"><Heading slide={18} eyebrow="TEST RESULTS / ACTUAL OBSERVATIONS ONLY" title="Keep the observed result beside its evidence." subtitle="Record only after a test. Pass/fail remains disabled until an observed result and evidence reference are entered." tone="blue"/><div className="w8-results-list">{rows.map((row, index) => <article key={row.id}><div className="w8-result-title"><span>{row.id}</span><b>{row.requirement}</b></div><input aria-label={`${row.id} observed result`} value={row.observed} onChange={(event) => update(index, 'observed', event.target.value)} placeholder="Observed result"/><input aria-label={`${row.id} evidence reference`} value={row.evidence} onChange={(event) => update(index, 'evidence', event.target.value)} placeholder="Evidence reference"/><div className="w8-result-buttons"><button disabled={!row.observed.trim() || !row.evidence.trim()} onClick={() => mark(index, 'Pass')}>PASS</button><button disabled={!row.observed.trim() || !row.evidence.trim()} onClick={() => mark(index, 'Fail')}>FAIL</button><strong className={`w8-result-status is-${row.result.toLowerCase().replace(' ', '-')}`}>{row.result}</strong></div></article>)}</div></div>;
}

function ExecutionBoard() {
  const [phase, setPhase] = useState('Subsystem');
  const phases: Record<string, string[]> = {
    Subsystem: ['Known-good board and version recorded', 'Each required input checked independently', 'Each output/status path checked independently', 'Expected and observed states recorded'],
    Integration: ['Reviewed subsystems connected under tutor procedure', 'Signal direction and state transitions checked', 'Normal end-to-end sequence recorded', 'Test evidence linked to requirement IDs'],
    Recovery: ['Tutor-approved reset/restart case selected', 'Safe state and indication observed', 'Recovery condition checked', 'Corrective action and retest captured if needed'],
  };
  const [done, setDone] = useState<Record<string, boolean>>({});
  const items = phases[phase];
  const complete = items.filter((item) => done[`${phase}:${item}`]).length;
  return <div className="w8-tool"><Heading slide={19} eyebrow="SUPERVISED TEST SESSION / 04:00" title="Work from subsystems through recovery." subtitle="Use your tutor-approved test plan. These controls track work; they do not execute tests or certify the setup."/><div className="w8-execution"><div className="segmented-control">{Object.keys(phases).map((item) => <button className={phase === item ? 'is-active' : ''} key={item} onClick={() => { setPhase(item); setDone({}); }}>{item.toUpperCase()}</button>)}</div><div className="w8-execution-layout"><div className="w8-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={done[`${phase}:${item}`] ?? false} onChange={(event) => setDone((current) => ({ ...current, [`${phase}:${item}`]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w8-execution-status"><Wrench size={27}/><span>{phase.toUpperCase()} CHECKPOINT</span><strong>{complete} / {items.length}</strong><div className="w8-meter-track"><i style={{ width: `${(complete / items.length) * 100}%` }}/></div><p>Stop and ask for review if actual behavior differs from the agreed safe state.</p></aside></div></div></div>;
}

function DebugFlow() {
  const steps = [
    ['REPRODUCE', 'Keep the original setup, version, and symptom.'],
    ['ISOLATE', 'Choose one subsystem or signal path to inspect.'],
    ['HYPOTHESIZE', 'State one cause and the evidence that supports it.'],
    ['CHANGE ONE THING', 'Use power isolation and tutor procedure for physical changes.'],
    ['RETEST', 'Repeat the same steps; compare expected and observed.'],
  ];
  const [active, setActive] = useState(0);
  return <div className="w8-tool"><Heading slide={20} eyebrow="DEBUGGING / EVIDENCE BEFORE GUESSING" title="Change one thing, then repeat the same test." subtitle="Debugging is a controlled investigation. Keep the original symptom and do not erase a failed result." tone="blue"/><div className="w8-debug-timeline">{steps.map(([title, detail], index) => <button key={title} className={active === index ? 'is-active' : index < active ? 'is-done' : ''} onClick={() => setActive(index)}><span>0{index + 1}</span><b>{title}</b><small>{detail}</small></button>)}</div><div className="w8-debug-current"><GitBranch size={21}/><p><b>Current step:</b> {steps[active][0]} — {steps[active][1]}</p></div><p className="w8-callout"><AlertTriangle size={16}/> A changed design needs a new version and an explicit retest record.</p></div>;
}

function RegressionPlan() {
  const [change, setChange] = useState('Threshold value changed');
  const impacted = change === 'Threshold value changed' ? ['FR-02 / below, equal, above boundary', 'FR-01 / displayed reading and units', 'FR-04 / invalid input stays safe'] : change === 'Sensor wiring changed' ? ['FR-01 / sensor range and units', 'FR-02 / threshold boundary', 'FR-04 / invalid/disconnected simulation'] : ['FR-03 / manual vs automatic mode', 'FR-02 / automatic rule still correct', 'Startup / reset / recovery state'];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return <div className="w8-tool"><Heading slide={22} eyebrow="REGRESSION / RETEST WHAT THE CHANGE COULD AFFECT" title="A small change can invalidate related results." subtitle="Select the change type, identify impacted tests, and rerun them before claiming the rest of the system is unchanged."/><div className="w8-regression-layout"><div className="w8-controls"><label>Change type<select value={change} onChange={(event) => { setChange(event.target.value); setChecked({}); }}><option>Threshold value changed</option><option>Sensor wiring changed</option><option>Mode logic changed</option></select></label><div className="w8-change-path"><span>CHANGE</span><ArrowRight size={15}/><span>IMPACTED REQUIREMENTS</span><ArrowRight size={15}/><span>RETEST</span></div></div><div className="w8-regression-list">{impacted.map((item) => <label key={item}><input type="checkbox" checked={checked[item] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span><small>{checked[item] ? 'RETEST RECORDED' : 'RETEST NEEDED'}</small></label>)}</div></div></div>;
}

function PeerRepro() {
  const [setup, setSetup] = useState(false);
  const [input, setInput] = useState(false);
  const [expected, setExpected] = useState(false);
  const [evidence, setEvidence] = useState(false);
  const count = [setup, input, expected, evidence].filter(Boolean).length;
  return <div className="w8-tool"><Heading slide={23} eyebrow="TEAM TEST REVIEW / CAN ANOTHER PERSON REPEAT IT?" title="Let a peer try the test without filling in missing steps." subtitle="The reviewer checks clarity and traceability, not just whether the author knows what they intended."/><div className="w8-peer-layout"><div className="w8-peer-checks">{[[setup, setSetup, 'Setup and version are stated'], [input, setInput, 'Input condition and procedure are exact'], [expected, setExpected, 'Expected result and limit are clear'], [evidence, setEvidence, 'Observed result and evidence link are present']].map(([value, setter, label]) => <label key={label as string}><input type="checkbox" checked={value as boolean} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)}/><span>{label as string}</span></label>)}</div><aside className="w8-peer-card"><Users size={26}/><span>REPRODUCIBILITY CHECK</span><strong>{count} / 4</strong><p>{count === 4 ? 'Ask a peer to follow the steps and decide pass/fail using only the record.' : 'Name what the reviewer would still need before running or deciding.'}</p><small>Tutor samples one test from each team.</small></aside></div></div>;
}

function Limitations() {
  const [source, setSource] = useState('Measured hardware');
  const [sample, setSample] = useState('');
  const [conditions, setConditions] = useState('');
  const [limit, setLimit] = useState('');
  const note = source === 'Simulated example' ? 'SIMULATED DATA: do not report as measured hardware.' : source === 'Code inspection' ? 'CODE REVIEW: explains implementation, not observed runtime behavior.' : 'MEASURED HARDWARE: include setup, instrument, units, and limits.';
  return <div className="w8-tool"><Heading slide={24} eyebrow="EVIDENCE LIMITATIONS / SAY WHAT IT PROVES" title="Separate observation, inference, and future work." subtitle="A test result supports a claim only under its recorded conditions and sample size." tone="blue"/><div className="w8-limitations-layout"><div className="w8-controls"><label>Evidence source<select value={source} onChange={(event) => setSource(event.target.value)}><option>Measured hardware</option><option>Simulated example</option><option>Code inspection</option><option>Recorded demonstration</option></select></label><label>Sample size / repeats<input value={sample} onChange={(event) => setSample(event.target.value)} placeholder="n = ? or one run"/></label><label>Conditions that matter<textarea rows={2} value={conditions} onChange={(event) => setConditions(event.target.value)} placeholder="Supply, sensor, version, range, environment"/></label><label>What remains unproven<textarea rows={2} value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="State a limitation or not yet tested condition"/></label></div><div className="w8-source-card"><span>EVIDENCE TYPE</span><strong>{source.toUpperCase()}</strong><p>{note}</p><div><b>{sample || 'n not stated'}</b><i>REPEATS</i></div><small>Conditions: {conditions || 'not entered'}</small><small>Limitation: {limit || 'not entered'}</small></div></div></div>;
}

function OperatorGuide() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const sections = ['Safe startup and pre-use checks', 'Normal operation and indicators', 'Manual/test mode boundaries', 'Fault indication and operator response', 'Safe shutdown and restart condition', 'Who to contact and what not to do'];
  const count = Object.values(checks).filter(Boolean).length;
  return <div className="w8-tool"><Heading slide={25} eyebrow="A002 TASK 2.2 / OPERATOR GUIDE" title="Write for the person who was not in your lab." subtitle="The draft guide should support safe startup, normal operation, test mode, fault response, and shutdown without the author present."/><div className="w8-guide-layout"><div className="w8-guide-steps">{sections.map((section, index) => <label key={section}><span>0{index + 1}</span><input type="checkbox" checked={checks[section] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [section]: event.target.checked }))}/><b>{section}</b></label>)}</div><aside className="w8-guide-card"><BookOpen size={26}/><span>GUIDE STRUCTURE</span><strong>{count} / {sections.length}</strong><div className="w8-guide-route"><i>START</i><ArrowRight size={14}/><i>OPERATE</i><ArrowRight size={14}/><i>FAULT</i><ArrowRight size={14}/><i>STOP</i></div><p>Use plain language, actual indicators, prohibited actions, and the agreed tutor-approved procedure.</p></aside></div></div>;
}

function EvidenceClinic() {
  const [items, setItems] = useState<Record<string, boolean>>({});
  const checklist = ['Every functional requirement is covered or has a reasoned gap', 'Boundary, invalid, manual, reset, restart, and recovery cases are included', 'Expected results and acceptance limits were set before testing', 'Observed outcomes have setup, units, and evidence references', 'Failures have corrective action and retest records', 'Affected regression tests are repeated after changes', 'Operator guide covers normal use, faults, and safe shutdown'];
  const count = Object.values(items).filter(Boolean).length;
  return <div className="w8-tool"><Heading slide={26} eyebrow="A002 TASK 2.2 / EVIDENCE CLINIC" title="Leave with a complete test pack or owned gaps." subtitle="For each missing item, assign a person, next step, and due date. Do not mark planned tests as complete evidence." tone="blue"/><div className="w8-clinic-layout"><div className="w8-checklist">{checklist.map((item) => <label key={item}><input type="checkbox" checked={items[item] ?? false} onChange={(event) => setItems((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w8-clinic-card"><FileText size={27}/><span>TEST-PACK STATUS</span><strong>{count} / {checklist.length}</strong><p>{count === checklist.length ? "Every clinic prompt is checked. Confirm that each item points to the team's actual files and results." : 'Assign every unchecked prompt to an owner and date.'}</p><small>Keep simulation, measured data, and code-review evidence distinctly labelled.</small></aside></div></div>;
}

function ExitTicket() {
  const questions = [
    { prompt: 'What makes a pass/fail decision reproducible?', options: ['A stated expected limit and observed result', 'A screenshot only', 'A code comment'], answer: 0 },
    { prompt: 'What should happen after a relevant code change?', options: ['Rerun impacted tests and regression checks', 'Keep all old passes automatically', 'Delete the failing result'], answer: 0 },
    { prompt: 'How should synthetic chart data be reported?', options: ['Label it simulated', 'Call it a measurement', 'Remove its source label'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={27} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Test the behavior.<br/><span className="text-blue">Keep the evidence.</span></>} subtitle="Check the test-engineering ideas and name one A002 gap to close." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>ONE A002 TEST / EVIDENCE GAP</span><textarea rows={2} placeholder="What remains to test, who owns it, and by when?"/></label></div></div>;
}

export default App;
