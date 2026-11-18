import { useEffect, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, Check,
  ClipboardCheck, Cpu, Download, Expand, FileText,
  Lightbulb, Pause, Play, RotateCcw, ShieldCheck, Sparkles,
  Target, Users,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';
const DRAFT_PREFIX = 'eee4015-week09-draft-';
const slideNames = [
  'Start here', 'The session route', 'From tests to defensible evaluation', 'Evidence, inference, and future work',
  'Rebuild the baseline before judging', 'Compare objectives with outcomes', 'Write one evaluation paragraph',
  'Evaluation matrix / four claims', 'Find and explain project variances', 'Trace a root cause',
  'Judge performance and robustness', 'State limitations without making excuses', 'Evaluate residual security risk',
  'Write recommendations that follow evidence', 'Prioritise impact against effort', 'Control a refinement',
  'Plan affected and regression tests', 'Compare before and after responsibly', 'Build the operator guide',
  'Rehearse the demonstration and fallback', 'Evaluate team decisions and handovers', 'Write your individual contribution',
  'Turn feedback into reflection', 'Draft a SMART development action', 'Peer-review an evaluation claim',
  'Check portfolio consistency', 'Export your coursework working draft', 'Exit ticket',
];
const slideDurations = [5, 5, 10, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 20, 15, 20, 20, 25, 15, 15, 15, 15, 15, 15, 15, 15, 15, 5];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 }, { name: 'EVALUATION', index: 4 },
  { name: 'REFINE', index: 13 }, { name: 'COMMUNICATE', index: 18 },
  { name: 'REFLECT', index: 20 }, { name: 'EVIDENCE', index: 25 },
];
const requirements = [
  { id: 'FR-01', label: 'Sensor value is read and displayed with units.' },
  { id: 'FR-02', label: 'Output follows the agreed threshold rule.' },
  { id: 'FR-03', label: 'Manual/test mode is visibly distinct.' },
  { id: 'FR-04', label: 'Invalid input produces the agreed safe response.' },
];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
function chapterAt(index: number) { for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor; return 0; }
function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) { return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot"/>{children}</p>; }
function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) { return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week9-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>; }

