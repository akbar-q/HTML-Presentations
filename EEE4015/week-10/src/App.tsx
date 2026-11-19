import { useEffect, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check,
  ClipboardCheck, Cpu, Download, Expand, FileText,
  Pause, Play, RotateCcw, ShieldCheck, Sparkles, Target,
  Users,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const DRAFT_PREFIX = 'eee4015-week10-draft-';
const slideNames = [
  'Start here', 'The session route', 'The course as one engineering story', 'Check the five learning outcomes',
  'Evidence types and boundaries', 'Choose the narrative spine', 'Open with context and requirements',
  'Explain architecture and decisions', 'Show the implementation and interfaces', 'Demonstrate the test evidence',
  'Explain security and safe states', 'Evaluate results and limitations', 'Plan a coherent demonstration',
  'Build the run-of-show', 'Practise the individual question', 'Plan the safe fallback',
  'Structure peer questions and feedback', 'Show collaboration in the evidence', 'Check sources, figures, and references',
  'Portfolio map: LO1 and LO2', 'Portfolio map: LO3 security', 'Portfolio map: LO4 contribution',
  'Portfolio map: LO5 reflection', 'Write one next CPD action', 'Check the whole portfolio for consistency',
  'Draft the final presentation outline', 'Export the final review notes', 'I/O basics and PWM', 'Exit ticket',
];
const slideDurations = [5, 5, 10, 10, 15, 15, ...Array(12).fill(18), 12, 12, 15, 15, 15, 15, 15, 10, 10, 5, 5];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'SYNTHESIS', index: 2 },
  { name: 'DEMONSTRATE', index: 6 }, { name: 'PORTFOLIO', index: 18 },
  { name: 'REFLECT', index: 22 }, { name: 'FINAL REVIEW', index: 25 },
];
const outcomes = [
  { id: 'LO1', name: 'Integrated systems approach', prompt: 'Can you connect requirements, architecture, signal/power paths, decisions, and trade-offs?', evidence: 'Context/requirements, system map, pin allocation, algorithm/state model, design rationale.' },
  { id: 'LO2', name: 'Practical investigation', prompt: 'Can another person follow your build and decide whether the test passed?', evidence: 'Simulation labelled as such; physical build/measurement where required; test results, debug, and retest.' },
  { id: 'LO3', name: 'Security and resilience', prompt: 'Which realistic risk remains after your proportionate control?', evidence: 'Assets, risk ratings, controls, safe states, fault response, residual risk, limitations.' },
  { id: 'LO4', name: 'Individual and team contribution', prompt: 'What did you personally contribute, and how did the team coordinate?', evidence: 'Roles, decisions, peer review, handovers, dated individual contribution.' },
  { id: 'LO5', name: 'Self-learning and CPD', prompt: 'What feedback or skill gap changed your next learning action?', evidence: 'Dated logbook, feedback response, skills reflection, SMART CPD action.' },
];
const demonstrationRequirementIds = ['FR-01', 'FR-02', 'FR-03', 'FR-04'];
const lifecycle = [
  ['NEED', 'User, context, boundary, and measurable requirements.', 'LO1 / A001 Task 1.1'],
  ['DESIGN', 'Controller, interfaces, pin map, algorithm, and trade-offs.', 'LO1 / A001 Task 1.2'],
  ['BUILD', 'Simulation plus supervised physical contribution, clearly distinguished.', 'LO2 / A001 Task 1.3'],
  ['TEST', 'Expected vs observed, faults, debugging, retest, and traceability.', 'LO2 / A002 Task 2.2'],
  ['SECURE + REFINE', 'Risks, controls, safe states, change record, and regression tests.', 'LO3 / A002 Tasks 2.1–2.2'],
  ['EVALUATE', 'Results, limitations, teamwork, individual reflection, and CPD.', 'LO4–LO5 / A002 Task 2.3'],
];
const demoQuestions = [
  'Which requirement is your weakest, and what evidence supports that judgement?',
  'Show one test that changed a design decision. What was expected and observed?',
  'What does your prototype not prove, even if the demonstration succeeds?',
  'How does the system respond to an invalid input or reset?',
  'What is one residual risk and what control evidence do you have?',
  'What did you personally do, and where can a reviewer verify it?',
  'Which refinement did you make, and which regression tests did you repeat?',
  'What would be your safe fallback if the live component fails?',
  'What feedback did you act on, and how did it change your work?',
  'What is your next CPD action and how will you measure progress?',
];
const portfolioItems = [
  ['LO1', 'Requirements, context, system map, and justified design choices'],
  ['LO1', 'Pin allocation, algorithm/state model, and relevant sources'],
  ['LO2', 'Build record, code/version, measurements, and labelled evidence sources'],
  ['LO2', 'Test plan/results, debug and retest, with known limitations'],
  ['LO3', 'Asset/threat record, controls, safe states, and residual-risk evaluation'],
  ['LO4', 'Roles, decisions, handovers, peer review, and individual contribution'],
  ['LO5', 'Dated logbook, feedback response, reflection, and SMART CPD action'],
  ['A002', 'Operator guide, demonstration plan, safe fallback, and references'],
] as const;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }
function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week10-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

