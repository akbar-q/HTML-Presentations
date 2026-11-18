import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check,
  ClipboardCheck, Cpu, Expand, FileText, GitBranch, Lightbulb,
  LockKeyhole, Pause, Play, Radio, ShieldCheck,
  Sparkles, Users,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const slideNames = [
  'Start here', 'The session route', 'A002 starts with your real prototype', 'A teaching prototype is not a certified product',
  'Map the assets worth protecting', 'Trace access and information boundaries', 'Choose realistic threat scenarios',
  'Rate likelihood with a reason', 'Rate impact against the project', 'Calculate and compare risk', 'Build the team risk register',
  'Choose controls in proportion', 'Check the control and residual risk', 'Define safe states and recovery',
  'Tabletop a fault response', 'Record recovery evidence', 'Choose the right communication interface',
  'Trace a communication failure', 'Keep optional wireless proportionate', 'Make the software maintainable',
  'Control changes and versions', 'Share work with clear ownership', 'Record decisions and handovers',
  'Run a useful peer review', 'Keep an individual learning record', 'Write one SMART CPD action',
  'A002 evidence clinic', 'Exit ticket',
];
const slideDurations = [5, 10, 10, 10, 15, 10, 15, 10, 10, 20, 20, 20, 20, 20, 15, 15, 15, 15, 15, 15, 15, 20, 20, 15, 20, 10, 15, 5];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'RISK MAP', index: 4 },
  { name: 'CONTROLS', index: 10 }, { name: 'COMMUNICATION', index: 16 },
  { name: 'TEAM + CPD', index: 20 }, { name: 'EVIDENCE', index: 26 },
];
const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }
function riskBand(score: number) { return score >= 15 ? 'high' : score >= 5 ? 'medium' : 'low'; }
function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week7-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

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
  useEffect(() => { document.title = `EEE4015 / Week 07 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => {
    if (stageRef.current) stageRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 07</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsedAt(slide))}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsedAt(slide))} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week7-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(1)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <Concept slide={2} eyebrow="A002 / TASK 2.1" title="Start from the prototype you actually built." subtitle="Security and resilience only make sense against real assets, users, interfaces, and operating conditions." visual="boundary" tone="blue" points={[["Carry forward A001","Use the reviewed circuit, software version, requirements, and Week 6 evidence as the baseline.","Name what exists, not what the team hopes to build."],["Begin A002","Identify risks, select proportionate controls, and evaluate what remains.","Include team decisions and individual reflection."],["Stay in scope","This is an educational extra-low-voltage prototype, not a certified product.","State assumptions and limitations clearly."]]} takeaway="An honest boundary makes the risk assessment more useful."/>;
    case 3: return <Concept slide={3} eyebrow="SCOPE / SAFETY LIMIT" title="A teaching prototype is not a certified product." subtitle="Do not use a classroom demonstration to claim production security, functional safety, or mains suitability." visual="scope" tone="coral" points={[["Included","Controller, code, threshold/configuration, sensors, user controls, USB access, low-voltage wiring, team files.","Map actual access points and dependencies."],["Conditional","UART/I2C/SPI peripherals and ESP32 wireless only if present in the team's design.","Do not invent a network threat for a local-only Uno."],["Excluded","Mains-connected heaters, pumps, or fans; certification; real deployment assurance.","Refer real installations to qualified assessment." ]]} takeaway="A risk score cannot certify a system safe."/>;
    case 4: return <AssetInventory/>;
    case 5: return <BoundaryMap/>;
    case 6: return <ThreatPicker/>;
    case 7: return <RatingGuide kind="likelihood"/>;
    case 8: return <RatingGuide kind="impact"/>;
    case 9: return <RiskMatrix/>;
    case 10: return <RiskRegister/>;
    case 11: return <ControlHierarchy/>;
    case 12: return <ResidualRisk/>;
    case 13: return <SafeStates/>;
    case 14: return <Tabletop/>;
    case 15: return <RecoveryRecord/>;
    case 16: return <ProtocolCompare/>;
    case 17: return <CommsTroubleshoot/>;
    case 18: return <WirelessBoundary/>;
    case 19: return <Maintainability/>;
    case 20: return <ChangeControl/>;
    case 21: return <TeamBoard/>;
    case 22: return <DecisionLog/>;
    case 23: return <PeerReview/>;
    case 24: return <Logbook/>;
    case 25: return <CpdPlanner/>;
    case 26: return <EvidenceClinic/>;
    case 27: return <ExitTicket/>;
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w7-welcome"><div className="w7-welcome__copy"><Eyebrow>FIELD NOTES / 07</Eyebrow><h1 id="week7-title-0">Protect the system.<br/><span>Strengthen the team.</span></h1><p>Map realistic risks, choose proportionate controls, and make the project's decisions and contributions traceable.</p><div className="w7-meta"><span><b>28</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>A002</b> TASK 2.1 + 2.3</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w7-hero"><div className="w7-hero__hub"><ShieldCheck size={35}/><span>PROTOTYPE</span></div><div className="w7-hero__nodes"><i>CODE</i><i>ACCESS</i><i>POWER</i><i>TEAM</i></div><div className="w7-hero__ring"/><div className="w7-hero__label">MAP → PRIORITISE → CONTROL → REVIEW</div><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 RISK-MAPPING POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Rate risks with stated reasons</div><div><Check size={16}/> Define safe response and recovery</div><div><Check size={16}/> Record team and individual evidence</div></div></div>;
}

function Agenda() {
  const sessions = [
    ['00:00–01:00', 'Asset map + context', 'Identify valued assets, access, boundaries, and assumptions'],
    ['01:00–02:15', 'Guided risk-table workshop', 'Rate five realistic threats; select controls and residual scores'],
    ['02:15–02:45', 'Connectivity theory bridge', 'Compare local-only and optional connected designs'],
    ['02:45–04:15', 'Safe fault tabletop', 'Review invalid data, reset, and recovery without unsafe fault injection'],
    ['04:15–05:15', 'Team review', 'Peer-check claims against the actual circuit and software version'],
    ['05:15–06:00', 'Logbook + CPD', 'Capture contribution, feedback, skills, gap, and dated action'],
    ['06:00–06:45', 'Debrief + portfolio', 'Assign missing A002 evidence, owners, and dates'],
  ];
  return <div className="w7-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Risk review, team practice, clear evidence." subtitle="A002 begins with the system boundary and ends with named actions, owners, and evidence references."/><div className="w7-agenda-list">{sessions.map(([time, title, detail], index) => <div className="w7-agenda-row" key={title}><span>{String(index + 1).padStart(2, '0')}</span><b>{time}</b><strong>{title}</strong><small>{detail}</small></div>)}</div><p className="w7-callout"><AlertTriangle size={16}/> All fault-response activities on these slides are tabletop/planning exercises. Follow tutor and workshop procedures for any physical test.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function Concept({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w7-concept"><div className="w7-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span>{slideDurations[slide]} MIN</span></div><div className="w7-concept__body"><div className="w7-points">{points.map(([head, body, example], index) => <article className="w7-point" key={head}><span>0{index + 1}</span><div><h2>{head}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><Visual kind={visual}/></div><div className="w7-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function Visual({ kind }: { kind: string }) {
  const titles: Record<string, string> = { boundary: 'PROJECT BOUNDARY', scope: 'TEACHING SCOPE', controls: 'CONTROL LAYERS', trace: 'RISK TRACE' };
  const nodes = kind === 'controls' ? ['AVOID', 'ENGINEER', 'ADMIN', 'VERIFY'] : kind === 'scope' ? ['LOCAL', 'OPTIONAL', 'OUT OF SCOPE'] : kind === 'trace' ? ['ASSET', 'THREAT', 'CONTROL', 'EVIDENCE'] : ['PROTOTYPE', 'USERS', 'FILES', 'ACCESS'];
  return <figure className="w7-visual"><div className="w7-visual__heading">{titles[kind] ?? 'SYSTEM CONTEXT'}<i>W07</i></div><div className="w7-flow">{nodes.map((node, index) => <div key={node} className={`w7-flow-node w7-flow-node--${index}`}><b>{node}</b><small>{kind === 'scope' && index === 2 ? 'not certified' : ['identify', 'assess', 'decide', 'review'][index % 4]}</small></div>)}</div><figcaption>Connect claims to the system version, context, and evidence that support them.</figcaption></figure>;
}

const seedThreats = [
  { asset: 'Sensor readings', threat: 'Invalid or manipulated input', consequence: 'Incorrect control decision', likelihood: 3, impact: 4, control: 'Plausible range check; visible fault state' },
  { asset: 'Controller access', threat: 'Unauthorised USB/programming change', consequence: 'Unexpected configuration or behavior', likelihood: 2, impact: 4, control: 'Restrict supervised access; version and review code' },
  { asset: 'Power and wiring', threat: 'Loose connection or supply interruption', consequence: 'Reset, lost readings, uncertain output', likelihood: 3, impact: 3, control: 'Label wiring; check supply; define startup state' },
  { asset: 'Source/configuration', threat: 'Accidental change without record', consequence: 'Unreproducible tests or regression', likelihood: 3, impact: 3, control: 'Version identifier, change note, retest' },
  { asset: 'Wireless credentials', threat: 'Credential exposure (if Wi-Fi used)', consequence: 'Unauthorised network access', likelihood: 2, impact: 4, control: 'Keep secrets out of public code; use approved network' },
];

function AssetInventory() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const assets = [
    ['Physical behavior', 'Safe and predictable output state', 'CORE'],
    ['Controller + firmware', 'Board, boot state, program, update path', 'CORE'],
    ['Sensor information', 'Readings, thresholds, calibration notes', 'DATA'],
    ['Configuration', 'Setpoints, modes, stored constants', 'DATA'],
    ['Human access', 'USB/programming port, controls, workshop station', 'ACCESS'],
    ['Team work', 'Source files, diagrams, decisions, logbook', 'TEAM'],
    ['Network credentials', 'Only if wireless is actually enabled', 'CONDITIONAL'],
  ];
  const count = Object.values(selected).filter(Boolean).length;
  return <div className="w7-tool"><Heading slide={4} eyebrow="ASSET INVENTORY / START WITH VALUE" title="What must remain trustworthy and available?" subtitle="Select the assets that exist in your team's current prototype. Conditional assets are not assumed."/><div className="w7-asset-layout"><div className="w7-asset-list">{assets.map(([name, detail, tag]) => <label key={name} className={selected[name] ? 'is-selected' : ''}><input type="checkbox" checked={selected[name] ?? false} onChange={(event) => setSelected((current) => ({ ...current, [name]: event.target.checked }))}/><span className="w7-asset-tag">{tag}</span><span className="w7-asset-copy"><b>{name}</b><small>{detail}</small></span></label>)}</div><aside className="w7-score-panel"><span>ASSETS IN SCOPE</span><strong>{count} / {assets.length}</strong><p>For each selected asset, name its owner, access path, and evidence source in your risk register.</p><small>Keep personal information and credentials out of public screenshots.</small></aside></div></div>;
}

function BoundaryMap() {
  const [route, setRoute] = useState('USB / local programming');
  const routes: Record<string, string> = {
    'USB / local programming': 'Tutor or team member → USB/programming tool → controller firmware and configuration.',
    'Sensor / input path': 'Physical condition → sensor/module → signal wiring → ADC/GPIO → validation code.',
    'Team files / repository': 'Contributor → shared repository → reviewed source, diagrams, and evidence history.',
    'Optional wireless path': 'Approved network → ESP32 interface → data/configuration boundary. Include only if implemented.',
  };
  return <div className="w7-tool"><Heading slide={5} eyebrow="BOUNDARIES / WHERE CAN A CHANGE ENTER?" title="Trace access, information, and energy paths." subtitle="A boundary is a useful prompt for risk discovery, not proof that every path is a threat." tone="blue"/><div className="w7-boundary-layout"><div className="w7-controls"><label>Path to examine<select value={route} onChange={(event) => setRoute(event.target.value)}>{Object.keys(routes).map((item) => <option key={item}>{item}</option>)}</select></label><div className="w7-boundary-prompt"><GitBranch size={21}/><p>{routes[route]}</p></div><div className="w7-prompt-line"><span>ASK THE TEAM</span><b>Who can change this path, intentionally or by accident?</b></div></div><Visual kind="boundary"/></div></div>;
}

function ThreatPicker() {
  const [scenario, setScenario] = useState(0);
  const item = seedThreats[scenario];
  const choices = [
    ['Invalid/manipulated sensor data', 'Asset: sensor readings', 'May produce an incorrect decision if values are trusted without bounds.'],
    ['Physical or USB access', 'Asset: controller and firmware', 'An unsupervised code/configuration change may alter observed behavior.'],
    ['Power/wiring interruption', 'Asset: predictable operation', 'Supply variation or a loose connection may cause reset or uncertain state.'],
    ['Unreviewed software change', 'Asset: source and test evidence', 'A change without versioning can make prior results hard to reproduce.'],
    ['Communication exposure', 'Conditional: network credentials/data', 'Include only when a network path is present in the actual design.'],
  ];
  return <div className="w7-tool"><Heading slide={6} eyebrow="THREAT SCENARIOS / CONTEXT FIRST" title="Describe a plausible event, not a movie plot." subtitle="Use the project boundary to decide which threats apply. Avoid claims about adversaries or controls you cannot evidence."/><div className="w7-threat-layout"><div className="w7-threat-tabs">{choices.map(([label], index) => <button key={label} type="button" aria-pressed={scenario === index} className={scenario === index ? 'is-active' : ''} onClick={() => setScenario(index)}><span>0{index + 1}</span><b>{label}</b></button>)}</div><div className="w7-threat-detail"><span>SCENARIO / {scenario === 4 ? 'CONDITIONAL' : 'PROJECT-RELEVANT'}</span><h2>{choices[scenario][0]}</h2><p>{choices[scenario][2]}</p><figure className="w7-threat-vector"><svg viewBox="0 0 720 170" role="img" aria-labelledby="threat-path-title threat-path-desc"><title id="threat-path-title">Asset to event to consequence</title><desc id="threat-path-desc">A threat scenario begins with something valuable, passes through a plausible event, and may affect the project.</desc><defs><marker id="threat-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#7dc8eb"/></marker></defs><path className="w7-threat-link" d="M208 84 H250" markerEnd="url(#threat-arrow)"/><path className="w7-threat-link" d="M470 84 H512" markerEnd="url(#threat-arrow)"/><rect className="w7-threat-node w7-threat-node--asset" x="12" y="29" width="196" height="110" rx="5"/><rect className="w7-threat-node w7-threat-node--event" x="262" y="29" width="196" height="110" rx="5"/><rect className="w7-threat-node w7-threat-node--impact" x="512" y="29" width="196" height="110" rx="5"/><circle className="w7-threat-icon w7-threat-icon--asset" cx="48" cy="84" r="21"/><path className="w7-threat-glyph" d="M40 89h16M42 84h12M44 79h8M39 94h18"/><path className="w7-threat-icon-shape" d="M298 65h21v34h-21zM303 72h11M303 78h11M303 84h8"/><path className="w7-threat-icon-shape w7-threat-icon-shape--alert" d="M365 99l17-31 17 31zM382 79v9M382 93v1"/><circle className="w7-threat-icon w7-threat-icon--impact" cx="549" cy="84" r="21"/><path className="w7-threat-glyph w7-threat-glyph--impact" d="M549 70v14l10 7"/><text className="w7-threat-label" x="80" y="79">ASSET</text><text className="w7-threat-caption" x="80" y="100">what matters</text><text className="w7-threat-label" x="332" y="121" textAnchor="middle">EVENT</text><text className="w7-threat-label" x="580" y="79">CONSEQUENCE</text><text className="w7-threat-caption" x="580" y="100">project effect</text></svg><figcaption>Use this path to keep the risk statement specific and traceable.</figcaption></figure><div className="w7-threat-chain"><b>{item.asset}</b><ArrowRight size={16}/><b>{item.threat}</b><ArrowRight size={16}/><b>{item.consequence}</b></div><small>Next: state a cause, consequence, likelihood, and impact with a reason.</small></div></div></div>;
}

function RatingGuide({ kind }: { kind: 'likelihood' | 'impact' }) {
  const [rating, setRating] = useState(3);
  const labels = kind === 'likelihood' ? likelihoodLabels : impactLabels;
  const descriptions = kind === 'likelihood'
    ? ['Would require an unusual combination of events.', 'Could happen, but there are few known opportunities.', 'Plausible in this context; some contributing conditions exist.', 'Expected to occur in several normal sessions without controls.', 'Repeated or near-inevitable in the stated conditions.']
    : ['No meaningful effect on the prototype objective.', 'Small inconvenience; no significant requirement impact.', 'A requirement or test is delayed or partially affected.', 'Major function unavailable; significant rework or evidence loss.', 'Severe harm to project delivery or unacceptable unsafe behavior.'];
  return <div className="w7-tool"><Heading slide={kind === 'likelihood' ? 7 : 8} eyebrow={`RISK SCALE / ${kind.toUpperCase()}`} title={kind === 'likelihood' ? 'Rate likelihood against stated conditions.' : 'Rate impact against the project objective.'} subtitle={kind === 'likelihood' ? 'Use the planned exposure period and access assumptions; a score is not a precise probability.' : 'Use the defined prototype scope. Do not equate classroom impact with real-world injury certification.'} tone="blue"/><div className="w7-rating-layout"><div className="w7-rating-picker">{labels.map((label, index) => <button key={label} className={rating === index + 1 ? 'is-active' : ''} onClick={() => setRating(index + 1)}><b>{index + 1}</b><span>{label}</span></button>)}</div><div className="w7-rating-explain"><span>SELECTED {kind.toUpperCase()} / {rating}</span><strong>{labels[rating - 1]}</strong><p>{descriptions[rating - 1]}</p><small>Record the reason and source of evidence beside the score. Different teams may rate the same scenario differently.</small></div></div></div>;
}

function RiskMatrix() {
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(4);
  const score = likelihood * impact;
  return <div className="w7-tool"><Heading slide={9} eyebrow="RISK RATING / LIKELIHOOD × IMPACT" title="Use the number to prioritise, then explain it." subtitle="For this teaching exercise, initial risk R = L × I on 1–5 scales. The score is a prioritisation aid, not a probability." tone="blue"/><div className="w7-matrix-layout"><div className="w7-matrix-wrap"><table className="w7-matrix"><caption>Impact increases from left to right; likelihood increases from bottom to top.</caption><thead><tr><th>L \ I</th>{impactLabels.map((_, index) => <th key={index}>{index + 1}</th>)}</tr></thead><tbody>{[5, 4, 3, 2, 1].map((l) => <tr key={l}><th>{l}</th>{[1, 2, 3, 4, 5].map((i) => { const value = l * i; return <td key={i}><button aria-label={`Likelihood ${l}, impact ${i}, score ${value}`} aria-pressed={l === likelihood && i === impact} className={`risk-cell risk-cell--${riskBand(value)} ${l === likelihood && i === impact ? 'is-current' : ''}`} onClick={() => { setLikelihood(l); setImpact(i); }}>{value}</button></td>; })}</tr>)}</tbody></table><div className="w7-matrix-legend"><span className="is-low">LOW / 1–4</span><span className="is-medium">MODERATE / 5–14</span><span className="is-high">HIGH / 15–25</span></div></div><aside className={`w7-score-panel w7-score-panel--${riskBand(score)}`}><span>SELECTED SCORE</span><strong>{score}</strong><p>L {likelihood} ({likelihoodLabels[likelihood - 1]}) × I {impact} ({impactLabels[impact - 1]})</p><small>State the reasoning; follow your course/tutor's risk thresholds if they differ.</small></aside></div></div>;
}

type RiskRow = { asset: string; threat: string; consequence: string; likelihood: number; impact: number; control: string };
function RiskRegister() {
  const [rows, setRows] = useState<RiskRow[]>(seedThreats);
  const update = (index: number, field: 'likelihood' | 'impact' | 'control', value: string) => setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: field === 'control' ? value : Number(value) } : row));
  return <div className="w7-tool"><Heading slide={10} eyebrow="RISK WORKSHOP / TEAM REGISTER" title="Make five risks comparable and reviewable." subtitle="Example rows are prompts. Replace assumptions with your team's own asset, cause, consequence, score rationale, and selected control."/><div className="w7-risk-table">{rows.map((row, index) => { const score = row.likelihood * row.impact; return <article className="w7-risk-row" key={row.asset}><div className="w7-risk-name"><span>RISK 0{index + 1} / {row.asset}</span><b>{row.threat}</b><small>{row.consequence}</small></div><label>L<select aria-label={`Likelihood for ${row.asset}`} value={row.likelihood} onChange={(event) => update(index, 'likelihood', event.target.value)}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>I<select aria-label={`Impact for ${row.asset}`} value={row.impact} onChange={(event) => update(index, 'impact', event.target.value)}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><strong className={`w7-row-score is-${riskBand(score)}`}>{score}</strong><label className="w7-control-input">CONTROL<input aria-label={`Control for ${row.asset}`} value={row.control} onChange={(event) => update(index, 'control', event.target.value)}/></label></article>; })}</div><p className="w7-subtle">Prioritise higher scores and any unacceptable safe-state concern. A low numeric score does not override a tutor's safety instruction.</p></div>;
}

function ControlHierarchy() {
  const [selected, setSelected] = useState('Engineering / design');
  const controls: Record<string, [string, string, string]> = {
    'Avoid / reduce exposure': ['Remove unnecessary wireless/configuration features.', 'Reduces the attack surface by not including a path.', 'May not be feasible if a requirement needs the feature.'],
    'Engineering / design': ['Validate sensor ranges; initialise outputs to a defined state.', 'Changes the technical design and can limit impact.', 'Must be tested against boundary and reset conditions.'],
    'Administrative / process': ['Supervised programming access; peer review; labelled setup.', 'Clarifies roles and reduces accidental change.', 'Depends on people following the process.'],
    'Detection / recovery': ['Fault indication, versioned backup, and a documented recovery step.', 'Makes an issue visible and improves return to a known state.', 'Does not prevent the original event.'],
  };
  const content = controls[selected];
  return <div className="w7-tool"><Heading slide={11} eyebrow="PROPORTIONATE CONTROLS / SELECT A LAYER" title="Choose controls that match the cause." subtitle="Prefer design changes where practical; combine with process and recovery evidence. One checkbox is not a guarantee."/><div className="w7-controls-layout"><div className="w7-control-tabs">{Object.keys(controls).map((control) => <button key={control} className={selected === control ? 'is-active' : ''} onClick={() => setSelected(control)}>{control}</button>)}</div><div className="w7-control-detail"><Visual kind="controls"/><div className="w7-control-example"><span>EXAMPLE CONTROL</span><b>{content[0]}</b><p>{content[1]}</p><small>Limitation: {content[2]}</small></div></div></div></div>;
}

function ResidualRisk() {
  const [initialL, setInitialL] = useState(4);
  const [initialI, setInitialI] = useState(4);
  const [residualL, setResidualL] = useState(2);
  const [residualI, setResidualI] = useState(3);
  const [control, setControl] = useState('');
  const initial = initialL * initialI;
  const residual = residualL * residualI;
  return <div className="w7-tool"><Heading slide={12} eyebrow="RESIDUAL RISK / TEST THE CLAIM" title="A control changes risk only if it works in context." subtitle="Record initial and residual ratings separately. Explain the changed likelihood or impact and identify the remaining assumption." tone="blue"/><div className="w7-residual-layout"><div className="w7-controls"><div className="w7-score-pair"><RatingSelect title="INITIAL L" value={initialL} onChange={setInitialL}/><RatingSelect title="INITIAL I" value={initialI} onChange={setInitialI}/></div><label>Control being evaluated<input value={control} onChange={(event) => setControl(event.target.value)} placeholder="Name the design/process control"/></label><div className="w7-score-pair"><RatingSelect title="RESIDUAL L" value={residualL} onChange={setResidualL}/><RatingSelect title="RESIDUAL I" value={residualI} onChange={setResidualI}/></div><p className="w7-subtle">What evidence or test would support the residual rating?</p></div><div className="w7-residual-result"><div className={`w7-residual-score is-${riskBand(initial)}`}><span>INITIAL</span><b>{initial}</b><small>{initialL} × {initialI}</small></div><ArrowRight size={20}/><div className={`w7-residual-score is-${riskBand(residual)}`}><span>RESIDUAL</span><b>{residual}</b><small>{residualL} × {residualI}</small></div><strong>{control ? 'CONTROL NAMED; VERIFY ITS EFFECT' : 'NAME THE CONTROL AND ITS LIMIT'}</strong><small>Do not reduce a score just because a control is written down.</small></div></div></div>;
}

function RatingSelect({ title, value, onChange }: { title: string; value: number; onChange: (value: number) => void }) {
  return <label className="w7-inline-select">{title}<select value={value} onChange={(event) => onChange(Number(event.target.value))}>{[1,2,3,4,5].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function SafeStates() {
  const [state, setState] = useState('Invalid sensor reading');
  const [response, setResponse] = useState('Indicate fault; inhibit automatic request; retain safe output');
  const [owner, setOwner] = useState('');
  const states: Record<string, string> = {
    'Startup / reset': 'Set outputs to a known state before accepting control input.',
    'Invalid sensor reading': 'Indicate fault; inhibit automatic request; retain safe output',
    'Communication lost': 'Do not assume stale data is current; indicate loss and use defined local response.',
    'Power restored': 'Reinitialise, validate input, and require the agreed restart condition.',
  };
  return <div className="w7-tool"><Heading slide={13} eyebrow="SAFE STATE / STARTUP • INVALID • RESET • RECOVERY" title="Describe what the output does when certainty is lost." subtitle="A safe state is context-dependent. Agree it with the tutor/team and verify only through an approved procedure." tone="coral"/><div className="w7-safe-layout"><div className="w7-controls"><label>Event/state<select value={state} onChange={(event) => { setState(event.target.value); setResponse(states[event.target.value]); }}>{Object.keys(states).map((option) => <option key={option}>{option}</option>)}</select></label><label>Expected response<textarea rows={3} value={response} onChange={(event) => setResponse(event.target.value)}/></label><label>Decision owner<input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Team role / tutor confirmation"/></label></div><div className="w7-safe-card"><LockKeyhole size={27}/><span>SAFE-STATE RECORD</span><strong>{state.toUpperCase()}</strong><p>{response || 'No response defined yet.'}</p><small>{owner ? `Owner: ${owner}` : 'Assign an owner and cite the requirement or review decision.'}</small></div></div></div>;
}

function Tabletop() {
  const [scenario, setScenario] = useState('Sensor value outside plausible range');
  const [step, setStep] = useState(0);
  const scenarios: Record<string, string[]> = {
    'Sensor value outside plausible range': ['Observe the value and log conditions.', 'Mark the input invalid and signal a fault state.', 'Inhibit or bound the affected automatic request.', 'Restore only after the agreed validation step.'],
    'Controller reset during operation': ['Record the last known state and reset condition.', 'Start outputs in the documented reset state.', 'Re-check input freshness and configuration.', 'Resume only at the agreed restart condition.'],
    'Communication path unavailable': ['Identify which data is stale or unavailable.', 'Show a visible communication fault/status.', 'Use a documented local behavior or safe hold.', 'Restore the link and verify current data before resuming.'],
  };
  const flow = scenarios[scenario];
  return <div className="w7-tool"><Heading slide={14} eyebrow="FAULT-RESPONSE TABLETOP / NO PHYSICAL FAULT INJECTED" title="Walk the response before trying to test it." subtitle="Choose a scenario and trace detect → decide → indicate → recover. This interaction does not control hardware." tone="coral"/><div className="w7-tabletop"><div className="w7-controls"><label>Scenario<select value={scenario} onChange={(event) => { setScenario(event.target.value); setStep(0); }}>{Object.keys(scenarios).map((option) => <option key={option}>{option}</option>)}</select></label><div className="w7-tabletop-actions"><button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>PREVIOUS</button><button onClick={() => setStep((value) => Math.min(flow.length - 1, value + 1))} disabled={step === flow.length - 1}>NEXT STEP</button></div></div><div className="w7-flow-steps">{flow.map((item, index) => <article key={item} className={index === step ? 'is-active' : index < step ? 'is-done' : ''}><span>0{index + 1}</span><b>{['DETECT', 'DECIDE', 'INDICATE', 'RECOVER'][index]}</b><p>{item}</p></article>)}</div></div><p className="w7-callout"><ShieldCheck size={16}/> Any physical reset or fault test requires separate tutor approval and a safe, current-limited setup.</p></div>;
}

function RecoveryRecord() {
  const [trigger, setTrigger] = useState('');
  const [observed, setObserved] = useState('');
  const [recovery, setRecovery] = useState('');
  const fields = [trigger, observed, recovery].filter((value) => value.trim()).length;
  return <div className="w7-tool"><Heading slide={15} eyebrow="RECOVERY EVIDENCE / RECORD, DO NOT ASSUME" title="Capture what the team actually checked." subtitle="Use a tabletop record for discussion. If an approved bench test occurs, cite the physical test record separately." tone="blue"/><div className="w7-recovery-layout"><div className="w7-controls"><label>Trigger and setup<textarea rows={3} value={trigger} onChange={(event) => setTrigger(event.target.value)} placeholder="State, version, approved conditions"/></label><label>Observed indication/output<textarea rows={3} value={observed} onChange={(event) => setObserved(event.target.value)} placeholder="Actual or clearly labelled tabletop expectation"/></label><label>Recovery and evidence reference<textarea rows={3} value={recovery} onChange={(event) => setRecovery(event.target.value)} placeholder="Action, return condition, evidence ID"/></label></div><div className="w7-recovery-card"><Activity size={28}/><span>RECOVERY NOTE</span><strong>{fields} / 3 FIELDS</strong><p>{fields === 3 ? 'Record fields complete; tutor/team review still needed.' : 'Keep expected and observed behavior distinct.'}</p><small>Do not label a planned tabletop outcome as a measured result.</small></div></div></div>;
}

const protocols = {
  UART: { signals: 'TX, RX, common reference', roles: 'Point-to-point asynchronous serial; agree baud and framing.', prompts: 'Check crossed TX/RX, common reference, baud, and voltage levels.' },
  I2C: { signals: 'SDA, SCL, common reference', roles: 'Addressed shared bus; pull-ups and logic levels matter.', prompts: 'Check address, pull-ups, wiring length, and compatible voltage domains.' },
  SPI: { signals: 'SCLK, MOSI, MISO, CS', roles: 'Clocked bus; chip-select identifies the peripheral.', prompts: 'Check mode, clock, pin mapping, and chip-select state.' },
};
function ProtocolCompare() {
  const [protocol, setProtocol] = useState<keyof typeof protocols>('I2C');
  const item = protocols[protocol];
  return <div className="w7-tool"><Heading slide={16} eyebrow="COMMUNICATION / INTERFACE ROLES" title="A protocol choice is a wiring and software contract." subtitle="Compare the interface your project actually uses. An interface label alone does not establish compatibility." tone="blue"/><div className="w7-protocol-layout"><div className="segmented-control">{(Object.keys(protocols) as (keyof typeof protocols)[]).map((name) => <button key={name} className={protocol === name ? 'is-active' : ''} onClick={() => setProtocol(name)}>{name}</button>)}</div><div className="w7-protocol-card"><div className="w7-protocol-badge"><Radio size={27}/><strong>{protocol}</strong></div><div><span>COMMON SIGNALS</span><b>{item.signals}</b></div><div><span>ROLE / CONTRACT</span><b>{item.roles}</b></div><div><span>FIRST CHECKS</span><b>{item.prompts}</b></div><small>Use the exact board and peripheral documentation. This comparison does not scan or validate a bus.</small></div></div></div>;
}

function CommsTroubleshoot() {
  const [symptom, setSymptom] = useState('No response from peripheral');
  const [layer, setLayer] = useState('');
  const answers: Record<string, string> = {
    'No response from peripheral': 'Check power/reference, pin map, protocol settings, address/chip-select, then code/library configuration.',
    'Corrupted or inconsistent values': 'Check shared reference and voltage levels, timing/baud or bus mode, wiring, and data framing.',
    'Works alone, fails when integrated': 'Review address or pin conflicts, initialization order, shared resources, and version changes.',
  };
  return <div className="w7-tool"><Heading slide={17} eyebrow="COMMUNICATION FAILURE / TRACE THE LAYERS" title="Troubleshoot from the physical path to the code." subtitle="Avoid replacing components or changing several settings at once. Record the symptom and one controlled check."/><div className="w7-troubleshoot"><div className="w7-controls"><label>Observed symptom<select value={symptom} onChange={(event) => { setSymptom(event.target.value); setLayer(''); }}>{Object.keys(answers).map((item) => <option key={item}>{item}</option>)}</select></label><div className="w7-layer-buttons">{['POWER / REFERENCE', 'PINS / WIRING', 'PROTOCOL', 'CODE / LIBRARY'].map((item) => <button key={item} className={layer === item ? 'is-selected' : ''} onClick={() => setLayer(item)}>{item}</button>)}</div></div><div className="w7-troubleshoot-result"><GitBranch size={24}/><span>CHECK ONE LAYER AT A TIME</span><strong>{layer || 'SELECT A LAYER TO CHECK'}</strong><p>{answers[symptom]}</p><small>Record the observation, not just the attempted action.</small></div></div></div>;
}

function WirelessBoundary() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = ['Wireless is required by a stated project requirement', 'Tutor-approved network and account are used', 'Credentials are not committed or shown in screenshots', 'Data collected is minimised and identified', 'Loss of connection has a defined local response'];
  const ready = items.every((item) => checks[item]);
  return <div className="w7-tool"><Heading slide={18} eyebrow="OPTIONAL ESP32 WIRELESS / DATA BOUNDARY" title="Do not add a network just to make the project sound advanced." subtitle="If the prototype is local-only, record that and exclude wireless-specific assets. If connected, identify data and access boundaries." tone="coral"/><div className="w7-wireless-layout"><div className="w7-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className={`w7-wireless-status ${ready ? 'is-ready' : ''}`}><LockKeyhole size={27}/><span>OPTIONAL CONNECTED DESIGN</span><strong>{ready ? 'REVIEW ITEMS COMPLETE' : 'VERIFY NEED AND BOUNDARY'}</strong><p>Never enter credentials into this presentation. Use approved secret storage and remove secrets from public logs.</p><small>Checklist completion is not a security approval.</small></div></div></div>;
}

function Maintainability() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const practices = ['Meaningful names for pins, thresholds, and states', 'Small functions with one clear purpose', 'Configuration constants gathered and explained', 'Input validation and output state visible in code', 'Version identifier and reproducible setup notes', 'Comments explain why, not repeat the statement'];
  const chosen = Object.values(checked).filter(Boolean).length;
  return <div className="w7-tool"><Heading slide={19} eyebrow="MAINTAINABLE SOFTWARE / REVIEW THE ACTUAL VERSION" title="Make the next change safer to understand." subtitle="Maintainability supports resilience: another teammate should be able to inspect, test, and recover the project." tone="blue"/><div className="w7-maintain-layout"><div className="w7-code-sample"><div><span>EXAMPLE / NOT PROJECT CODE</span><b>controller.cpp</b></div><pre><code>{`const int sensorPin = A0;
const int warningThreshold = 520;

bool isReadingPlausible(int value) {
  return value >= 0 && value <= 1023;
}

void setSafeState() {
  digitalWrite(statusLedPin, LOW);
  showFault("CHECK INPUT");
}`}</code></pre><small>Review names, limits, startup state, and the behavior when input is invalid.</small></div><div className="w7-checklist">{practices.map((practice) => <label key={practice}><input type="checkbox" checked={checked[practice] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [practice]: event.target.checked }))}/><span>{practice}</span></label>)}<p className="w7-progress-note">REVIEW PROMPTS {chosen} / {practices.length}</p></div></div></div>;
}

function ChangeControl() {
  const [version, setVersion] = useState('');
  const [issue, setIssue] = useState('');
  const [change, setChange] = useState('');
  const [tests, setTests] = useState('');
  const complete = [version, issue, change, tests].every((item) => item.trim());
  return <div className="w7-tool"><Heading slide={20} eyebrow="CHANGE CONTROL / TRACE THE BASELINE" title="A change without a retest can invalidate earlier evidence." subtitle="Keep the original symptom, changed file/version, reason, and affected tests together."/><div className="w7-change-layout"><div className="w7-controls"><label>Version / commit reference<input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="e.g. v1.2 or commit ID"/></label><label>Issue and supporting evidence<textarea rows={2} value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Observed problem and evidence ID"/></label><label>Change and rationale<textarea rows={2} value={change} onChange={(event) => setChange(event.target.value)} placeholder="One controlled change and why"/></label><label>Affected tests / retest result<textarea rows={2} value={tests} onChange={(event) => setTests(event.target.value)} placeholder="What was repeated and observed?"/></label></div><div className={`w7-change-state ${complete ? 'is-complete' : ''}`}><GitBranch size={27}/><span>CHANGE RECORD</span><strong>{complete ? 'RECORD FIELDS COMPLETE' : 'BASELINE → CHANGE → RETEST'}</strong><div className="w7-change-chain"><i>BASELINE</i><ArrowRight size={14}/><i>CHANGE</i><ArrowRight size={14}/><i>RETEST</i></div><small>Field completion does not prove a change is correct; review the code and evidence.</small></div></div></div>;
}

function TeamBoard() {
  const [roles, setRoles] = useState([
    { role: 'Risk register lead', owner: '', deliverable: 'Five scoped threats and ratings' },
    { role: 'Technical reviewer', owner: '', deliverable: 'Check controls against current design' },
    { role: 'Evidence curator', owner: '', deliverable: 'Link records, versions, and sources' },
    { role: 'Meeting facilitator', owner: '', deliverable: 'Decision notes and dated actions' },
  ]);
  const [handover, setHandover] = useState('');
  return <div className="w7-tool"><Heading slide={21} eyebrow="TEAM PRACTICE / OWNERSHIP + HANDOVER" title="Give each task an owner and a review path." subtitle="Roles can rotate. Record who contributed and how another team member can continue the work."/><div className="w7-team-board">{roles.map((item, index) => <label className="w7-role" key={item.role}><span>0{index + 1}</span><b>{item.role}</b><small>{item.deliverable}</small><input aria-label={`${item.role} owner`} value={item.owner} onChange={(event) => setRoles((current) => current.map((role, roleIndex) => roleIndex === index ? { ...role, owner: event.target.value } : role))} placeholder="Name / role"/></label>)}<label className="w7-handover">NEXT HANDOVER<textarea rows={2} value={handover} onChange={(event) => setHandover(event.target.value)} placeholder="What is done, what remains, evidence location, next owner"/></label></div><p className="w7-callout"><Users size={16}/> Record individual contribution as well as shared team outputs.</p></div>;
}

function DecisionLog() {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [owner, setOwner] = useState('');
  const [date, setDate] = useState('');
  const ready = [decision, reason, evidence, owner, date].every((item) => item.trim());
  return <div className="w7-tool"><Heading slide={22} eyebrow="TEAM DECISION / KEEP THE WHY" title="Make decisions and handovers easy to audit." subtitle="A short decision record prevents a teammate inheriting an unexplained risk-score or design change." tone="blue"/><div className="w7-decision-layout"><div className="w7-controls"><label>Decision<textarea rows={2} value={decision} onChange={(event) => setDecision(event.target.value)} placeholder="What did the team agree?"/></label><label>Reason and alternatives considered<textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why this choice; what was not selected?"/></label><div className="w7-two-fields"><label>Evidence reference<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Design/test/log ID"/></label><label>Owner<input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Action owner"/></label></div><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label></div><div className={`w7-decision-card ${ready ? 'is-ready' : ''}`}><ClipboardCheck size={27}/><span>DECISION RECORD</span><strong>{ready ? 'READY FOR TEAM REVIEW' : 'ADD REASON, EVIDENCE, OWNER, DATE'}</strong><p>{decision || 'Decision not recorded.'}</p><small>Keep the note with the project version it applies to.</small></div></div></div>;
}

function PeerReview() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const prompts = [
    ['Scope', "Does this threat apply to the team's current design?"],
    ['Rating', 'Are likelihood and impact supported by a stated reason?'],
    ['Control', 'Does the control address a named cause or consequence?'],
    ['Residual', 'Is the remaining risk and control limitation recorded?'],
    ['Evidence', 'Can another person locate the cited source/test/version?'],
  ];
  const complete = prompts.filter(([key]) => (answers[key] ?? '').trim()).length;
  return <div className="w7-tool"><Heading slide={23} eyebrow="PEER REVIEW / CHALLENGE THE CLAIM, NOT THE PERSON" title="A useful review asks for the missing evidence." subtitle="Review one team's risk row. Ask neutral questions, record the response, and name the action owner."/><div className="w7-review-layout"><div className="w7-review-prompts">{prompts.map(([key, prompt]) => <label key={key}><span>{key.toUpperCase()}</span><b>{prompt}</b><input value={answers[key] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))} placeholder="Note a finding or N/A with reason"/></label>)}</div><aside className="w7-review-state"><Users size={26}/><span>REVIEW NOTES</span><strong>{complete} / {prompts.length}</strong><p>Capture one strength, one question, and one action with an owner and date.</p></aside></div></div>;
}

function Logbook() {
  const [contribution, setContribution] = useState('');
  const [feedback, setFeedback] = useState('');
  const [learning, setLearning] = useState('');
  const [evidence, setEvidence] = useState('');
  return <div className="w7-tool"><Heading slide={24} eyebrow="INDIVIDUAL LOGBOOK / CONTINUE THE WEEKLY HABIT" title="Record your work in your own words." subtitle="Include a dated activity, your contribution, what changed in your understanding, evidence location, and next step."/><div className="w7-logbook-layout"><div className="w7-controls"><label>My contribution<textarea rows={3} value={contribution} onChange={(event) => setContribution(event.target.value)} placeholder="Specific task, decision, test, or review you completed"/></label><label>Feedback and response<textarea rows={2} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Feedback received and what you changed"/></label><label>Learning / remaining gap<textarea rows={2} value={learning} onChange={(event) => setLearning(event.target.value)} placeholder="What can you now explain? What remains uncertain?"/></label><label>Evidence location<input value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Filename, repository, page, or test reference"/></label></div><div className="w7-log-card"><BookOpen size={28}/><span>LOGBOOK PROMPT</span><strong>ACTIVITY → CONTRIBUTION → LEARNING → NEXT ACTION</strong><p>{contribution ? "Keep the entry specific enough that a reviewer can distinguish your work from the team's shared result." : 'Start with what you personally did, then link it to evidence.'}</p><small>Use the required course logbook format and date the final entry.</small></div></div></div>;
}

function CpdPlanner() {
  const [skill, setSkill] = useState('');
  const [action, setAction] = useState('');
  const [measure, setMeasure] = useState('');
  const [date, setDate] = useState('');
  const complete = [skill, action, measure, date].every((item) => item.trim());
  return <div className="w7-tool"><Heading slide={25} eyebrow="CPD / TURN A GAP INTO A DATED ACTION" title="Make the next development step measurable." subtitle="Choose one relevant skill gap, a specific learning activity, success evidence, and a target date." tone="blue"/><div className="w7-cpd-layout"><div className="w7-controls"><label>Skill gap<input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="e.g. explain I2C pull-up requirements"/></label><label>Action<textarea rows={2} value={action} onChange={(event) => setAction(event.target.value)} placeholder="What will you read, practise, or ask?"/></label><label>Success evidence<input value={measure} onChange={(event) => setMeasure(event.target.value)} placeholder="A diagram, worked example, or demonstrated skill"/></label><label>Target date<input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label></div><div className={`w7-cpd-card ${complete ? 'is-complete' : ''}`}><Activity size={27}/><span>SMART ACTION</span><strong>{complete ? 'ACTION IS SPECIFIC AND DATED' : 'SKILL → ACTION → EVIDENCE → DATE'}</strong><p>{skill || 'Name a current gap.'}</p><small>Review the outcome in your next logbook entry; update the date if circumstances change.</small></div></div></div>;
}

function EvidenceClinic() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = ['Asset list and system boundary reflect the actual prototype', 'At least five relevant threats have causes and consequences', 'Initial and residual L/I ratings include reasons', 'Selected controls and their limitations are stated', 'Safe-state and recovery behavior has an owner/test reference', 'Team decisions, roles, and handovers are traceable', 'Individual logbook and dated CPD action are up to date'];
  const count = Object.values(checks).filter(Boolean).length;
  return <div className="w7-tool"><Heading slide={26} eyebrow="A002 / TASK 2.1 + TASK 2.3" title="Leave with evidence gaps assigned, not vague." subtitle="Turn every incomplete item into a named next action, owner, and due date." tone="blue"/><div className="w7-evidence-layout"><div className="w7-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w7-evidence-card"><FileText size={28}/><span>PORTFOLIO CHECK</span><strong>{count} / {items.length}</strong><p>Link the risk register, control rationale, safe-state review, team decision record, and individual logbook.</p><small>Keep example content separate from evidence about your project.</small></aside></div><p className="w7-callout"><AlertTriangle size={16}/> A numeric risk score is not proof of control effectiveness or certification.</p></div>;
}

function ExitTicket() {
  const questions = [
    { prompt: 'What does L × I provide?', options: ['A prioritisation aid with reasoned ratings', 'A precise probability', 'A safety certificate'], answer: 0 },
    { prompt: 'When should a network threat be included?', options: ['For every microcontroller', 'When a network path exists or is planned', 'Never'], answer: 1 },
    { prompt: 'What makes a control claim stronger?', options: ['A test/evidence reference and stated limitation', 'A high score alone', 'A screenshot without context'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={27} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Name the risk.<br/><span className="text-blue">Show the evidence.</span></>} subtitle="Check the risk and teamwork ideas, then identify one A002 action to finish." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>ONE A002 ACTION / OWNER / DATE</span><textarea rows={2} placeholder="Name the missing evidence, who will complete it, and by when"/></label></div></div>;
}

export default App;