function useDraftValue(key: string, initial = ''): [string, Dispatch<SetStateAction<string>>] {
  const storageKey = `${DRAFT_PREFIX}${key}`;
  const [dirty, setDirty] = useState(false);
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(storageKey) ?? initial; } catch { return initial; }
  });
  const setDraftValue: Dispatch<SetStateAction<string>> = (nextValue) => {
    setDirty(true);
    setValue(nextValue);
  };
  useEffect(() => {
    if (!dirty) return;
    try {
      if (value) window.localStorage.setItem(storageKey, value);
      else window.localStorage.removeItem(storageKey);
    } catch { /* Local draft storage may be unavailable in private browsing. */ }
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
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); setSlide((value) => Math.min(slideNames.length - 1, value + 1)); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); setSlide((value) => Math.max(0, value - 1)); }
      if (event.key === 'Home') setSlide(0);
      if (event.key === 'End') setSlide(slideNames.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { document.title = `EEE4015 / Week 09 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; window.scrollTo({ top: 0, behavior: 'auto' }); }, [slide]);
  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar"><div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21}/></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div><div className="topbar-center"><span className="week-tag">WEEK 09</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsedAt(slide))}<i>/</i>{formatTime(totalMinutes)}</b></span></div><div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div></header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsedAt(slide))} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}><div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div><AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week9-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence></main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(1)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <Concept slide={2} eyebrow="A002 / TASK 2.2 → 2.3" title="Turn tested behavior into an engineering judgement." subtitle="Evaluation compares results against objectives, explains differences, states limits, and justifies what should change next." tone="blue" visual="evidence" points={[["Describe","State the requirement, target, setup, and actual result.","Keep the observation distinct from interpretation."],["Evaluate","Judge met/partial/not met and explain why.","Use the test, version, conditions, and evidence reference."],["Recommend","Propose a feasible next change and a way to verify it.","Separate completed work from future work."]]} takeaway="An evaluation claim needs a result, evidence, and reasoning."/>;
    case 3: return <EvidenceLadder/>;
    case 4: return <BaselineBuilder/>;
    case 5: return <ObjectiveReview/>;
    case 6: return <EvaluationParagraph/>;
    case 7: return <EvaluationMatrix/>;
    case 8: return <VarianceAnalysis/>;
    case 9: return <RootCause/>;
    case 10: return <PerformanceReview/>;
    case 11: return <LimitationsBuilder/>;
    case 12: return <SecurityEvaluation/>;
    case 13: return <RecommendationBuilder/>;
    case 14: return <PriorityMatrix/>;
    case 15: return <ChangeControl/>;
    case 16: return <RegressionPlan/>;
    case 17: return <ComparisonChart/>;
    case 18: return <OperatorGuide/>;
    case 19: return <DemoRehearsal/>;
    case 20: return <TeamEvaluation/>;
    case 21: return <Contribution/>;
    case 22: return <Reflection/>;
    case 23: return <CpdAction/>;
    case 24: return <PeerReview/>;
    case 25: return <PortfolioCheck/>;
    case 26: return <DraftExport/>;
    case 27: return <ExitTicket/>;
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w9-welcome"><div className="w9-welcome__copy"><Eyebrow>FIELD NOTES / 09</Eyebrow><h1 id="week9-title-0">Make the evidence<br/><span>say something.</span></h1><p>Turn your own A002 results into a clear evaluation, justified refinements, and a coursework draft you can defend.</p><div className="w9-meta"><span><b>28</b> SLIDES</span><span><b>{totalMinutes}</b> MINUTES</span><span><b>A002</b> TASKS 2.2 + 2.3</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w9-hero"><svg viewBox="0 0 640 360" role="img" aria-labelledby="w9-hero-title w9-hero-desc"><title id="w9-hero-title">Evidence becomes engineering judgement</title><desc id="w9-hero-desc">A project requirement flows to a tested result, a supported judgement, and a justified next action.</desc><path className="w9-hero-track" d="M92 181 H548"/><path className="w9-hero-feedback" d="M535 212 C480 310 180 310 112 212"/><g className="w9-hero-node w9-hero-node--1"><circle cx="92" cy="181" r="37"/><text x="92" y="178" textAnchor="middle">PLAN</text><text x="92" y="196" textAnchor="middle">TARGET</text></g><g className="w9-hero-node w9-hero-node--2"><circle cx="205" cy="181" r="31"/><text x="205" y="185" textAnchor="middle">TEST</text></g><g className="w9-hero-node w9-hero-node--3"><circle cx="320" cy="181" r="43"/><text x="320" y="177" textAnchor="middle">RESULT</text><text x="320" y="195" textAnchor="middle">EVIDENCE</text></g><g className="w9-hero-node w9-hero-node--4"><circle cx="435" cy="181" r="31"/><text x="435" y="185" textAnchor="middle">JUDGE</text></g><g className="w9-hero-node w9-hero-node--5"><circle cx="548" cy="181" r="37"/><text x="548" y="178" textAnchor="middle">NEXT</text><text x="548" y="196" textAnchor="middle">ACTION</text></g><text className="w9-hero-label" x="320" y="48" textAnchor="middle">CLAIM • EVIDENCE • REASONING</text><text className="w9-hero-feedback-label" x="320" y="324" textAnchor="middle">REFINE → RETEST → UPDATE THE EVALUATION</text></svg><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 EVALUATION POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Evaluate results against objectives</div><div><Check size={16}/> Justify one feasible improvement</div><div><Check size={16}/> Prepare a defensible demonstration</div></div></div>;
}

function Agenda() {
  const blocks = [
    ['00:00–01:45', 'Concept + writing model', 'Change control, evaluation claims, limitations, and recommendations'],
    ['01:45–05:45', 'Supervised refinement', 'Prioritise changes, update versions, rerun affected/regression tests, check guide'],
    ['05:45–06:45', 'Portfolio + demonstration clinic', 'Peer review, contribution, CPD, and safe fallback rehearsal'],
  ];
  return <div className="w9-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Write from evidence. Refine with control." subtitle="The coursework workshop moves between your test evidence, engineering judgement, a justified next action, and a safe demonstration plan."/><div className="w9-agenda-flow">{blocks.map(([time, title, detail], index) => <article key={title}><span>0{index + 1}</span><b>{time}</b><h2>{title}</h2><p>{detail}</p></article>)}</div><p className="w9-callout"><AlertTriangle size={16}/> Do not overwrite original results. Version each refinement and rerun tests affected by the change.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function Concept({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w9-concept"><div className="w9-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span>{slideDurations[slide]} MIN</span></div><div className="w9-concept__body"><div className="w9-points">{points.map(([head, body, example], index) => <article className="w9-point" key={head}><span>0{index + 1}</span><div><h2>{head}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><Visual kind={visual}/></div><div className="w9-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function Visual({ kind }: { kind: string }) {
  const data: Record<string, [string, string[]]> = {
    evidence: ['CLAIM → EVIDENCE → JUDGEMENT', ['REQUIREMENT', 'RESULT', 'REASON', 'JUDGEMENT']],
    change: ['CHANGE CONTROL', ['BASELINE', 'CHANGE', 'REGRESSION', 'RETEST']],
    writing: ['EVALUATION PARAGRAPH', ['TARGET', 'OBSERVED', 'LIMIT', 'NEXT']],
  };
  const [heading, nodes] = data[kind] ?? data.evidence;
  return <figure className="w9-visual"><div className="w9-visual__heading">{heading}<i>W09</i></div><div className="w9-flow">{nodes.map((node, index) => <div key={node} className={`w9-flow-node w9-flow-node--${index}`}><b>{node}</b><small>{['define', 'compare', 'interpret', 'justify'][index]}</small></div>)}</div><figcaption>Build every coursework claim from your own project record.</figcaption></figure>;
}

function EvidenceLadder() {
  const [level, setLevel] = useState(0);
  const steps = [
    ['OBSERVATION', 'What did the test actually show?', 'Result ID, date, setup, instrument, code version.'],
    ['INTERPRETATION', 'What does that result mean against the target?', 'Compare the observed value/state with the acceptance criterion.'],
    ['LIMITATION', 'What could affect confidence or scope?', 'Sample size, uncertainty, conditions, untested cases.'],
    ['JUDGEMENT', 'What is your defensible conclusion?', 'Met / partially met / not met, with evidence and reasoning.'],
  ];
  return <div className="w9-tool"><Heading slide={3} eyebrow="EVALUATION / BUILD IN EVIDENCE ORDER" title="Keep observation separate from judgement." subtitle="A coursework paragraph becomes stronger when the reader can see which statements are measured facts, interpretations, limitations, and conclusions." tone="blue"/><div className="w9-ladder-layout"><div className="w9-ladder-rail">{steps.map(([title], index) => <button key={title} className={index === level ? 'is-active' : index < level ? 'is-done' : ''} onClick={() => setLevel(index)}><span>0{index + 1}</span><b>{title}</b><i>{index < level ? <Check size={14}/> : <ArrowRight size={14}/>}</i></button>)}</div><div className="w9-ladder-detail"><span>WRITING QUESTION / {steps[level][0]}</span><h2>{steps[level][1]}</h2><p>{steps[level][2]}</p><div className="w9-source-tags"><i>MEASURED</i><i>INFERRED</i><i>LIMITATION</i><i>FUTURE WORK</i></div></div></div></div>;
}

function BaselineBuilder() {
  const [objective, setObjective] = useDraftValue('baseline-objective');
  const [target, setTarget] = useDraftValue('baseline-target');
  const [baseline, setBaseline] = useDraftValue('baseline-version');
  const [evidence, setEvidence] = useDraftValue('baseline-evidence');
  return <div className="w9-tool"><Heading slide={4} eyebrow="BASELINE / WHAT DID YOU PLAN TO ACHIEVE?" title="Recover the original target before evaluating." subtitle="Use the initial requirement/objective and design version, not a target rewritten after you saw the result."/><div className="w9-writing-layout"><div className="w9-controls"><DraftArea label="Original objective / requirement" value={objective} onChange={setObjective} placeholder="Use the reviewed objective and ID"/><DraftArea label="Target / acceptance limit" value={target} onChange={setTarget} placeholder="Value, range, response, or observable state"/><DraftInput label="Baseline version / date" value={baseline} onChange={setBaseline} placeholder="Design/code version and date"/><DraftInput label="Evidence reference" value={evidence} onChange={setEvidence} placeholder="Requirement, plan, test case, file"/></div><aside className="w9-baseline-card"><span>BASELINE SNAPSHOT</span><strong>{objective || 'Objective not entered'}</strong><p>TARGET: {target || 'not stated'}</p><p>VERSION: {baseline || 'not recorded'}</p><small>Evidence: {evidence || 'reference needed'}</small></aside></div></div>;
}

function ObjectiveReview() {
  const rows = [
    { key: 'fr01', id: 'FR-01', name: 'Sensor reading with units' },
    { key: 'fr02', id: 'FR-02', name: 'Threshold output rule' },
    { key: 'fr03', id: 'FR-03', name: 'Manual/test mode indicator' },
    { key: 'fr04', id: 'FR-04', name: 'Invalid-input safe response' },
  ];
  const [draft, setDraft] = useDraftValue('objective-review', JSON.stringify(rows.map((row) => ({ ...row, judgement: '', evidence: '' }))));
  const saved = parseDraftArray(draft, rows.map((row) => ({ ...row, judgement: '', evidence: '' })));
  const reviewed = saved.filter((row) => row.judgement && row.evidence.trim()).length;
  const update = (key: string, field: 'judgement' | 'evidence', value: string) => setDraft(JSON.stringify(saved.map((row) => row.key === key ? { ...row, [field]: value } : row)));
  return <div className="w9-tool"><Heading slide={5} eyebrow="OBJECTIVE REVIEW / CLAIM EACH REQUIREMENT" title="Say what was met, partly met, or not met." subtitle="A status without evidence is only an assertion. Choose a judgement and add the test/result reference that supports it." tone="blue"/><div className="w9-objective-list">{saved.map((row) => <article key={row.key}><span>{row.id}</span><b>{row.name}</b><select aria-label={`${row.id} judgement`} value={row.judgement} onChange={(event) => update(row.key, 'judgement', event.target.value)}><option value="">Choose judgement</option><option>Met</option><option>Partially met</option><option>Not met</option><option>Not tested</option></select><input aria-label={`${row.id} evidence reference`} value={row.evidence} onChange={(event) => update(row.key, 'evidence', event.target.value)} placeholder="Evidence / test ID"/></article>)}</div><p className="w9-progress-line">SUPPORTED JUDGEMENTS {reviewed} / {rows.length}</p></div>;
}

function EvaluationParagraph() {
  const [requirement, setRequirement] = useDraftValue('evaluation-requirement');
  const [target, setTarget] = useDraftValue('evaluation-target');
  const [observed, setObserved] = useDraftValue('evaluation-observed');
  const [reason, setReason] = useDraftValue('evaluation-reason');
  const [limitation, setLimitation] = useDraftValue('evaluation-limitation');
  const [judgement, setJudgement] = useDraftValue('evaluation-judgement');
  const fields = [requirement, target, observed, reason, limitation, judgement];
  const populated = fields.filter((field) => field.trim()).length;
  const draft = [
    requirement && `For ${requirement}, the target was ${target || '[state target]'}.`,
    observed && `The recorded result was ${observed}.`,
    reason && `This indicates ${reason}.`,
    limitation && `Confidence is limited by ${limitation}.`,
    judgement && `Therefore, this requirement is judged ${judgement}.`,
  ].filter(Boolean).join(' ');
  return <div className="w9-tool"><Heading slide={6} eyebrow="DRAFT BUILDER / CLAIM → EVIDENCE → REASONING" title="Build one paragraph from your actual result." subtitle="This is a scaffold, not a submission-ready answer. Replace placeholders, cite your evidence, and keep your own voice." tone="blue"/><div className="w9-paragraph-layout"><div className="w9-controls"><DraftInput label="Requirement ID" value={requirement} onChange={setRequirement} placeholder="FR-xx"/><DraftInput label="Target / acceptance limit" value={target} onChange={setTarget} placeholder="What should have happened?"/><DraftArea label="Observed result + evidence reference" value={observed} onChange={setObserved} placeholder="Actual result and test/data ID"/><DraftArea label="Interpretation / why it matters" value={reason} onChange={setReason} placeholder="Compare with target; explain the engineering meaning"/><DraftArea label="Limitation / confidence" value={limitation} onChange={setLimitation} placeholder="Sample size, uncertainty, environment, scope"/><DraftInput label="Judgement" value={judgement} onChange={setJudgement} placeholder="met / partially met / not met"/></div><aside className="w9-paragraph-preview"><span>DRAFT PREVIEW / {populated} OF 6 ELEMENTS</span><div className="w9-paragraph-meter"><i style={{ width: `${(populated / 6) * 100}%` }}/></div><p>{draft || 'Your paragraph scaffold will assemble here as you write.'}</p><small>Check every statement against your own evidence; do not retain bracketed placeholder text.</small></aside></div></div>;
}

function EvaluationMatrix() {
  const initialRows = requirements.map((requirement) => ({ id: requirement.id, objective: requirement.label, target: '', result: '', judgement: '', evidence: '', limit: '' }));
  const [draft, setDraft] = useDraftValue('evaluation-matrix', JSON.stringify(initialRows));
  const rows = parseDraftArray(draft, initialRows);
  const update = (index: number, field: 'target' | 'result' | 'judgement' | 'evidence' | 'limit', value: string) => setDraft(JSON.stringify(rows.map((row, i) => i === index ? { ...row, [field]: value } : row)));
  return <div className="w9-tool"><Heading slide={7} eyebrow="COURSEWORK TABLE / FOUR EVALUATION CLAIMS" title="Turn the requirement list into an evaluation matrix." subtitle="This is a writing workspace. Replace example requirement wording with your own and link each judgement to the test evidence."/><div className="w9-eval-table-wrap"><table className="w9-eval-table"><caption>Drafting matrix / local autosave</caption><thead><tr><th>REQUIREMENT</th><th>TARGET</th><th>RESULT</th><th>JUDGEMENT</th><th>EVIDENCE + LIMITATION</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><th><b>{row.id}</b><small>{row.objective}</small></th><td><textarea aria-label={`${row.id} target`} value={row.target} onChange={(event) => update(index, 'target', event.target.value)} placeholder="Acceptance limit"/></td><td><textarea aria-label={`${row.id} result`} value={row.result} onChange={(event) => update(index, 'result', event.target.value)} placeholder="Actual result"/></td><td><select aria-label={`${row.id} judgement`} value={row.judgement} onChange={(event) => update(index, 'judgement', event.target.value)}><option value="">Select</option><option>Met</option><option>Partially met</option><option>Not met</option><option>Not tested</option></select></td><td><textarea aria-label={`${row.id} evidence and limitation`} value={row.evidence} onChange={(event) => update(index, 'evidence', event.target.value)} placeholder="Evidence ID; limitation"/><DraftInput label="" value={row.limit} onChange={(value) => update(index, 'limit', value)} placeholder="Further limitation" compact/></td></tr>)}</tbody></table></div><p className="w9-subtle">Use a separate paragraph to explain the most important success, shortfall, and technical trade-off.</p></div>;
}

function VarianceAnalysis() {
  const categories = ['Scope', 'Schedule', 'Performance', 'Risk / availability'];
  const [selected, setSelected] = useState('Performance');
  const [planned, setPlanned] = useDraftValue('variance-planned');
  const [actual, setActual] = useDraftValue('variance-actual');
  const [cause, setCause] = useDraftValue('variance-cause');
  const [impact, setImpact] = useDraftValue('variance-impact');
  return <div className="w9-tool"><Heading slide={8} eyebrow="VARIANCE ANALYSIS / PLAN VS ACTUAL" title="Describe the difference before explaining its cause." subtitle="Choose a variance category, then connect plan, actual outcome, evidence, root cause, and project impact." tone="blue"/><div className="w9-variance-layout"><div className="w9-variance-types">{categories.map((category, index) => <button key={category} className={selected === category ? 'is-active' : ''} onClick={() => setSelected(category)}><span>0{index + 1}</span><b>{category}</b></button>)}</div><div className="w9-controls"><DraftArea label={`${selected} / planned`} value={planned} onChange={setPlanned} placeholder="What did the plan or objective state?"/><DraftArea label={`${selected} / actual + evidence`} value={actual} onChange={setActual} placeholder="What happened? Add result/test reference"/><DraftArea label="Root cause / supporting evidence" value={cause} onChange={setCause} placeholder="Why did it differ? What evidence supports this?"/><DraftArea label="Impact on objectives / next work" value={impact} onChange={setImpact} placeholder="Scope, schedule, performance, risk, or evidence effect"/></div></div></div>;
}

function RootCause() {
  const [symptom, setSymptom] = useDraftValue('root-symptom');
  const [observations, setObservations] = useDraftValue('root-observations');
  const [cause, setCause] = useDraftValue('root-cause');
  const [test, setTest] = useDraftValue('root-discriminating-test');
  const steps = [
    ['SYMPTOM', symptom || 'State the observed deviation'],
    ['EVIDENCE', observations || 'What record supports the symptom?'],
    ['LIKELY CAUSE', cause || 'One plausible cause, not a guess list'],
    ['CHECK', test || 'What safe test distinguishes this cause?'],
  ];
  return <div className="w9-tool"><Heading slide={9} eyebrow="ROOT CAUSE / FOLLOW THE EVIDENCE" title="Avoid jumping from symptom straight to solution." subtitle="A causal explanation should be supported by observations and a check that distinguishes it from alternatives."/><div className="w9-root-layout"><div className="w9-controls"><DraftInput label="Observed symptom" value={symptom} onChange={setSymptom} placeholder="What did not match the target?"/><DraftArea label="Observations / evidence" value={observations} onChange={setObservations} placeholder="Test ID, measurements, logs, setup"/><DraftArea label="Likely cause" value={cause} onChange={setCause} placeholder="What mechanism could produce this result?"/><DraftArea label="Discriminating check" value={test} onChange={setTest} placeholder="What safe test would support or reject the cause?"/></div><div className="w9-cause-chain">{steps.map(([label, text], index) => <article key={label} className={`w9-cause-step w9-cause-step--${index}`}><span>0{index + 1}</span><b>{label}</b><p>{text}</p>{index < steps.length - 1 && <ArrowDown size={16}/>}</article>)}</div></div></div>;
}

function PerformanceReview() {
  const [metric, setMetric] = useDraftValue('performance-metric', 'Response time');
  const [unit, setUnit] = useDraftValue('performance-unit', 'ms');
  const [baseline, setBaseline] = useDraftValue('performance-baseline');
  const [refined, setRefined] = useDraftValue('performance-refined');
  const [target, setTarget] = useDraftValue('performance-target');
  const before = Number(baseline);
  const after = Number(refined);
  const valid = baseline.trim() !== '' && refined.trim() !== '' && Number.isFinite(before) && Number.isFinite(after);
  const change = valid && before !== 0 ? ((after - before) / Math.abs(before)) * 100 : null;
  return <div className="w9-tool"><Heading slide={10} eyebrow="PERFORMANCE / USE MATCHED CONDITIONS" title="Compare like with like, and keep the units visible." subtitle="Only enter comparable baseline and refined values from your records. Do not treat the illustrative axes as measured results." tone="blue"/><div className="w9-performance-layout"><div className="w9-controls"><DraftInput label="Metric" value={metric} onChange={setMetric} placeholder="Response time, noise, failures"/><DraftInput label="Units" value={unit} onChange={setUnit} placeholder="ms, counts, trials"/><DraftInput label="Acceptance target" value={target} onChange={setTarget} placeholder="Requirement limit"/><div className="w9-two-fields"><DraftInput label="Baseline result" value={baseline} onChange={setBaseline} placeholder="Original version"/><DraftInput label="Refined result" value={refined} onChange={setRefined} placeholder="New version"/></div><p className="w9-subtle">Match setup, input, sample count, and measurement method before comparing.</p></div><div className="w9-comparison-visual"><span>{valid ? 'ENTERED VALUES / USER-PROVIDED' : 'AWAITING YOUR PROJECT DATA'}</span><div className="w9-bar-pair"><div><b>BASELINE</b><i style={{ width: valid ? `${clamp((before / Math.max(before, after, 1)) * 100, 8, 100)}%` : '32%' }}/><strong>{valid ? `${baseline} ${unit}` : 'not entered'}</strong></div><div><b>REFINED</b><i style={{ width: valid ? `${clamp((after / Math.max(before, after, 1)) * 100, 8, 100)}%` : '32%' }}/><strong>{valid ? `${refined} ${unit}` : 'not entered'}</strong></div></div><p>{change === null ? 'Change is calculated only after both values are entered and baseline is non-zero.' : `Relative change: ${change.toFixed(1)}%. Explain whether this is better for the requirement.`}</p><small>Direction of improvement depends on the metric. A lower value is not always better.</small></div></div></div>;
}

function LimitationsBuilder() {
  const [limitation, setLimitation] = useDraftValue('limit-description');
  const [cause, setCause] = useDraftValue('limit-cause');
  const [effect, setEffect] = useDraftValue('limit-effect');
  const [mitigation, setMitigation] = useDraftValue('limit-mitigation');
  const draft = [
    limitation && `A limitation is ${limitation}.`,
    cause && `This arises because ${cause}.`,
    effect && `It affects interpretation by ${effect}.`,
    mitigation && `A proportionate next step is ${mitigation}.`,
  ].filter(Boolean).join(' ');
  return <div className="w9-tool"><Heading slide={11} eyebrow="LIMITATIONS / SPECIFIC, NOT DEFENSIVE" title="State the limit, its cause, and its effect." subtitle="A limitation does not erase useful results. Explain what confidence or scope it affects, and how future work could address it." tone="blue"/><div className="w9-writing-layout"><div className="w9-controls"><DraftArea label="Limitation" value={limitation} onChange={setLimitation} placeholder="Sample count, sensor placement, calibration, environment..."/><DraftArea label="Cause" value={cause} onChange={setCause} placeholder="Why is this limitation present?"/><DraftArea label="Effect on the conclusion" value={effect} onChange={setEffect} placeholder="Which claim is less certain or out of scope?"/><DraftArea label="Mitigation / future test" value={mitigation} onChange={setMitigation} placeholder="A feasible next action and how it would be checked"/></div><aside className="w9-paragraph-preview"><span>LIMITATION PARAGRAPH / WORKING DRAFT</span><p>{draft || 'Complete the prompts to assemble a limitation paragraph scaffold.'}</p><small>Replace generic language with the actual conditions and evidence in your project.</small></aside></div></div>;
}

function SecurityEvaluation() {
  const [risk, setRisk] = useDraftValue('security-risk');
  const [control, setControl] = useDraftValue('security-control');
  const [evidence, setEvidence] = useDraftValue('security-evidence');
  const [residual, setResidual] = useDraftValue('security-residual');
  return <div className="w9-tool"><Heading slide={12} eyebrow="SECURITY / RESIDUAL RISK FROM WEEK 7" title="Evaluate the control, not just the risk score." subtitle="State the risk and control assumption, then connect your remaining-risk judgement to test/review evidence." tone="coral"/><div className="w9-security-layout"><div className="w9-controls"><DraftArea label="Risk / scenario" value={risk} onChange={setRisk} placeholder="Use the team's risk-register wording"/><DraftArea label="Control applied + limitation" value={control} onChange={setControl} placeholder="What control exists, and what can it not prevent?"/><DraftInput label="Evidence / verification reference" value={evidence} onChange={setEvidence} placeholder="Test ID, review, version"/><DraftArea label="Residual risk judgement" value={residual} onChange={setResidual} placeholder="What remains, under which assumptions?"/></div><aside className="w9-security-diagram"><ShieldCheck size={28}/><span>CLAIM BOUNDARY</span><div><i>CLASSROOM PROTOTYPE</i><ArrowRight size={15}/><i>CONTROL EVIDENCE</i><ArrowRight size={15}/><i>RESIDUAL RISK</i></div><strong>Do not claim production certification.</strong><p>Identify controls needed for real installation that are outside this prototype's scope.</p></aside></div></div>;
}

function RecommendationBuilder() {
  const [issue, setIssue] = useDraftValue('recommend-issue');
  const [evidence, setEvidence] = useDraftValue('recommend-evidence');
  const [change, setChange] = useDraftValue('recommend-change');
  const [verification, setVerification] = useDraftValue('recommend-verify');
  const [priority, setPriority] = useState('Essential correction');
  const draft = [issue && `Because ${issue}`, evidence && `as shown by ${evidence}`, change && `I recommend ${change}`, verification && `and would verify this by ${verification}`].filter(Boolean).join(', ');
  return <div className="w9-tool"><Heading slide={13} eyebrow="RECOMMENDATION / SPECIFIC + EVIDENCE-LED" title="Recommend a change that answers a demonstrated issue." subtitle="Distinguish a requirement-breaking or safety-relevant correction from an optional enhancement." tone="blue"/><div className="w9-recommend-layout"><div className="w9-controls"><DraftArea label="Issue / requirement gap" value={issue} onChange={setIssue} placeholder="What needs improvement?"/><DraftInput label="Evidence" value={evidence} onChange={setEvidence} placeholder="Test result, variance, reviewer note"/><DraftArea label="Proposed change + reason" value={change} onChange={setChange} placeholder="Feasible modification and why it addresses the issue"/><DraftArea label="Verification after change" value={verification} onChange={setVerification} placeholder="Affected test and expected evidence"/><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option>Essential correction</option><option>High-value refinement</option><option>Optional enhancement</option><option>Future work</option></select></label></div><aside className="w9-rec-preview"><span>RECOMMENDATION / {priority.toUpperCase()}</span><strong>{draft || 'Build a recommendation from an evidenced issue.'}</strong><div className="w9-mini-flow"><i>ISSUE</i><ArrowRight size={14}/><i>CHANGE</i><ArrowRight size={14}/><i>TEST</i></div></aside></div></div>;
}

function PriorityMatrix() {
  const [items, setItems] = useState([
    { name: 'Fix threshold equality ambiguity', impact: 4, effort: 2, checked: false },
    { name: 'Improve dashboard layout', impact: 2, effort: 2, checked: false },
    { name: 'Add a second sensor', impact: 3, effort: 4, checked: false },
    { name: 'Document safe startup', impact: 4, effort: 1, checked: false },
  ]);
  const update = (index: number, field: 'impact' | 'effort', value: number) => setItems((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  const choose = (index: number) => setItems((current) => current.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  return <div className="w9-tool"><Heading slide={14} eyebrow="PRIORITISATION / IMPACT × EFFORT" title="Spend the remaining build time on the right change." subtitle="Plot your own improvements. Safety and requirement-breaking issues take priority even if effort is high."/><div className="w9-priority-layout"><div className="w9-matrix-board"><div className="w9-matrix-axis-y">IMPACT</div><div className="w9-matrix-grid">{items.map((item, index) => <button key={item.name} className={`w9-matrix-dot w9-matrix-dot--${index} ${item.checked ? 'is-selected' : ''}`} style={{ left: `${18 + item.effort * 15}%`, bottom: `${12 + item.impact * 16}%` }} onClick={() => choose(index)} title={`${item.name}: impact ${item.impact}, effort ${item.effort}`}><span>{item.name}</span></button>)}</div><div className="w9-matrix-axis-x">LOW EFFORT <span>EFFORT</span> HIGH EFFORT</div><div className="w9-matrix-quadrant">HIGH IMPACT / LOW EFFORT</div></div><div className="w9-priority-list">{items.map((item, index) => <article key={item.name}><button className={item.checked ? 'is-selected' : ''} onClick={() => choose(index)}><Check size={14}/>{item.name}</button><label>Impact<select value={item.impact} onChange={(event) => update(index, 'impact', Number(event.target.value))}>{[1,2,3,4,5].map((n) => <option key={n}>{n}</option>)}</select></label><label>Effort<select value={item.effort} onChange={(event) => update(index, 'effort', Number(event.target.value))}>{[1,2,3,4,5].map((n) => <option key={n}>{n}</option>)}</select></label></article>)}</div></div></div>;
}

function ChangeControl() {
  const [version, setVersion] = useDraftValue('change-version');
  const [issue, setIssue] = useDraftValue('change-issue');
  const [evidence, setEvidence] = useDraftValue('change-evidence');
  const [change, setChange] = useDraftValue('change-description');
  const [reason, setReason] = useDraftValue('change-reason');
  const [decision, setDecision] = useState('Proposed');
  return <div className="w9-tool"><Heading slide={15} eyebrow="CHANGE CONTROL / PRESERVE THE ORIGINAL" title="Record why this revision exists." subtitle="Keep the original baseline and failed result. Identify the changed files/design and link the reason to evidence." tone="blue"/><div className="w9-change-layout"><div className="w9-controls"><DraftInput label="New version / date" value={version} onChange={setVersion} placeholder="v1.1 / date / commit"/><DraftInput label="Issue / requirement affected" value={issue} onChange={setIssue} placeholder="FR-xx, test ID"/><DraftInput label="Evidence reference" value={evidence} onChange={setEvidence} placeholder="Result, photo, log, review"/><DraftArea label="Change made" value={change} onChange={setChange} placeholder="What changed in code, design, or configuration?"/><DraftArea label="Reason / expected effect" value={reason} onChange={setReason} placeholder="How does the change address the issue?"/><label>Change status<select value={decision} onChange={(event) => setDecision(event.target.value)}><option>Proposed</option><option>Approved for supervised test</option><option>Implemented</option><option>Rejected / deferred</option></select></label></div><div className="w9-change-flow"><div><span>BASELINE</span><b>Original result retained</b></div><ArrowRight size={18}/><div><span>REVISION</span><b>{version || 'New version ID'}</b></div><ArrowRight size={18}/><div><span>STATUS</span><b>{decision}</b></div><small>Do not edit past results to make the revision appear to have passed previously.</small></div></div></div>;
}

function RegressionPlan() {
  const [changeType, setChangeType] = useState('Threshold logic');
  const testsByChange: Record<string, string[]> = {
    'Threshold logic': ['Below/equal/above boundary', 'Normal sensor range', 'Invalid-input safe response', 'Manual/test mode interaction'],
    'Sensor wiring/calibration': ['Input units and plausible range', 'Normal min/nominal/max points', 'Threshold crossing points', 'Invalid/disconnected simulation'],
    'Mode or status display': ['Automatic/manual state distinction', 'Mode transition and exit', 'Reset startup state', 'Fault indication'],
    'Startup/recovery behavior': ['Cold startup output state', 'Reset during operation', 'Power restart path', 'Recovery condition and operator message'],
  };
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const tests = testsByChange[changeType];
  return <div className="w9-tool"><Heading slide={16} eyebrow="REGRESSION / FOLLOW THE CHANGE IMPACT" title="Rerun the tests your refinement could affect." subtitle="The list is a prompt. Add project-specific regression cases and record results against the new version."/><div className="w9-regression-layout"><div className="w9-controls"><label>Changed area<select value={changeType} onChange={(event) => { setChangeType(event.target.value); setChecked({}); }}>{Object.keys(testsByChange).map((item) => <option key={item}>{item}</option>)}</select></label><div className="w9-version-flow"><i>V1 BASELINE</i><ArrowRight size={15}/><i>V2 REFINEMENT</i><ArrowRight size={15}/><i>REGRESSION</i></div></div><div className="w9-checklist">{tests.map((test) => <label key={test}><input type="checkbox" checked={checked[test] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [test]: event.target.checked }))}/><span>{test}</span><small>{checked[test] ? 'RERUN LOGGED' : 'CHECK IMPACT'}</small></label>)}</div></div></div>;
}

function ComparisonChart() {
  const [baseline, setBaseline] = useDraftValue('compare-baseline');
  const [refined, setRefined] = useDraftValue('compare-refined');
  const [metric, setMetric] = useDraftValue('compare-metric', 'Threshold response time');
  const [unit, setUnit] = useDraftValue('compare-unit', 'ms');
  const [source, setSource] = useState('Measured / observed');
  const b = Number(baseline);
  const r = Number(refined);
  const valid = baseline.trim() !== '' && refined.trim() !== '' && Number.isFinite(b) && Number.isFinite(r);
  const max = valid ? Math.max(b, r, 1) : 1;
  return <div className="w9-tool"><Heading slide={17} eyebrow="BEFORE / AFTER / SAME CONDITIONS" title="Compare versions without hiding the method." subtitle="Enter values from matched tests. If the data are simulated or illustrative, label the source and keep it separate from hardware evidence." tone="blue"/><div className="w9-comparison-layout"><div className="w9-controls"><DraftInput label="Metric" value={metric} onChange={setMetric} placeholder="Response time, noise, misses"/><DraftInput label="Unit" value={unit} onChange={setUnit} placeholder="ms, counts, %"/><div className="w9-two-fields"><DraftInput label="Baseline result" value={baseline} onChange={setBaseline} placeholder="Original version"/><DraftInput label="Refined result" value={refined} onChange={setRefined} placeholder="New version"/></div><label>Data source<select value={source} onChange={(event) => setSource(event.target.value)}><option>Measured / observed</option><option>Simulation</option><option>Code inspection only</option><option>Planned / not yet measured</option></select></label></div><div className="w9-chart-card"><span>{metric || 'METRIC'} / {source.toUpperCase()}</span><div className="w9-comparison-bars"><div><b>BASELINE</b><i><em style={{ width: `${valid ? Math.max(2, (b / max) * 100) : 0}%` }}/></i><strong>{valid ? `${baseline} ${unit}` : 'not entered'}</strong></div><div><b>REFINED</b><i><em style={{ width: `${valid ? Math.max(2, (r / max) * 100) : 0}%` }}/></i><strong>{valid ? `${refined} ${unit}` : 'not entered'}</strong></div></div><p>State whether lower/higher is better for this metric, and whether both tests used comparable conditions.</p><small>This visual only plots learner-entered numbers; it does not verify their source.</small></div></div></div>;
}

function OperatorGuide() {
  const sections = ['Safe pre-start and version check', 'Normal operating steps and indicators', 'Manual/test mode and its limits', 'Fault message and operator response', 'Safe shutdown / isolation steps', 'Recovery condition and who to contact'];
  const [items, setItems] = useState<Record<string, boolean>>({});
  const [audience, setAudience] = useDraftValue('guide-audience');
  const [stopRule, setStopRule] = useDraftValue('guide-stop-rule');
  const complete = sections.filter((section) => items[section]).length;
  return <div className="w9-tool"><Heading slide={18} eyebrow="A002 OPERATOR GUIDE / WRITE FOR A NEW USER" title="Make the guide usable without the author present." subtitle="Use the actual interface, labels, and approved procedures. Make stop conditions and prohibited actions explicit."/><div className="w9-guide-layout"><div className="w9-checklist">{sections.map((section) => <label key={section}><input type="checkbox" checked={items[section] ?? false} onChange={(event) => setItems((current) => ({ ...current, [section]: event.target.checked }))}/><span>{section}</span></label>)}</div><aside className="w9-guide-card"><span>GUIDE DRAFT / {complete} OF {sections.length}</span><DraftInput label="Intended user" value={audience} onChange={setAudience} placeholder="Who will operate it?"/><DraftArea label="Stop and seek help when..." value={stopRule} onChange={setStopRule} placeholder="Specific fault, unsafe condition, or uncertainty"/><div className="w9-guide-path"><i>CHECK</i><ArrowRight size={14}/><i>OPERATE</i><ArrowRight size={14}/><i>RESPOND</i><ArrowRight size={14}/><i>STOP</i></div></aside></div></div>;
}

function DemoRehearsal() {
  const [step, setStep] = useState(0);
  const [fallback, setFallback] = useDraftValue('demo-fallback');
  const steps = [
    ['OPEN', 'State the user need, requirement, and prototype boundary.'],
    ['DEMONSTRATE', 'Name the version and test condition before showing behavior.'],
    ['EVIDENCE', 'Show an observed result and explain what it supports.'],
    ['LIMIT', 'State one limitation without overstating reliability.'],
    ['FALLBACK', 'Use labelled evidence if a live component does not behave.'],
  ];
  return <div className="w9-tool"><Heading slide={19} eyebrow="DEMONSTRATION / PREPARE A SAFE FALLBACK" title="A robust demo has a plan for a failed live component." subtitle="Do not bypass a fault or improvise wiring during a presentation. Use recorded evidence with a clear label and explain the limitation." tone="coral"/><div className="w9-demo-layout"><div className="w9-demo-steps">{steps.map(([title], index) => <button key={title} className={index === step ? 'is-active' : index < step ? 'is-done' : ''} onClick={() => setStep(index)}><span>0{index + 1}</span><b>{title}</b></button>)}</div><div className="w9-demo-card"><span>REHEARSAL PROMPT / {steps[step][0]}</span><strong>{steps[step][1]}</strong><DraftArea label="Your fallback / cue" value={fallback} onChange={setFallback} placeholder="What safe, labelled evidence will you show?"/><small>Keep live demonstrations within tutor approval and normal safe procedures.</small></div></div></div>;
}

function TeamEvaluation() {
  const [decision, setDecision] = useDraftValue('team-decision');
  const [reason, setReason] = useDraftValue('team-reason');
  const [review, setReview] = useDraftValue('team-review');
  const [handover, setHandover] = useDraftValue('team-handover');
  return <div className="w9-tool"><Heading slide={20} eyebrow="TEAM EVALUATION / DECISIONS + HANDOVERS" title="Explain how the team worked, not only what it built." subtitle="Use meeting notes, review comments, and change records. Describe a specific decision and its effect on the project."/><div className="w9-writing-layout"><div className="w9-controls"><DraftArea label="Decision made + alternatives" value={decision} onChange={setDecision} placeholder="What did the team choose or defer?"/><DraftArea label="Reason / evidence" value={reason} onChange={setReason} placeholder="Why? Link to a test, requirement, or constraint."/><DraftArea label="Peer review / feedback acted on" value={review} onChange={setReview} placeholder="What feedback changed the work?"/><DraftArea label="Handover / shared ownership" value={handover} onChange={setHandover} placeholder="How did another member continue the task?"/></div><aside className="w9-team-map"><Users size={26}/><span>TEAM EVIDENCE</span><div><i>DECISION</i><ArrowRight size={14}/><i>OWNER</i><ArrowRight size={14}/><i>OUTCOME</i></div><p>Support collaboration claims with dated records and specific examples.</p></aside></div></div>;
}

function Contribution() {
  const [task, setTask] = useDraftValue('individual-task');
  const [action, setAction] = useDraftValue('individual-action');
  const [evidence, setEvidence] = useDraftValue('individual-evidence');
  const [value, setValue] = useDraftValue('individual-value');
  return <div className="w9-tool"><Heading slide={21} eyebrow="INDIVIDUAL CONTRIBUTION / SPECIFIC + VERIFIABLE" title="Write what you personally did and why it mattered." subtitle="Distinguish your own work from shared team output. Link the contribution to an artefact or observed task." tone="blue"/><div className="w9-writing-layout"><div className="w9-controls"><DraftInput label="Task / role" value={task} onChange={setTask} placeholder="What responsibility did you take?"/><DraftArea label="Action you personally completed" value={action} onChange={setAction} placeholder="Specific design, test, review, writing, or handover"/><DraftInput label="Evidence reference" value={evidence} onChange={setEvidence} placeholder="File, test ID, meeting note, screenshot"/><DraftArea label="Value to the team / outcome" value={value} onChange={setValue} placeholder="What changed or became possible because of this work?"/></div><aside className="w9-contribution-card"><span>CONTRIBUTION CHAIN</span><b>{task || 'ROLE'}</b><ArrowDown size={16}/><b>{action || 'PERSONAL ACTION'}</b><ArrowDown size={16}/><b>{evidence || 'EVIDENCE LINK'}</b><p>{value || 'Explain the value or result.'}</p></aside></div></div>;
}

function Reflection() {
  const [feedback, setFeedback] = useDraftValue('reflection-feedback');
  const [response, setResponse] = useDraftValue('reflection-response');
  const [learning, setLearning] = useDraftValue('reflection-learning');
  const [next, setNext] = useDraftValue('reflection-next');
  return <div className="w9-tool"><Heading slide={22} eyebrow="REFLECTION / FEEDBACK → RESPONSE → LEARNING" title="Reflection is a reasoned account, not a diary." subtitle="Describe a specific event, explain your response, connect it to learning, and identify the next action."/><div className="w9-reflection-layout"><div className="w9-controls"><DraftArea label="Feedback / event" value={feedback} onChange={setFeedback} placeholder="What happened? Who gave feedback?"/><DraftArea label="Your response" value={response} onChange={setResponse} placeholder="What did you do differently?"/><DraftArea label="Learning / evidence" value={learning} onChange={setLearning} placeholder="What skill or understanding changed?"/><DraftArea label="Next action" value={next} onChange={setNext} placeholder="What will you do, and how will you know it helped?"/></div><div className="w9-reflection-cycle"><span>REFLECTION CYCLE</span><div><b>EVENT</b><ArrowRight size={14}/><b>RESPONSE</b><ArrowRight size={14}/><b>LEARNING</b><ArrowRight size={14}/><b>NEXT ACTION</b></div><small>Anchor each part in your own logbook and evidence.</small></div></div></div>;
}

function CpdAction() {
  const [gap, setGap] = useDraftValue('cpd-gap');
  const [action, setAction] = useDraftValue('cpd-action');
  const [measure, setMeasure] = useDraftValue('cpd-measure');
  const [date, setDate] = useDraftValue('cpd-date');
  const complete = [gap, action, measure, date].every((item) => item.trim());
  return <div className="w9-tool"><Heading slide={23} eyebrow="CPD / A SMALL ACTION WITH A DATE" title="Turn one skill gap into a measurable next step." subtitle="The target should be achievable, relevant to your development, time-bound, and checked with evidence." tone="blue"/><div className="w9-cpd-layout"><div className="w9-controls"><DraftInput label="Skill gap" value={gap} onChange={setGap} placeholder="What do you still need to learn?"/><DraftArea label="Action" value={action} onChange={setAction} placeholder="Read, practise, attend, ask, or build what?"/><DraftInput label="Success measure / evidence" value={measure} onChange={setMeasure} placeholder="What will demonstrate progress?"/><DraftInput label="Target date" value={date} onChange={setDate} placeholder="YYYY-MM-DD"/></div><aside className={`w9-cpd-card ${complete ? 'is-complete' : ''}`}><Target size={27}/><span>SMART ACTION</span><strong>{complete ? 'SPECIFIC • MEASURABLE • DATED' : 'GAP → ACTION → EVIDENCE → DATE'}</strong><p>{gap || 'Name a current skill gap.'}</p><small>Review the outcome in your next logbook entry.</small></aside></div></div>;
}

function PeerReview() {
  const criteria = [
    ['Claim', 'Is there a clear judgement against a requirement/objective?'],
    ['Evidence', 'Can you locate the cited result and test conditions?'],
    ['Reasoning', 'Does the explanation connect the result to the judgement?'],
    ['Limitation', 'Is uncertainty, sample size, or scope acknowledged?'],
    ['Next action', 'Is the recommendation feasible and verifiable?'],
  ];
  const [notes, setNotes] = useState<Record<string, string>>({});
  const complete = criteria.filter(([key]) => notes[key]?.trim()).length;
  return <div className="w9-tool"><Heading slide={24} eyebrow="PEER REVIEW / HELP THE WRITER STRENGTHEN THE CLAIM" title="Leave one evidence question and one actionable edit." subtitle="Review the reasoning, not the student's writing style. Ask where the evidence is and what change would make the claim clearer."/><div className="w9-peer-layout"><div className="w9-peer-criteria">{criteria.map(([key, prompt]) => <label key={key}><span>{key.toUpperCase()}</span><b>{prompt}</b><input value={notes[key] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [key]: event.target.value }))} placeholder="Reviewer note / N/A with reason"/></label>)}</div><aside className="w9-peer-card"><ClipboardCheck size={25}/><span>REVIEW NOTES</span><strong>{complete} / {criteria.length}</strong><p>Finish with one strength, one question, and one specific edit suggestion.</p></aside></div></div>;
}

function PortfolioCheck() {
  const checklist = ['Requirement IDs match across design, test table, and evaluation', 'Results have setup, units, version, and evidence references', 'Refinements have a change record and affected-test retest', 'Limitations distinguish measured fact from future work', 'Operator guide matches actual indicators and safe procedures', 'Team decisions and individual contributions have dated evidence', 'CPD action includes success measure and target date'];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const count = Object.values(checked).filter(Boolean).length;
  return <div className="w9-tool"><Heading slide={25} eyebrow="A002 TASK 2.2 + 2.3 / CONSISTENCY CHECK" title="Make the portfolio tell one coherent story." subtitle="Check agreement between requirements, versions, test results, recommendations, operator guidance, and individual records." tone="blue"/><div className="w9-portfolio-layout"><div className="w9-checklist">{checklist.map((item) => <label key={item}><input type="checkbox" checked={checked[item] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><aside className="w9-portfolio-card"><span>CONSISTENCY CHECK</span><strong>{count} / {checklist.length}</strong><div className="w9-progress-track"><i style={{ width: `${(count / checklist.length) * 100}%` }}/></div><p>{count === checklist.length ? 'Ready for tutor/peer review; verify every link opens and refers to the submitted version.' : 'Assign an owner and date to each unchecked item.'}</p></aside></div></div>;
}

function DraftExport() {
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);
  const exportDraft = () => {
    const entries = Object.keys(window.localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).sort();
    const sections = entries.map((key) => {
      const value = window.localStorage.getItem(key) ?? '';
      const title = key.slice(DRAFT_PREFIX.length).replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      return { title, value: formatDraftValue(key, value) };
    }).filter((entry) => entry.value.trim());
    if (sections.length === 0) {
      setDownloadUrl('');
      setStatus('No draft text saved yet. Write in a coursework field first, then prepare the export.');
      return;
    }
    const body = ['# Week 9 Coursework Working Draft', '', '> Working notes only. Replace prompts with project-specific reasoning, cite the original evidence, and follow tutor assessment guidance.', '', ...sections.flatMap((entry) => [`## ${entry.title}`, '', entry.value || '[Not drafted]', ''])].join('\n');
    setDownloadUrl(URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' })));
    setStatus(`${sections.length} draft sections prepared. Use the download link, then review and edit the file before submission.`);
  };
  const clearDrafts = () => {
    Object.keys(window.localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).forEach((key) => window.localStorage.removeItem(key));
    setStatus('Week 9 local drafts cleared in this browser.');
  };
  return <div className="w9-tool"><Heading slide={26} eyebrow="WORKING DRAFT / LOCAL EXPORT" title="Take your notes into your coursework document." subtitle="Drafts save only in this browser and export as Markdown. This deck does not submit work or provide a completed assignment answer."/><div className="w9-export-layout"><div className="w9-export-visual"><FileText size={32}/><span>LOCAL BROWSER DRAFTS</span><div className="w9-export-flow"><i>EVALUATION</i><ArrowRight size={14}/><i>REFINEMENT</i><ArrowRight size={14}/><i>REFLECTION</i><ArrowRight size={14}/><i>MARKDOWN</i></div><p>Review evidence, references, wording, and assessment instructions before using your draft.</p></div><div className="w9-export-controls"><button className="primary-button" onClick={exportDraft}><FileText size={16}/> PREPARE MARKDOWN</button>{downloadUrl && <a className="w9-download-link" href={downloadUrl} download="eee4015-week09-coursework-working-draft.md"><Download size={16}/> DOWNLOAD WORKING DRAFT</a>}<button className="w9-clear-button" onClick={clearDrafts}><RotateCcw size={15}/> CLEAR LOCAL WEEK 9 DRAFTS</button><p aria-live="polite">{status || 'Draft fields autosave locally as you type. They are not uploaded to a server.'}</p></div></div></div>;
}

function parseDraftArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch {
    return fallback;
  }
}

function formatDraftValue(key: string, value: string) {
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

function ExitTicket() {
  const questions = [
    { prompt: 'What makes an evaluation claim defensible?', options: ['Evidence linked to target, reasoning, and limitation', 'A confident conclusion alone', 'A proposed feature'], answer: 0 },
    { prompt: 'What should follow a relevant refinement?', options: ['Version record and affected/regression retest', 'Overwrite the baseline', 'Assume old tests still apply'], answer: 0 },
    { prompt: 'What makes a recommendation useful?', options: ['A specific change justified by evidence and a verification plan', 'A broad wish list', 'A claim of industrial reliability'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={27} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Judge the result.<br/><span className="text-blue">Justify the next step.</span></>} subtitle="Check the evaluation ideas and name one coursework section to finish next." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>NEXT COURSEWORK ACTION / OWNER / DATE</span><textarea rows={2} placeholder="Which evidence-backed section will you complete next?"/></label></div></div>;
}

function DraftInput({ label, value, onChange, placeholder, compact = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; compact?: boolean }) {
  return <label className={`w9-draft-field ${compact ? 'is-compact' : ''}`}>{label && <span>{label}</span>}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
}
function DraftArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="w9-draft-field"><span>{label}</span><textarea rows={2} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
}

export default App;