function useDraftValue(key: string, initial = ''): [string, Dispatch<SetStateAction<string>>] {
  const storageKey = `${DRAFT_PREFIX}${key}`;
  const [dirty, setDirty] = useState(false);
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(storageKey) ?? initial; } catch { return initial; }
  });
  const setDraftValue: Dispatch<SetStateAction<string>> = (nextValue) => { setDirty(true); setValue(nextValue); };
  useEffect(() => {
    if (!dirty) return;
    try { if (value) window.localStorage.setItem(storageKey, value); else window.localStorage.removeItem(storageKey); } catch { /* Local draft storage may be unavailable in private browsing. */ }
  }, [dirty, storageKey, value]);
  return [value, setDraftValue];
}

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
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName))) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); setSlide((value) => Math.min(slideNames.length - 1, value + 1)); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); setSlide((value) => Math.max(0, value - 1)); }
      if (event.key === 'Home') setSlide(0);
      if (event.key === 'End') setSlide(slideNames.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { document.title = `EEE4015 / Week 10 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; window.scrollTo({ top: 0, behavior: 'auto' }); }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 10</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsedAt(slide))}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsedAt(slide))} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week10-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(1)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <LifecycleMap/>;
    case 3: return <OutcomeMap/>;
    case 4: return <EvidenceTypes/>;
    case 5: return <SystemNarrative/>;
    case 6: return <NarrativeBuilder/>;
    case 7: return <DesignStory/>;
    case 8: return <BuildStory/>;
    case 9: return <TestStory/>;
    case 10: return <SecurityStory/>;
    case 11: return <JudgementStory/>;
    case 12: return <DemoPlan/>;
    case 13: return <RunOfShow/>;
    case 14: return <IndividualQuestions/>;
    case 15: return <SafeFallback/>;
    case 16: return <PeerQuestions/>;
    case 17: return <FeedbackNotes/>;
    case 18: return <SourceCheck/>;
    case 19: return <PortfolioMap outcome="LO1 + LO2"/>;
    case 20: return <PortfolioMap outcome="LO3"/>;
    case 21: return <ContributionMap/>;
    case 22: return <ReflectionDraft/>;
    case 23: return <CpdDraft/>;
    case 24: return <CoherenceReview/>;
    case 25: return <PresentationOutline/>;
    case 26: return <FinalExport/>;
    case 27: return <FundamentalsRefresher/>;
    case 28: return <ExitTicket/>;
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w10-welcome"><div className="w10-welcome__copy"><Eyebrow>FIELD NOTES / 10</Eyebrow><h1 id="week10-title-0">One system.<br/><span>Five outcomes.</span></h1><p>Tell a clear engineering story, demonstrate it safely, and defend what your evidence does and does not prove.</p><div className="w10-meta"><span><b>29</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>LO1–LO5</b> CAPSTONE</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w10-hero"><svg viewBox="0 0 650 350" role="img" aria-labelledby="w10-hero-title w10-hero-desc"><title id="w10-hero-title">Course lifecycle from need to continuing development</title><desc id="w10-hero-desc">Six stages link the user need, design, build, test, secure refinement, and evaluation, with a feedback loop.</desc><path className="w10-lifecycle-line" d="M76 175 H570"/><path className="w10-lifecycle-return" d="M570 205 C500 310 150 310 76 205"/><g className="w10-node w10-node--1"><circle cx="76" cy="175" r="30"/><text x="76" y="179" textAnchor="middle">NEED</text></g><g className="w10-node w10-node--2"><circle cx="174" cy="175" r="30"/><text x="174" y="179" textAnchor="middle">DESIGN</text></g><g className="w10-node w10-node--3"><circle cx="272" cy="175" r="30"/><text x="272" y="179" textAnchor="middle">BUILD</text></g><g className="w10-node w10-node--4"><circle cx="370" cy="175" r="30"/><text x="370" y="179" textAnchor="middle">TEST</text></g><g className="w10-node w10-node--5"><circle cx="468" cy="175" r="30"/><text x="468" y="179" textAnchor="middle">REFINE</text></g><g className="w10-node w10-node--6"><circle cx="566" cy="175" r="30"/><text x="566" y="179" textAnchor="middle">EVALUATE</text></g><text className="w10-hero-label" x="323" y="54" textAnchor="middle">REQUIREMENT → EVIDENCE → JUDGEMENT</text><text className="w10-hero-return-label" x="323" y="318" textAnchor="middle">LEARN • IMPROVE • CONTINUE</text></svg><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 CAPSTONE POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Demonstrate one traceable result</div><div><Check size={16}/> Defend one limitation and control</div><div><Check size={16}/> Name an individual next step</div></div></div>;
}

function Agenda() {
  const phases = [
    ['00:00–01:00', 'Synthesis', 'Connect the system lifecycle to LO1–LO5 and label evidence types.'],
    ['01:00–05:00', 'Team demonstrations', 'Show agreed tests or clearly labelled recorded evidence; answer individual questions.'],
    ['05:00–06:45', 'Portfolio + reflection', 'Check coherence, peer/tutor feedback, logbook close-out, and CPD action.'],
  ];
  return <div className="w10-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Synthesize. Demonstrate. Reflect." subtitle="The capstone makes the module evidence readable as one engineering story, with every student's contribution visible."/><div className="w10-agenda-flow">{phases.map(([time, title, detail], index) => <article key={title}><span>0{index + 1}</span><b>{time}</b><h2>{title}</h2><p>{detail}</p></article>)}</div><p className="w10-callout"><AlertTriangle size={16}/> Use tutor-approved safe procedures. If a live component fails, stop and use labelled evidence rather than bypassing a fault.</p></div>;
}

type LifecycleStep = { title: string; summary: string; evidence: string; outcome: string };
function LifecycleMap() {
  const [selected, setSelected] = useState(0);
  const steps: LifecycleStep[] = lifecycle.map(([title, summary, evidence, outcome]) => ({ title, summary, evidence, outcome }));
  return <div className="w10-tool"><Heading slide={2} eyebrow="MODULE STORY / SELECT A STAGE" title="The final presentation follows the system lifecycle." subtitle="Select a stage to see its key question, evidence, and learning-outcome connection." tone="blue"/><div className="w10-lifecycle"><div className="w10-lifecycle-nav">{steps.map((step, index) => <button key={step.title} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)}><span>0{index + 1}</span><b>{step.title}</b><i className={index < selected ? 'is-complete' : ''}/></button>)}</div><div className={`w10-lifecycle-detail w10-lifecycle-detail--${selected}`}><span>STAGE {String(selected + 1).padStart(2, '0')} / {steps[selected].outcome}</span><h2>{steps[selected].title}</h2><p>{steps[selected].summary}</p><div><Target size={18}/><b>SHOW</b><span>{steps[selected].evidence}</span></div></div></div></div>;
}

function OutcomeMap() {
  const [selected, setSelected] = useState(0);
  const outcome = outcomes[selected];
  return <div className="w10-tool"><Heading slide={3} eyebrow="LEARNING OUTCOMES / ALL FIVE" title="Make every outcome visible in the final story." subtitle="The outcomes overlap, but each needs identifiable evidence. Select one to review the question and its evidence trail."/><div className="w10-outcome-layout"><div className="w10-outcome-tabs">{outcomes.map((item, index) => <button key={item.id} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)}><span>{item.id}</span><b>{item.name}</b></button>)}</div><aside className="w10-outcome-detail"><span>SELECTED OUTCOME</span><strong>{outcome.id}</strong><h2>{outcome.name}</h2><p>{outcome.prompt}</p><div className="w10-evidence-line"><FileText size={17}/><span>{outcome.evidence}</span></div></aside></div></div>;
}

function EvidenceTypes() {
  const [kind, setKind] = useState('Measured observation');
  const descriptions: Record<string, string> = {
    'Measured observation': 'A value or behavior recorded from the stated hardware setup with instrument/source, units, conditions, and date.',
    'Simulation': 'A model result. Label the simulator and conditions; do not describe it as a physical measurement.',
    'Code/design inspection': 'Shows what the implementation appears to specify. It does not alone prove runtime behavior.',
    'Inference': 'An interpretation derived from evidence. State the reasoning and uncertainty.',
    'Future work': 'A proposal or expected benefit that has not yet been implemented or tested.',
  };
  const types = Object.keys(descriptions);
  return <div className="w10-tool"><Heading slide={4} eyebrow="EVIDENCE INTEGRITY / NAME THE SOURCE" title="A screenshot, measurement, and inference are not interchangeable." subtitle="Choose the evidence type, then label it accurately in slides, reports, captions, and references." tone="blue"/><div className="w10-evidence-layout"><div className="w10-evidence-selector">{types.map((item, index) => <button key={item} className={kind === item ? 'is-active' : ''} onClick={() => setKind(item)}><span>0{index + 1}</span>{item}</button>)}</div><div className={`w10-evidence-card w10-evidence-card--${kind.toLowerCase().replaceAll(' ', '-')}`}><span>EVIDENCE TYPE</span><strong>{kind.toUpperCase()}</strong><p>{descriptions[kind]}</p><small>State what the item proves and what it does not prove.</small></div></div></div>;
}

function SystemNarrative() {
  const [prompt, setPrompt] = useState(0);
  const questions = [
    ['USER + NEED', 'Who uses the cabinet, and what need does it address?'],
    ['SIGNAL + POWER', 'Trace one sensor signal and one output power path.'],
    ['DECISION + STATE', 'How do thresholds, modes, and invalid inputs affect behavior?'],
    ['BOUNDARY', 'What is prototype scope, and what remains outside it?'],
  ];
  return <div className="w10-tool"><Heading slide={5} eyebrow="SYSTEM STORY / SPEAK TO THE DIAGRAM" title="Explain the system without making the audience guess." subtitle="Keep the spoken narrative tied to the same requirements and diagrams used in the portfolio."/><div className="w10-system-layout"><div className="w10-system-diagram"><svg viewBox="0 0 620 280" role="img" aria-labelledby="system-title system-desc"><title id="system-title">Seedling cabinet system story</title><desc id="system-desc">User need connects to sensors, controller and software, output drivers, the cabinet process, and status feedback.</desc><defs><marker id="w10-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z"/></marker></defs><rect className="w10-system-node w10-system-node--user" x="15" y="98" width="100" height="68" rx="5"/><rect className="w10-system-node" x="155" y="38" width="115" height="68" rx="5"/><rect className="w10-system-node w10-system-node--core" x="320" y="98" width="125" height="68" rx="5"/><rect className="w10-system-node w10-system-node--output" x="500" y="38" width="105" height="68" rx="5"/><rect className="w10-system-node" x="500" y="176" width="105" height="68" rx="5"/><path className="w10-system-path" d="M115 120 C132 100 132 72 155 72" markerEnd="url(#w10-arrow)"/><path className="w10-system-path" d="M270 72 C295 72 295 118 320 118" markerEnd="url(#w10-arrow)"/><path className="w10-system-path" d="M445 118 C475 118 475 72 500 72" markerEnd="url(#w10-arrow)"/><path className="w10-system-path" d="M500 210 C470 210 470 150 445 150" markerEnd="url(#w10-arrow)"/><path className="w10-system-feedback" d="M500 210 C382 270 186 230 115 151" markerEnd="url(#w10-arrow)"/><text x="65" y="127" textAnchor="middle">USER / NEED</text><text x="212" y="67" textAnchor="middle">SENSOR INPUT</text><text x="212" y="87" textAnchor="middle">condition → signal</text><text x="382" y="127" textAnchor="middle">CONTROLLER</text><text x="382" y="147" textAnchor="middle">validate → decide</text><text x="552" y="67" textAnchor="middle">DRIVER / LOAD</text><text x="552" y="87" textAnchor="middle">safe output</text><text x="552" y="203" textAnchor="middle">STATUS</text><text x="552" y="223" textAnchor="middle">user feedback</text></svg><span>SYSTEM MAP / ADAPT TO THE ACTUAL BUILD</span></div><div className="w10-question-card"><span>{questions[prompt][0]}</span><strong>{questions[prompt][1]}</strong><button onClick={() => setPrompt((value) => (value + 1) % questions.length)}>NEXT SYSTEM PROMPT <ArrowRight size={14}/></button></div></div></div>;
}

function NarrativeBuilder() {
  const fields: [string, string, string][] = [
    ['need', 'User need', 'One sentence: who needs what, and in what context?'],
    ['requirement', 'Measurable requirement', 'Use an ID and a verifiable limit/state.'],
    ['design', 'Design choice', 'Explain one board/interface/control choice and trade-off.'],
    ['evidence', 'Best supporting evidence', 'Name the diagram, test, result, or record.'],
  ];
  return <div className="w10-tool"><Heading slide={6} eyebrow="PRESENTATION STORY / BUILD YOUR OWN OPENING" title="Give the audience a reason to care about the design." subtitle="Draft a concise narrative from user need to evidence. Keep it consistent with the submitted requirements and actual build." tone="blue"/><div className="w10-narrative-builder">{fields.map(([key, title, prompt], index) => <article key={key}><span>0{index + 1}</span><b>{title}</b><small>{prompt}</small><PersistentDraftArea storageKey={`narrative-${key}`} label="" placeholder="Write your project-specific note"/></article>)}</div></div>;
}

function DesignStory() {
  const [decision, setDecision] = useDraftValue('demo-design-decision');
  const [reason, setReason] = useDraftValue('demo-design-reason');
  const [tradeoff, setTradeoff] = useDraftValue('demo-design-tradeoff');
  return <div className="w10-tool"><Heading slide={7} eyebrow="LO1 / DESIGN JUSTIFICATION" title="Show how requirements shaped the architecture." subtitle="Pick one design decision, explain why it fits the need, and acknowledge a trade-off or constraint."/><div className="w10-writing-layout"><div className="w10-controls"><DraftInput label="Decision" value={decision} onChange={setDecision} placeholder="Board, sensor, interface, or algorithm"/><DraftArea label="Requirement it addresses + reason" value={reason} onChange={setReason} placeholder="Connect the choice to the user's measurable need"/><DraftArea label="Trade-off / alternative" value={tradeoff} onChange={setTradeoff} placeholder="What did you gain, lose, or not choose?"/></div><div className="w10-tradeoff-visual"><span>DECISION → EVIDENCE</span><div><i>REQUIREMENT</i><ArrowRight size={14}/><i>CHOICE</i><ArrowRight size={14}/><i>TRADE-OFF</i></div><p>Point to the relevant system map, pin allocation, algorithm, or source.</p></div></div></div>;
}

function BuildStory() {
  const [selected, setSelected] = useState('Board and code');
  const assets: Record<string, [string,string]> = {
    'Board and code': ['Version and platform', 'Show the actual board/software version and one code path relevant to the requirement.'],
    'Signal and power': ['Connection path', 'Trace sensor signal and output power/driver paths using the as-built diagram.'],
    'Measurement': ['Practical evidence', 'State instrument/source, units, setup, and the physical/simulation evidence boundary.'],
    'Interface': ['Communication path', 'Explain UART/I2C/SPI or local access only if it exists in the actual design.'],
  };
  return <div className="w10-tool"><Heading slide={8} eyebrow="LO2 / BUILD + OPERATION" title="Show the implementation that produced the evidence." subtitle="Select a technical view for the demonstration. Explain what it proves; do not substitute code screenshots for results."/><div className="w10-build-layout"><div className="w10-build-tabs">{Object.keys(assets).map((item) => <button key={item} className={selected === item ? 'is-active' : ''} onClick={() => setSelected(item)}>{item}</button>)}</div><div className="w10-build-detail"><span>{assets[selected][0]}</span><strong>{selected}</strong><p>{assets[selected][1]}</p><div className="w10-build-path"><i>INPUT</i><ArrowRight size={14}/><i>PROCESS</i><ArrowRight size={14}/><i>OUTPUT + STATUS</i></div></div></div></div>;
}

function TestStory() {
  const [requirement, setRequirement] = useState('FR-01');
  const [expected, setExpected] = useDraftValue('demo-test-expected');
  const [observed, setObserved] = useDraftValue('demo-test-observed');
  const [evidence, setEvidence] = useDraftValue('demo-test-evidence');
  return <div className="w10-tool"><Heading slide={9} eyebrow="LO2 / DEMONSTRATE A TEST, NOT JUST A RESULT" title="State the condition before showing what happened." subtitle="Select the requirement, then explain the expected outcome, observed outcome, and evidence reference." tone="blue"/><div className="w10-test-story"><div className="w10-controls"><label>Requirement<select value={requirement} onChange={(event) => setRequirement(event.target.value)}>{demonstrationRequirementIds.map((id) => <option key={id}>{id}</option>)}</select></label><DraftArea label="Expected outcome" value={expected} onChange={setExpected} placeholder="Target / acceptance limit"/><DraftArea label="Observed outcome + test ID" value={observed} onChange={setObserved} placeholder="Actual result and conditions"/><DraftInput label="Evidence reference" value={evidence} onChange={setEvidence} placeholder="Test ID, filename, log, photo"/></div><aside className="w10-test-visual"><span>DEMONSTRATION LOGIC</span><strong>{requirement}</strong><div><i>EXPECTED</i><ArrowRight size={14}/><i>OBSERVED</i><ArrowRight size={14}/><i>JUDGEMENT</i></div><p>{observed || 'Enter only an actual result from your test record.'}</p></aside></div></div>;
}

function SecurityStory() {
  const [risk, setRisk] = useDraftValue('demo-risk');
  const [control, setControl] = useDraftValue('demo-control');
  const [residual, setResidual] = useDraftValue('demo-residual');
  return <div className="w10-tool"><Heading slide={10} eyebrow="LO3 / SECURITY + RESILIENCE" title="Explain the risk that remains after the control." subtitle="Use the team's risk assessment. Keep classroom prototype conclusions proportionate and avoid certification claims." tone="coral"/><div className="w10-security-layout"><div className="w10-controls"><DraftInput label="Risk / asset" value={risk} onChange={setRisk} placeholder="Risk ID and affected asset"/><DraftArea label="Control and verification evidence" value={control} onChange={setControl} placeholder="Control used and test/review reference"/><DraftArea label="Residual risk / assumption" value={residual} onChange={setResidual} placeholder="What remains uncertain or outside scope?"/></div><div className="w10-security-flow"><ShieldCheck size={28}/><span>RISK REVIEW</span><div><i>THREAT</i><ArrowRight size={14}/><i>CONTROL</i><ArrowRight size={14}/><i>RESIDUAL</i></div><strong>Prototype, not certification.</strong></div></div></div>;
}

function JudgementStory() {
  const [result, setResult] = useDraftValue('demo-judgement-result');
  const [limitation, setLimitation] = useDraftValue('demo-judgement-limit');
  const [next, setNext] = useDraftValue('demo-judgement-next');
  return <div className="w10-tool"><Heading slide={11} eyebrow="EVALUATION / STATE WHAT THE EVIDENCE DOES NOT PROVE" title="A good conclusion includes its boundary." subtitle="Separate measured result, interpretation, unresolved limitation, and the next test or improvement." tone="blue"/><div className="w10-judgement-layout"><div className="w10-controls"><DraftArea label="Result + judgement" value={result} onChange={setResult} placeholder="What does the evidence support?"/><DraftArea label="Limitation" value={limitation} onChange={setLimitation} placeholder="What is uncertain, small-sample, or untested?"/><DraftArea label="Next test / improvement" value={next} onChange={setNext} placeholder="What would strengthen the conclusion?"/></div><div className="w10-judgement-visual"><span>FACT ≠ INFERENCE ≠ FUTURE WORK</span><div><b>OBSERVED</b><ArrowDown size={14}/><b>INTERPRETED</b><ArrowDown size={14}/><b>LIMITED</b><ArrowDown size={14}/><b>NEXT ACTION</b></div></div></div></div>;
}

function DemoPlan() {
  const [condition, setCondition] = useDraftValue('demo-condition');
  const [claim, setClaim] = useDraftValue('demo-claim');
  const [limit, setLimit] = useDraftValue('demo-limit');
  return <div className="w10-tool"><Heading slide={12} eyebrow="DEMO PLAN / CONDITION → BEHAVIOR → CLAIM" title="Plan each demonstration as a small test." subtitle="Before the team demo, name the condition, actual behavior to show, evidence link, and limitation."/><div className="w10-demo-builder"><div className="w10-controls"><DraftInput label="Demonstration condition" value={condition} onChange={setCondition} placeholder="Input, mode, version, setup"/><DraftArea label="Behavior / claim to show" value={claim} onChange={setClaim} placeholder="One requirement and expected behavior"/><DraftArea label="Limitation / fallback" value={limit} onChange={setLimit} placeholder="What could fail live, and which labelled evidence can support?"/></div><div className="w10-demo-card"><Target size={24}/><span>DEMO UNIT</span><strong>ONE CLAIM / ONE TEST / ONE EVIDENCE LINK</strong><p>Keep to the agreed safe setup. Stop if conditions differ from the approved test.</p></div></div></div>;
}

function RunOfShow() {
  const slots = [
    { id: 'opening', title: 'Context + requirement', minutes: 3 },
    { id: 'system', title: 'System architecture', minutes: 4 },
    { id: 'build', title: 'Implementation / interface', minutes: 4 },
    { id: 'test', title: 'Test + result', minutes: 5 },
    { id: 'risk', title: 'Risk / safe state / limitation', minutes: 3 },
    { id: 'team', title: 'Individual contributions + questions', minutes: 6 },
  ];
  const [active, setActive] = useState('opening');
  const [notes, setNotes] = useDraftValue('demo-runofshow');
  const total = slots.reduce((sum, slot) => sum + slot.minutes, 0);
  return <div className="w10-tool"><Heading slide={13} eyebrow="RUN-OF-SHOW / CUSTOMISE TO THE TUTOR'S SLOT" title="Give each section a job and a time limit." subtitle="The example timings total 25 minutes. Adjust to the tutor-confirmed slot and ensure every student has an individual speaking/question turn." tone="blue"/><div className="w10-run-layout"><div className="w10-run-list">{slots.map((slot, index) => <button key={slot.id} className={active === slot.id ? 'is-active' : ''} onClick={() => setActive(slot.id)}><span>0{index + 1}</span><b>{slot.title}</b><i>{slot.minutes} MIN</i></button>)}</div><div className="w10-run-detail"><span>SELECTED SEGMENT / {total} MIN TOTAL</span><strong>{slots.find((slot) => slot.id === active)?.title}</strong><DraftArea label="Speaker / cue / evidence" value={notes} onChange={setNotes} placeholder="Who presents this, and which artifact will they show?"/><div className="w10-timebar">{slots.map((slot) => <i key={slot.id} className={active === slot.id ? 'is-active' : ''} style={{ flexGrow: slot.minutes }} title={`${slot.title}: ${slot.minutes} minutes`}/>)}</div></div></div></div>;
}

function IndividualQuestions() {
  const [index, setIndex] = useState(0);
  const [rehearsed, setRehearsed] = useState<Record<number, boolean>>({});
  return <div className="w10-tool"><Heading slide={14} eyebrow="INDIVIDUAL QUESTIONS / PRACTISE THE REASONING" title="Answer from your project, not from memorised definitions." subtitle="Select a prompt, prepare a concise answer, then rehearse with the evidence open."/><div className="w10-question-layout"><div className="w10-question-wheel">{demoQuestions.map((_, promptIndex) => <button key={promptIndex} className={index === promptIndex ? 'is-active' : ''} onClick={() => setIndex(promptIndex)} aria-label={`Select question ${promptIndex + 1}`}>{String(promptIndex + 1).padStart(2, '0')}</button>)}</div><div className="w10-question-card"><span>QUESTION {String(index + 1).padStart(2, '0')} / {demoQuestions.length}</span><strong>{demoQuestions[index]}</strong><PersistentDraftArea storageKey={`question-${index}`} label="Evidence cue / answer notes" placeholder="Three key points and the evidence to show"/><button onClick={() => setRehearsed((current) => ({ ...current, [index]: !current[index] }))}>{rehearsed[index] ? <Check size={15}/> : <ClipboardCheck size={15}/>} {rehearsed[index] ? 'REHEARSED' : 'MARK REHEARSED'}</button></div></div></div>;
}

function SafeFallback() {
  const [mode, setMode] = useState('Live demonstration');
  const [stop, setStop] = useDraftValue('fallback-stop-rule');
  const [recorded, setRecorded] = useDraftValue('fallback-recorded-evidence');
  const modes: Record<string, string> = {
    'Live demonstration': 'State setup and safe start/stop procedure; demonstrate only the approved test.',
    'Recorded evidence': 'Label date, version, test ID, conditions, and source. State why recorded evidence is used.',
    'Model / simulation': 'Label SIMULATION and explain what physical behavior it cannot prove.',
  };
  return <div className="w10-tool"><Heading slide={15} eyebrow="SAFE DEMONSTRATION / PLAN A FALLBACK" title="Never bypass a fault to make the demo work." subtitle="A safe stop and labelled alternative strengthen the demonstration; an improvised repair weakens evidence and may be unsafe." tone="coral"/><div className="w10-fallback-layout"><div className="w10-controls"><label>Primary / fallback format<select value={mode} onChange={(event) => setMode(event.target.value)}>{Object.keys(modes).map((item) => <option key={item}>{item}</option>)}</select></label><DraftArea label="Stop condition" value={stop} onChange={setStop} placeholder="When must the team stop and notify the tutor?"/><DraftArea label="Fallback evidence reference" value={recorded} onChange={setRecorded} placeholder="File/test ID and what it demonstrates"/></div><div className="w10-safe-card"><ShieldCheck size={27}/><span>SAFE DEMO RULE</span><strong>{mode.toUpperCase()}</strong><p>{modes[mode]}</p><small>Stop if the setup, output, or behavior differs from the tutor-approved conditions.</small></div></div></div>;
}

function PeerQuestions() {
  const prompts = ['Which requirement does this demonstrate?', 'What was the test condition?', 'Where is the expected/observed comparison?', 'What limitation changes the strength of the claim?', 'What does the fallback evidence prove?'];
  const [notes, setNotes] = useDraftValue('peer-questions');
  const [selected, setSelected] = useState(0);
  return <div className="w10-tool"><Heading slide={16} eyebrow="PEER QUESTIONS / CONSTRUCTIVE AND SPECIFIC" title="Help the presenter make the evidence easier to trust." subtitle="Ask one question about a requirement, one about evidence quality, and one about a limitation or next test."/><div className="w10-peer-layout"><div className="w10-peer-prompts">{prompts.map((prompt, index) => <button key={prompt} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)}><span>0{index + 1}</span>{prompt}</button>)}</div><div className="w10-peer-card"><Users size={24}/><span>SELECTED QUESTION</span><strong>{prompts[selected]}</strong><DraftArea label="Feedback note" value={notes} onChange={setNotes} placeholder="Specific, respectful feedback and the evidence question"/></div></div></div>;
}

function FeedbackNotes() {
  const [positive, setPositive] = useDraftValue('feedback-strength');
  const [question, setQuestion] = useDraftValue('feedback-question');
  const [action, setAction] = useDraftValue('feedback-action');
  return <div className="w10-tool"><Heading slide={17} eyebrow="FEEDBACK / CAPTURE A RESPONSE" title="Record feedback and what you will do with it." subtitle="A presentation is part of the evidence trail. Preserve useful feedback and close the loop with an action or reasoned decision."/><div className="w10-writing-layout"><div className="w10-controls"><DraftArea label="One demonstrated strength" value={positive} onChange={setPositive} placeholder="What was clear or well supported?"/><DraftArea label="One evidence question / improvement" value={question} onChange={setQuestion} placeholder="What would help the audience verify the claim?"/><DraftArea label="Action / owner / date" value={action} onChange={setAction} placeholder="What changes, who owns it, by when?"/></div><div className="w10-feedback-visual"><span>FEEDBACK LOOP</span><b>NOTICE</b><ArrowRight size={15}/><b>DECIDE</b><ArrowRight size={15}/><b>ACT</b><p>Record accepted and declined suggestions with a short reason.</p></div></div></div>;
}

function SourceCheck() {
  const sources = ['Board and component datasheets', 'Official board pinout / electrical limits', 'Evidence files labelled with date and test ID', 'Simulation images clearly marked', 'External figures and definitions referenced', 'Reference list follows the tutor-confirmed style'];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const count = Object.values(checked).filter(Boolean).length;
  return <div className="w10-tool"><Heading slide={18} eyebrow="SOURCES / FIGURES / REFERENCES" title="Make the technical claims traceable to their sources." subtitle="Use current authoritative sources for board/component facts. Follow the style and submission rules specified by your tutor."/><div className="w10-source-layout"><div className="w10-checklist">{sources.map((item) => <label key={item}><input type="checkbox" checked={checked[item] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w10-source-card"><BookOpen size={24}/><span>SOURCE REVIEW</span><strong>{count} / {sources.length}</strong><p>Every figure, board fact, and external claim should have a source and a clear caption.</p><small>Do not include student personal information or credentials in public files.</small></aside></div></div>;
}

function PortfolioMap({ outcome }: { outcome: 'LO1 + LO2' | 'LO3' }) {
  const [refs, setRefs] = useState<Record<string, string>>({});
  const content = outcome === 'LO1 + LO2'
    ? [['Context + requirements', 'Context map, IDs, measurable criteria'], ['Design rationale', 'Architecture, board choice, pins, algorithm'], ['Practical investigation', 'Build, measurements, test/debug/retest']]
    : [['Assets + risk', 'Threats, ratings, controls, residual risk'], ['Safe states', 'Startup, invalid input, reset, recovery'], ['Refinement', 'Change record, regression test, limitations']];
  const keyFor = (index: number) => `${outcome}-${index}`;
  return <div className="w10-tool"><Heading slide={outcome === 'LO1 + LO2' ? 19 : 20} eyebrow={`${outcome} / PORTFOLIO EVIDENCE MAP`} title={outcome === 'LO1 + LO2' ? 'Point from the systems design to practical proof.' : 'Show security and refinement in the same versioned story.'} subtitle="Add the file, test, or page reference a reviewer should open. Missing links become actions, not claims." tone="blue"/><div className="w10-portfolio-map">{content.map(([title, detail], index) => <article key={title}><span>0{index + 1}</span><b>{title}</b><small>{detail}</small><DraftInput label="Evidence reference" value={refs[keyFor(index)] ?? ''} onChange={(value) => setRefs((current) => ({ ...current, [keyFor(index)]: value }))} placeholder="Filename / ID"/></article>)}</div></div>;
}

function ContributionMap() {
  const [role, setRole] = useDraftValue('lo4-role');
  const [action, setAction] = useDraftValue('lo4-action');
  const [artifact, setArtifact] = useDraftValue('lo4-artifact');
  const [impact, setImpact] = useDraftValue('lo4-impact');
  return <div className="w10-tool"><Heading slide={21} eyebrow="LO4 / TEAM + INDIVIDUAL CONTRIBUTION" title="Show who did what, and what changed because of it." subtitle="Distinguish your own work from shared team work. Use dated records, peer feedback, and handovers."/><div className="w10-writing-layout"><div className="w10-controls"><DraftInput label="Team role / responsibility" value={role} onChange={setRole} placeholder="Role actually performed"/><DraftArea label="Specific individual action" value={action} onChange={setAction} placeholder="What did you personally do?"/><DraftInput label="Artifact / dated record" value={artifact} onChange={setArtifact} placeholder="Test ID, commit, diagram, meeting note"/><DraftArea label="Value / effect on team result" value={impact} onChange={setImpact} placeholder="What did your work enable or improve?"/></div><div className="w10-contribution-visual"><span>CONTRIBUTION CHAIN</span><b>{role || 'ROLE'}</b><ArrowDown size={15}/><b>{action || 'PERSONAL ACTION'}</b><ArrowDown size={15}/><b>{artifact || 'EVIDENCE'}</b><ArrowDown size={15}/><b>{impact || 'VALUE'}</b></div></div></div>;
}

function ReflectionDraft() {
  const [event, setEvent] = useDraftValue('lo5-event');
  const [response, setResponse] = useDraftValue('lo5-response');
  const [learning, setLearning] = useDraftValue('lo5-learning');
  const [next, setNext] = useDraftValue('lo5-next');
  return <div className="w10-tool"><Heading slide={22} eyebrow="LO5 / REFLECTION FROM FEEDBACK" title="Connect an event to learning and a next step." subtitle="Use one specific example from the module. Avoid generic statements such as 'communication improved' without evidence." tone="blue"/><div className="w10-writing-layout"><div className="w10-controls"><DraftArea label="Event / feedback" value={event} onChange={setEvent} placeholder="What happened, and what feedback did you receive?"/><DraftArea label="Response" value={response} onChange={setResponse} placeholder="What did you do differently?"/><DraftArea label="Learning + evidence" value={learning} onChange={setLearning} placeholder="What skill changed, and how can you show it?"/><DraftArea label="Next action" value={next} onChange={setNext} placeholder="What will you develop further?"/></div><div className="w10-reflection-graphic"><span>REFLECTION CYCLE</span><div><b>EVENT</b><ArrowRight size={14}/><b>RESPONSE</b><ArrowRight size={14}/><b>LEARNING</b><ArrowRight size={14}/><b>ACTION</b></div><small>Keep a dated logbook entry so the reflection can be traced over time.</small></div></div></div>;
}

function CpdDraft() {
  const [gap, setGap] = useDraftValue('cpd-gap');
  const [action, setAction] = useDraftValue('cpd-action');
  const [success, setSuccess] = useDraftValue('cpd-success');
  const [date, setDate] = useDraftValue('cpd-date');
  const complete = [gap, action, success, date].every((item) => item.trim());
  return <div className="w10-tool"><Heading slide={23} eyebrow="LO5 / CONTINUING PROFESSIONAL DEVELOPMENT" title="Leave with one action you can actually complete." subtitle="Make it specific, measurable, relevant, and dated. Add the result to your next logbook entry." tone="blue"/><div className="w10-cpd-layout"><div className="w10-controls"><DraftInput label="Skill gap" value={gap} onChange={setGap} placeholder="What do you still need to learn?"/><DraftArea label="Action" value={action} onChange={setAction} placeholder="Read, practise, attend, ask, or build what?"/><DraftInput label="Success measure / evidence" value={success} onChange={setSuccess} placeholder="What will demonstrate progress?"/><DraftInput label="Target date" value={date} onChange={setDate} placeholder="YYYY-MM-DD"/></div><aside className={`w10-cpd-card ${complete ? 'is-complete' : ''}`}><Target size={26}/><span>SMART CPD ACTION</span><strong>{complete ? 'READY TO LOG' : 'GAP → ACTION → EVIDENCE → DATE'}</strong><p>{gap || 'Name a current gap.'}</p><small>Review outcome against your success measure on the target date.</small></aside></div></div>;
}

function CoherenceReview() {
  const checklist = portfolioItems.map(([outcome, evidence]) => `${outcome}: ${evidence}`);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const count = Object.values(checked).filter(Boolean).length;
  return <div className="w10-tool"><Heading slide={24} eyebrow="PORTFOLIO CONSISTENCY / FINAL CROSS-CHECK" title="Make sure each artifact describes the same project version." subtitle="Check for contradictions before submission. A checked box is your review record, not an external assessment sign-off."/><div className="w10-coherence-layout"><div className="w10-checklist">{checklist.map((item) => <label key={item}><input type="checkbox" checked={checked[item] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w10-coherence-card"><ClipboardCheck size={25}/><span>CONSISTENCY CHECK</span><strong>{count} / {checklist.length}</strong><div className="w10-meter"><i style={{ width: `${(count / checklist.length) * 100}%` }}/></div><p>Assign every unchecked item to an owner and date.</p></aside></div></div>;
}

function PresentationOutline() {
  const sections = [
    ['01', 'Need + requirements', 'User, context, boundary, success criteria'],
    ['02', 'Design + build', 'Architecture, decision, implementation, version'],
    ['03', 'Test + result', 'Condition, expected, observed, judgement, evidence'],
    ['04', 'Risk + refinement', 'Control, residual risk, justified change, retest'],
    ['05', 'Evaluation + next steps', 'Limitations, team contribution, CPD, future work'],
  ];
  const [notes, setNotes] = useDraftValue('final-outline-notes');
  return <div className="w10-tool"><Heading slide={25} eyebrow="PRESENTATION OUTLINE / A STORY THE AUDIENCE CAN FOLLOW" title="Order slides around the engineering decisions." subtitle="Use this as a structure, not a fixed script. Follow the tutor-confirmed presentation length and required submission format."/><div className="w10-outline-layout"><div className="w10-outline-list">{sections.map(([number, title, detail]) => <article key={number}><span>{number}</span><div><b>{title}</b><small>{detail}</small></div></article>)}</div><div className="w10-controls"><DraftArea label="Your key transition / spoken narrative" value={notes} onChange={setNotes} placeholder="How will you connect one section to the next?"/><div className="w10-outline-warning"><AlertTriangle size={17}/><span>Use project-specific evidence. Do not present example, planned, or simulated outcomes as measured results.</span></div></div></div></div>;
}

function FinalExport() {
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);
  const prepare = () => {
    const keys = Object.keys(window.localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).sort();
    const sections = keys.map((key) => {
      const value = window.localStorage.getItem(key) ?? '';
      const title = key.slice(DRAFT_PREFIX.length).replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      return { title, value: formatWeek10Draft(key, value) };
    }).filter((entry) => entry.value.trim());
    if (!sections.length) { setDownloadUrl(''); setStatus('No saved reflection notes yet. Draft a section first, then prepare the export.'); return; }
    const body = ['# EEE4015 Week 10 / Final Review Working Notes', '', '> Working document only. Check every claim against your own evidence and follow tutor assessment guidance.', '', ...sections.flatMap((section) => [`## ${section.title}`, '', section.value, ''])].join('\n');
    setDownloadUrl(URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' })));
    setStatus(`${sections.length} locally saved sections prepared. Download and edit the Markdown file before submission.`);
  };
  const clear = () => {
    Object.keys(window.localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).forEach((key) => window.localStorage.removeItem(key));
    setDownloadUrl('');
    setStatus('Week 10 local notes cleared in this browser.');
  };
  return <div className="w10-tool"><Heading slide={26} eyebrow="FINAL REVIEW / LOCAL NOTES EXPORT" title="Take your final review notes with you." subtitle="Reflection drafts save only in this browser and export as Markdown. This does not submit coursework or supply a completed assessment answer."/><div className="w10-export-layout"><div className="w10-export-graphic"><FileText size={30}/><span>LOCAL BROWSER NOTES</span><div><i>PORTFOLIO</i><ArrowRight size={14}/><i>REFLECTION</i><ArrowRight size={14}/><i>CPD</i><ArrowRight size={14}/><i>MARKDOWN</i></div><p>Use your institution's required format, references, and final submission instructions.</p></div><div className="w10-export-actions"><button className="primary-button" onClick={prepare}><FileText size={16}/> PREPARE FINAL REVIEW</button>{downloadUrl && <a className="w10-download-link" href={downloadUrl} download="eee4015-week10-final-review-notes.md"><Download size={15}/> DOWNLOAD NOTES</a>}<button className="w10-clear-button" onClick={clear}><RotateCcw size={14}/> CLEAR LOCAL WEEK 10 NOTES</button><p aria-live="polite">{status || 'Draft notes autosave locally as you edit; no data is uploaded.'}</p></div></div></div>;
}

function FundamentalsRefresher() {
  const [duty, setDuty] = useState(50);
  const period = 112;
  const waveStart = 28;
  const highWidth = period * duty / 100;
  const waveform = Array.from({ length: 4 }, (_, cycle) => {
    const x = waveStart + cycle * period;
    return `M ${x} 125 ${duty === 0 ? `H ${x + period}` : `V 45 H ${x + highWidth} V 125 H ${x + period}`}`;
  }).join(' ');
  return <div className="w10-tool w10-fundamentals"><Heading slide={27} eyebrow="FOUNDATION REFRESH / WEEKS 1–4" title="Four pin concepts. One signal you can see." subtitle="Digital pins read or set logic states; analogue input measures a voltage. PWM is still a digital output, not a true analogue voltage." tone="blue"/><div className="w10-fundamental-grid"><article><span>DIGITAL INPUT</span><strong>Read a logic state</strong><p>A button or digital sensor is read as LOW or HIGH. Give the input a defined state with a pull-up or pull-down.</p><code>digitalRead(pin)</code></article><article><span>DIGITAL OUTPUT</span><strong>Set a logic state</strong><p>Write LOW or HIGH to signal an indicator or control a suitable driver. A GPIO pin is not a load power supply.</p><code>digitalWrite(pin, state)</code></article><article><span>ANALOG INPUT</span><strong>Voltage to ADC code</strong><p>An ADC samples an input voltage and returns a board-dependent number. Calibration is needed to interpret a physical quantity.</p><code>analogRead(pin)</code></article><article><span>ANALOG OUTPUT</span><strong>DAC, when available</strong><p>A DAC can produce a stepped voltage. Many beginner boards lack a general DAC; Uno analogWrite uses PWM instead.</p><code>DAC voltage ≠ PWM</code></article></div><div className="w10-pwm-layout"><div className="w10-pwm-scope"><div className="w10-pwm-scope__label"><span>PWM LOGIC OUTPUT</span><b>FIXED PERIOD / DUTY CHANGES HIGH-TIME</b></div><svg viewBox="0 0 520 170" role="img" aria-labelledby="w10-pwm-title w10-pwm-desc"><title id="w10-pwm-title">Animated PWM waveform at {duty}% duty cycle</title><desc id="w10-pwm-desc">The period and frequency stay fixed while the slider changes the proportion of each period that the digital signal is high.</desc><line className="w10-pwm-gridline" x1="28" y1="45" x2="476" y2="45"/><line className="w10-pwm-gridline" x1="28" y1="125" x2="476" y2="125"/><path className="w10-pwm-wave" d={waveform}/><line className="w10-pwm-scan" x1="28" y1="32" x2="28" y2="137"/><text className="w10-pwm-axis-label" x="4" y="49">HIGH</text><text className="w10-pwm-axis-label" x="4" y="129">LOW</text><text className="w10-pwm-axis-label" x="451" y="157">TIME</text></svg><div className="w10-pwm-period"><span>← ONE PERIOD →</span><span>FREQUENCY STAYS FIXED</span></div></div><aside className="w10-pwm-control"><span>ADJUST DUTY CYCLE</span><strong>{duty}% <small>HIGH</small></strong><label htmlFor="w10-pwm-duty">HIGH-TIME PER PERIOD<input id="w10-pwm-duty" type="range" min="0" max="100" step="5" value={duty} onChange={(event) => setDuty(Number(event.target.value))}/></label><p>Changing duty alters the time-averaged effect for a suitable load. The pin still switches between digital LOW and HIGH.</p></aside></div></div>;
}

function ExitTicket() {
  const questions = [
    { prompt: 'What makes a demonstration claim defensible?', options: ['A stated condition, observed behavior, evidence, and limitation', 'A polished slide alone', 'A future feature'], answer: 0 },
    { prompt: 'Which outcomes include individual contribution and CPD?', options: ['LO4 and LO5', 'LO1 only', 'A002 Task 2.2 only'], answer: 0 },
    { prompt: 'What is one good final reflection?', options: ['A design choice, supporting test, limitation, risk control, and next action', 'A list of components', 'A claim that everything is perfect'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  const [next, setNext] = useDraftValue('exit-next-step');
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={28} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Defend the work.<br/><span className="text-blue">Name the next step.</span></>} subtitle="Revisit the capstone and write one practical action for your portfolio." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<DraftArea label="Next portfolio / CPD action" value={next} onChange={setNext} placeholder="One action, owner, evidence, date"/></div></div>;
}

function DraftInput({ label, value, onChange, placeholder, compact = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; compact?: boolean }) {
  return <label className={`w9-draft-field ${compact ? 'is-compact' : ''}`}>{label && <span>{label}</span>}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
}
function DraftArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="w9-draft-field">{label && <span>{label}</span>}<textarea rows={2} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
}
function PersistentDraftArea({ storageKey, label, placeholder }: { storageKey: string; label: string; placeholder?: string }) {
  const [value, setValue] = useDraftValue(storageKey);
  return <DraftArea label={label} value={value} onChange={setValue} placeholder={placeholder}/>;
}

function parseDraftArray<T>(value: string, fallback: T[]): T[] {
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed as T[] : fallback; } catch { return fallback; }
}
function formatWeek10Draft(key: string, value: string) {
  if (key === `${DRAFT_PREFIX}objective-review`) {
    const rows = parseDraftArray(value, [] as { id: string; name: string; judgement: string; evidence: string }[]);
    return ['| Requirement | Objective | Judgement | Evidence |', '|---|---|---|---|', ...rows.map((row) => `| ${row.id} | ${row.name} | ${row.judgement || 'Not reviewed'} | ${row.evidence || 'Not entered'} |`)].join('\n');
  }
  if (key === `${DRAFT_PREFIX}evaluation-matrix`) {
    const rows = parseDraftArray(value, [] as { id: string; objective: string; target: string; result: string; judgement: string; evidence: string; limit: string }[]);
    return ['| Requirement | Objective | Target | Result | Judgement | Evidence | Limitation |', '|---|---|---|---|---|---|---|', ...rows.map((row) => `| ${row.id} | ${row.objective} | ${row.target} | ${row.result} | ${row.judgement} | ${row.evidence} | ${row.limit} |`)].join('\n');
  }
  return value;
}

export default App;
