import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Activity, ArrowLeft, ArrowRight, Check, CircleHelp, Clock3, Cpu, Droplets,
  Expand, ExternalLink, Lightbulb, MonitorPlay, Pause, Play, RotateCcw, Sparkles, Sun, X,
} from 'lucide-react';

type Tone = 'lime' | 'blue' | 'coral';

const slideNames = [
  'Start here', 'The session route', 'The measurement chain', 'A voltage divider',
  'An ADC gives a code', 'Calibrate before interpreting', 'Explore the LDR divider',
  'Translate ADC to PWM', 'PWM is not analogue voltage', 'Map light to brightness',
  'Check the pin map', 'Break one', 'Moisture is a measurement too',
  'Calibrate dry and damp', 'Test threshold boundaries', 'Add hysteresis',
  'A servo is a control output', 'Define a fault response',
  'TinkerCAD: LDR to PWM', 'TinkerCAD: moisture to servo',
  'Trace the control sketch', 'Debug from evidence', 'Team design challenge',
  'Evidence logbook', 'Compare and debrief', 'Break two', 'Exit ticket',
];
const slideDurations = [2, 5, 8, 10, 10, 10, 20, 8, 10, 20, 7, 10, 10, 20, 15, 30, 10, 12, 25, 25, 18, 22, 40, 18, 20, 10, 10];
const totalMinutes = slideDurations.reduce((sum, duration) => sum + duration, 0);
const chapters = [
  { name: 'OPENING', index: 0 },
  { name: 'MEASUREMENT', index: 2 },
  { name: 'LDR + PWM', index: 6 },
  { name: 'CALIBRATION', index: 12 },
  { name: 'CONTROL', index: 15 },
  { name: 'SIMULATION LABS', index: 18 },
  { name: 'APPLY + EVIDENCE', index: 22 },
];
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const elapsedAt = (slide: number) => slideDurations.slice(0, slide).reduce((sum, duration) => sum + duration, 0);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const voltageToAdc = (voltage: number) => Math.round(clamp(voltage / 5, 0, 1) * 1023);

function chapterAt(index: number) {
  for (let cursor = chapters.length - 1; cursor >= 0; cursor--) if (index >= chapters[cursor].index) return cursor;
  return 0;
}

function Eyebrow({ children, tone = 'lime' }: { children: ReactNode; tone?: Tone }) {
  return <p className={`eyebrow eyebrow--${tone}`}><span className="eyebrow__dot" />{children}</p>;
}

function Heading({ slide, eyebrow, title, subtitle, tone = 'lime' }: { slide: number; eyebrow: string; title: ReactNode; subtitle: string; tone?: Tone }) {
  return <header className="slide-heading"><Eyebrow tone={tone}>{eyebrow}</Eyebrow><h1 id={`week3-title-${slide}`}>{title}</h1><p className="slide-subtitle">{subtitle}</p></header>;
}

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
  useEffect(() => { document.title = `EEE4015 / Week 03 — ${slideNames[slide]}`; }, [slide]);
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0; }, [slide]);

  return (
    <div className="app-shell" data-motion={animated ? 'on' : 'off'}>
      <header className="topbar">
        <div className="course-mark" aria-label="EEE4015 Introductory Embedded Systems"><span className="course-mark__symbol"><Cpu size={21} /></span><span className="course-mark__text"><b>EEE4015</b><small>INTRODUCTORY EMBEDDED SYSTEMS</small></span></div>
        <div className="topbar-center"><span className="week-tag">WEEK 03</span><span className="topbar-divider"/><span className="topbar-lesson">{slideNames[slide]}</span><span className="topbar-time"><small>PACE</small><b>{formatTime(elapsed)}<i>/</i>{formatTime(totalMinutes)}</b></span></div>
        <div className="topbar-tools"><div className="score-chip" aria-live="polite"><Sparkles size={16}/><span>{points} XP</span></div><button className="icon-button" type="button" onClick={() => setMotionEnabled((value) => !value)} aria-label={animated ? 'Pause animations' : 'Play animations'} title={animated ? 'Pause animations' : 'Play animations'}>{animated ? <Pause size={17}/> : <Play size={17}/>}</button><button className="icon-button fullscreen-button" type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.(); else void document.exitFullscreen?.(); }} aria-label="Toggle full screen" title="Toggle full screen"><Expand size={17}/></button></div>
      </header>
      <div className="progress-track" aria-label={`Slide ${slide + 1} of ${slideNames.length}; planned class time ${formatTime(elapsed)} of ${formatTime(totalMinutes)}`}><motion.div className="progress-track__fill" initial={false} animate={{ width: `${((slide + 1) / slideNames.length) * 100}%` }} transition={{ duration: animated ? .4 : 0 }}/><span className="progress-track__glint"/></div>
      <main className="stage" ref={stageRef}>
        <div className="stage-grid" aria-hidden="true"/><div className="ambient-index" aria-hidden="true">{String(slide + 1).padStart(2, '0')}</div>
        <AnimatePresence mode="wait" initial={false}><motion.section className="slide" key={slide} aria-labelledby={`week3-title-${slide}`} initial={animated ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animated ? .23 : 0 }}>{renderSlide(slide, goTo, addPoints)}</motion.section></AnimatePresence>
      </main>
      <footer className="bottombar"><div className="keyboard-hint"><span className="keycap">←</span><span className="keycap">→</span><span>TO NAVIGATE</span></div><nav className="slide-dots" aria-label="Lesson chapters">{chapters.map((chapter, index) => <button key={chapter.name} type="button" className={`slide-dot ${activeChapter === index ? 'is-active' : ''}`} aria-label={`Go to chapter ${index + 1}: ${chapter.name}`} aria-current={activeChapter === index ? 'step' : undefined} onClick={() => goTo(chapter.index)}/>)}</nav><div className="bottom-controls"><span className="slide-counter"><b>{String(slide + 1).padStart(2, '0')}</b><i>/</i>{String(slideNames.length).padStart(2, '0')}</span><button className="nav-button nav-button--back" type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={18}/></button><button className="nav-button nav-button--next" type="button" onClick={() => goTo(slide + 1)} disabled={slide === slideNames.length - 1} aria-label="Next slide"><span>{slide === slideNames.length - 1 ? 'DONE' : 'NEXT'}</span><ArrowRight size={18}/></button></div></footer>
      <div className="watermark" aria-label="Created by Akbar Q">Akbar Q</div>
    </div>
  );
}

function renderSlide(index: number, goTo: (index: number) => void, addPoints: (amount: number) => void) {
  switch (index) {
    case 0: return <Welcome onStart={() => goTo(2)} addPoints={addPoints}/>;
    case 1: return <Agenda/>;
    case 2: return <ConceptSlide slide={2} eyebrow="MEASUREMENT CHAIN / SENSOR → DECISION → OUTPUT" title="A sensor gives a signal. The controller gives it meaning." subtitle="The signal chain has several steps; a raw number is not yet a physical measurement." tone="lime" visual="chain" points={[['Sense', 'A changing physical condition alters a component or module output.', 'Light level or a moisture sensor output'], ['Convert', 'A voltage divider presents a voltage in the controller input range.', 'Measure the midpoint relative to the same ground'], ['Interpret', 'The ADC samples and quantises voltage into a numeric code.', 'Uno example: nominal codes 0–1023'], ['Respond', 'Code maps a reading into an output command and a testable response.', 'PWM brightness or a servo position']]} takeaway="Always label what a number represents: ADC counts, volts, calibrated units, or an output command."/>;
    case 3: return <ConceptSlide slide={3} eyebrow="CIRCUIT / VOLTAGE DIVIDER" title="Two resistances share the supply voltage." subtitle="The midpoint voltage depends on both resistances and on which component is connected to the supply." tone="blue" visual="divider" points={[['Two components in series', 'A fixed resistor and an LDR make a voltage divider across supply and ground.', 'The ADC measures the midpoint, not the resistance directly.'], ['Use the divider relationship', 'With LDR above the midpoint and fixed resistor to ground: Vout = Vin × Rfixed / (RLDR + Rfixed).', 'As light rises, RLDR often falls and Vout rises in this orientation.'], ['Reverse the components, reverse the trend', 'Put the fixed resistor above the midpoint and LDR below it and the midpoint voltage moves the other way.', 'Predict the direction, then check in Tinkercad.']]} takeaway="A divider converts resistance change into a voltage change; the ADC sees only that voltage."/>;
    case 4: return <ConceptSlide slide={4} eyebrow="CONVERSION / ADC" title="The ADC turns a voltage into a code." subtitle="Resolution describes code steps. It does not guarantee measurement accuracy." tone="blue" visual="adc" points={[['Sampling', 'The input voltage is sampled and represented by a finite number of digital codes.', 'Uno R3 example: 10-bit ADC, nominal range 0–1023.'], ['Quantisation', 'The continuous input is rounded to a nearby code. For a nominal 5 V reference, one ideal step is about 5/1024 V.', 'About 4.88 mV per step in that example.'], ['Know the board', 'Reference voltage, ADC design, pin capability, and code range differ between board families and exact variants.', 'Do not assume the Uno map transfers to an ESP32.']]} takeaway="Counts are dimensionless codes until you state the ADC range, reference, and measurement mapping."/>;
    case 5: return <ConceptSlide slide={5} eyebrow="METHOD / CALIBRATION BEFORE CLAIMS" title="Raw values are not lux or soil moisture." subtitle="Measure representative endpoints before choosing a mapping or threshold." tone="coral" visual="calibration" points={[['Record conditions', 'Collect sensor readings in clearly described conditions, with repeated samples.', 'For the LDR: shielded/dim and brighter scenes.'], ['Choose useful endpoints', 'Map observed dark and bright readings, not necessarily the ADC’s full 0–1023 range.', 'Document setup, board, divider, and repeatability.'], ['State the limitation', 'An LDR does not directly output calibrated lux. A moisture module does not directly output a universal moisture percentage.', 'Calibration is specific to the sensor, soil/material, wiring, and environment.']]} takeaway="Calibrate the device in the intended environment and label the result as provisional until validated."/>;
    case 6: return <LdrDividerLab/>;
    case 7: return <ConceptSlide slide={7} eyebrow="TRANSLATION / ADC → OUTPUT" title="Turn a measured range into a useful command." subtitle="Mapping should use observed endpoints, handle reversed direction, and stay inside the output range." tone="lime" visual="mapping" points={[['Subtract the input minimum', 'A useful scale starts by comparing the raw reading with the calibrated dark endpoint.', 'Input span = brightRaw − darkRaw.'], ['Scale and constrain', 'Scale the relative position into the PWM command range, then constrain it to 0–255.', 'Integer map() truncates; rounding may be useful for smoother display.'], ['Check direction', 'If the ADC count falls as the scene brightens, the endpoint order reverses the mapping automatically.', 'Test both endpoints and one midpoint.']]} takeaway="A good mapping describes the sensor’s measured range, not an assumed ideal range."/>;
    case 8: return <ConceptSlide slide={8} eyebrow="OUTPUT / PULSE-WIDTH MODULATION" title="PWM changes duty cycle, not analogue voltage." subtitle="A digital pin switches between low and high; changing the on-time changes average delivered energy for suitable loads." tone="coral" visual="pwm" points={[['Duty cycle', 'Duty cycle is the fraction of each repeated period spent high.', '0% is continuously low; 50% is half high; 100% is continuously high.'], ['Perceived brightness', 'On a supported PWM pin, the pulse train can make a correctly connected LED appear dimmer or brighter.', 'Use a series resistor and check the board current limits.'], ['Not a DAC output', 'The pin still switches between logic levels. A meter may show an average, but that is not a stable analogue output voltage.', 'Do not treat PWM as a direct sensor supply.']]} takeaway="PWM is a digital pulse train whose duty command controls average output, not a true analogue voltage."/>;
    case 9: return <PwmMappingLab/>;
    case 10: return <PinMapCheck/>;
    case 11: return <BreakSlide second={false}/>;
    case 12: return <ConceptSlide slide={12} eyebrow="SECOND SENSOR / MOISTURE MODULE" title="A sensor output still needs context." subtitle="The ADC reports a voltage-derived code; conditions and module wiring determine what that code means." tone="blue" visual="moisture" points={[['Read the analogue output', 'The example uses A0 on an Uno and prints raw ADC codes to Serial.', 'Nominal Uno example: 0–1023.'], ['Observe dry and damp samples', 'Log actual readings under labelled conditions and establish which way the value changes.', 'Do not assume every module has the same polarity or scale.'], ['Choose a response', 'A provisional threshold can switch a status LED and request one of two servo positions.', 'The example’s 100-count threshold and angles are not universal settings.']]} takeaway="Use raw values as evidence, not as a moisture percentage without a validated calibration."/>;
    case 13: return <MoistureCalibrationLab/>;
    case 14: return <BoundaryTest/>;
    case 15: return <HysteresisLab/>;
    case 16: return <ConceptSlide slide={16} eyebrow="OUTPUT / SERVO CONTROL" title="A servo command is not servo power." subtitle="The controller sends a control pulse; the servo’s motor current comes from its power supply." tone="coral" visual="servo" points={[['Control signal', 'The Servo library converts a position request into a repeated control pulse.', 'The example uses D5 as a signal pin.'], ['Separate the power path', 'A servo can draw more current than a development board regulator can supply.', 'Use a suitable external low-voltage supply when required.'], ['Share reference correctly', 'When supplies are separate, the signal reference and grounds must be connected as specified by the hardware.', 'Never power a servo from a GPIO pin.']]} takeaway="Confirm servo supply, current demand, voltage, and ground arrangement before physical wiring."/>;
    case 17: return <FaultResponse/>;
    case 18: return <SimulationSlide slide={18} title="LDR → PWM: predict, run, record." note="The diagram indicates A5 while the original starter source reads A0. Verify the signal wire and sketch agree before running." thingId="kD4vW2kdp7H" shareCode="yVU1JPkegVmQbrdxeehnA2ZpNqdMDCTT0NiX4nznteY" publicUrl="https://www.tinkercad.com/things/kD4vW2kdp7H-ldr-controlled-pwm?sharecode=yVU1JPkegVmQbrdxeehnA2ZpNqdMDCTT0NiX4nznteY"/>
    case 19: return <SimulationSlide slide={19} title="Moisture → servo: test the boundary." note="Treat 100 as an uncalibrated starter count. Record dry and damp values, and inspect the servo’s supply requirements." thingId="9ZBKxCa8CKA" shareCode="8fhUROTXGvUh2j8pHiuWuGaIcoHlkBh1_4gmBuTPD3I" publicUrl="https://www.tinkercad.com/things/9ZBKxCa8CKA-moisture-sensor-controlled-servo?sharecode=8fhUROTXGvUh2j8pHiuWuGaIcoHlkBh1_4gmBuTPD3I"/>
    case 20: return <CodeTrace/>
    case 21: return <DebugActivity/>
    case 22: return <TeamChallenge/>
    case 23: return <EvidenceLog/>
    case 24: return <Debrief addPoints={addPoints}/>
    case 25: return <BreakSlide second/>
    case 26: return <ExitTicket/>
    default: return null;
  }
}

function Welcome({ onStart, addPoints }: { onStart: () => void; addPoints: (amount: number) => void }) {
  return <div className="w3-welcome"><div className="w3-welcome__copy"><Eyebrow>FIELD NOTES / 03</Eyebrow><h1 id="week3-title-0">Measure it.<br/><span>Then decide.</span></h1><p>Follow the signal from light or moisture, through an ADC, into a calibrated control response.</p><div className="w3-meta"><span><b>27</b> SLIDES</span><span><b>405</b> MINUTES</span><span><b>02</b> BREAKS</span></div><button className="primary-button" onClick={onStart}>START THE SESSION <ArrowRight size={17}/></button></div><div className="w3-hero"><div className="w3-hero__sun"><Sun size={50}/></div><div className="w3-hero__line w3-hero__line--one"/><div className="w3-hero__sensor"><Activity size={33}/><span>ADC</span></div><div className="w3-hero__line w3-hero__line--two"/><div className="w3-hero__output"><span>37%</span><i/></div><div className="w3-hero__label">LIGHT → VOLTAGE → CODE → PWM</div><button className="art-answer" onClick={() => addPoints(5)}><Sparkles size={14}/> +5 READY POINTS</button></div><div className="learning-strip"><span className="learning-strip__label">TODAY YOU WILL</span><div><Check size={16}/> Interpret ADC counts</div><div><Check size={16}/> Calibrate a response</div><div><Check size={16}/> Add hysteresis to a threshold</div></div></div>;
}

function Agenda() {
  const sessions = [
    ['00:00–00:45', 'Measurement chain', 'Divider, ADC code, reference, and calibration'],
    ['00:45–02:10', 'LDR → PWM simulation', 'Light sweep, ADC log, endpoint mapping, PWM brightness'],
    ['02:10–02:20', 'BREAK', 'Reset before the second sensor'],
    ['02:20–04:20', 'Moisture → servo control', 'Dry/wet calibration, threshold boundaries, hysteresis, fault response'],
    ['04:20–04:30', 'BREAK', 'Pause before the simulator stations'],
    ['04:30–05:40', 'Tinkercad stations + code', 'Run both circuits; compare pin maps and observed data'],
    ['05:40–06:45', 'Design, evidence, debrief', 'Teams defend a mapping, boundary tests, and limitations'],
  ];
  return <div className="w3-agenda"><Heading slide={1} eyebrow="TODAY / 06:45 TOTAL" title="Theory, simulation, explanation." subtitle="Each new concept gets a prediction and a practical check. The session can be split over multiple class days."/><div className="w3-agenda-list">{sessions.map(([time, title, detail], index) => <div className={`w3-agenda-row ${title === 'BREAK' ? 'is-break' : ''}`} key={title}><span>{String(index + 1).padStart(2, '0')}</span><b>{time}</b><strong>{title}</strong><small>{detail}</small></div>)}</div><p className="w3-callout"><Clock3 size={16}/> Simulator results are evidence of simulation only; Week 6 provides supervised physical measurement evidence.</p></div>;
}

type ConceptProps = { slide: number; eyebrow: string; title: string; subtitle: string; tone: Tone; visual: string; points: [string, string, string][]; takeaway: string };
function ConceptSlide({ slide, eyebrow, title, subtitle, tone, visual, points, takeaway }: ConceptProps) {
  return <div className="w3-concept"><div className="w3-concept__head"><Heading slide={slide} eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone}/><span className="w3-timing">{slideDurations[slide]} MIN</span></div><div className="w3-concept__body"><div className="w3-points">{points.map(([heading, body, example], index) => <article className="w3-point" key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p><small>{example}</small></div></article>)}</div><ConceptVisual kind={visual}/></div><div className="w3-takeaway"><Lightbulb size={17}/><span>TAKEAWAY</span><p>{takeaway}</p></div></div>;
}

function ConceptVisual({ kind }: { kind: string }) {
  if (kind === 'chain') return <figure className="w3-visual"><div className="w3-visual__heading">THE MEASUREMENT CHAIN <i>W03</i></div><div className="chain-diagram">{[['SENSOR','physical input'],['DIVIDER','voltage'],['ADC','raw code'],['CONTROL','PWM / servo']].map(([label, sub], index) => <div key={label} className={`chain-node chain-node--${index}`}><b>{label}</b><small>{sub}</small></div>)}</div><figcaption>Each stage introduces assumptions that should be measured or checked.</figcaption></figure>;
  if (kind === 'divider') return <figure className="w3-visual"><div className="w3-visual__heading">VOLTAGE DIVIDER <i>W03</i></div><svg viewBox="0 0 360 190" role="img" aria-label="Five volt supply, light dependent resistor and fixed resistor in a voltage divider"><text x="52" y="22" className="w3-svg-label">5 V</text><path d="M65 30 V50 M65 50 H155 M205 50 H295 V30" className="w3-svg-wire"/><rect x="155" y="35" width="50" height="30" rx="4" className="w3-svg-ldr"/><text x="180" y="55" textAnchor="middle" className="w3-svg-dark">LDR</text><path d="M180 65 V91 M65 91 H155 M205 91 H295 V50" className="w3-svg-wire"/><circle cx="180" cy="91" r="5" className="w3-svg-node"/><path d="M180 91 V119" className="w3-svg-wire"/><rect x="155" y="119" width="50" height="30" rx="4" className="w3-svg-resistor"/><text x="180" y="139" textAnchor="middle" className="w3-svg-dark">Rfixed</text><path d="M180 149 V170 H65 V30 M295 30 V170 H180" className="w3-svg-wire"/><text x="218" y="86" className="w3-svg-lime">Vout → ADC</text><text x="288" y="23" className="w3-svg-label">GND</text></svg><figcaption>Switch the LDR and fixed resistor and the light-to-voltage direction reverses.</figcaption></figure>;
  if (kind === 'adc') return <figure className="w3-visual"><div className="w3-visual__heading">ANALOGUE → CODE <i>W03</i></div><div className="adc-visual"><div className="adc-rail"><i/><i/><i/><i/><i/></div><div className="adc-code"><small>UNO EXAMPLE / 10-BIT</small><b>0 → 1023</b><span>nominal 5 V reference</span></div></div><figcaption>Quantisation step ≈ 5 V / 1024 = 4.88 mV for this stated example.</figcaption></figure>;
  if (kind === 'calibration') return <figure className="w3-visual"><div className="w3-visual__heading">OBSERVED ENDPOINTS <i>W03</i></div><div className="calibration-visual"><div><span>DARK / DRY</span><b>measure</b><i/></div><div className="calibration-visual__axis"><span>raw ADC counts</span></div><div><span>BRIGHT / DAMP</span><b>measure</b><i/></div></div><figcaption>Record repeated readings under named conditions; do not assume endpoints.</figcaption></figure>;
  if (kind === 'mapping') return <figure className="w3-visual"><div className="w3-visual__heading">CALIBRATED MAP <i>W03</i></div><div className="map-visual"><span>darkRaw</span><b>→</b><strong>0–255 PWM</strong><b>←</b><span>brightRaw</span></div><figcaption>Clamp output and test min, midpoint, max, and reversed sensor direction.</figcaption></figure>;
  if (kind === 'pwm') return <figure className="w3-visual"><div className="w3-visual__heading">DUTY CYCLE <i>W03</i></div><svg viewBox="0 0 360 142" role="img" aria-label="PWM waveforms at 20, 50 and 80 percent duty"><path d="M22 30 H76 V55 H338" className="pwm-wave pwm-wave--lime"/><path d="M22 22 V61 M76 22 V61" className="pwm-grid"/><text x="24" y="78" className="w3-svg-label">20%</text><path d="M22 83 H150 V108 H210 V83 H338 V108" className="pwm-wave pwm-wave--blue"/><text x="24" y="132" className="w3-svg-label">50% → 80% pulse gets wider</text></svg><figcaption>Digital levels remain LOW/HIGH; only the high-time fraction changes.</figcaption></figure>;
  if (kind === 'moisture') return <figure className="w3-visual"><div className="w3-visual__heading">CONDITION → ADC <i>W03</i></div><div className="moisture-visual"><Droplets size={32}/><span>sensor module</span><ArrowRight size={18}/><b>A0<br/><small>counts</small></b><ArrowRight size={18}/><span>calibrated<br/>decision</span></div><figcaption>Direction and range depend on the exact module, supply, and material.</figcaption></figure>;
  if (kind === 'servo') return <figure className="w3-visual"><div className="w3-visual__heading">CONTROL ≠ MOTOR POWER <i>W03</i></div><div className="servo-visual"><div className="servo-visual__signal">D5<br/><small>CONTROL</small></div><div className="servo-visual__body"><i/><b>SERVO</b></div><div className="servo-visual__power">SUITABLE<br/>SUPPLY</div></div><figcaption>Servo current comes from a suitable supply, not the GPIO signal.</figcaption></figure>;
  return <figure className="w3-visual"><div className="w3-visual__heading">MEASURE → INTERPRET → RESPOND <i>W03</i></div><div className="chain-diagram"><div className="chain-node"><b>RAW</b><small>counts</small></div><div className="chain-node"><b>VALIDATE</b><small>range / age</small></div><div className="chain-node"><b>CONTROL</b><small>state / output</small></div></div><figcaption>Keep measurement, decision, and actuation distinct.</figcaption></figure>;
}

function LdrDividerLab() {
  const [brightness, setBrightness] = useState(55);
  const [orientation, setOrientation] = useState<'ldr-top' | 'ldr-bottom'>('ldr-top');
  const [pin, setPin] = useState<'A5' | 'A0'>('A5');
  const ldrK = Math.round(100 - brightness * .92);
  const fixedK = 10;
  const ldrTop = orientation === 'ldr-top';
  const vout = 5 * (ldrTop ? fixedK / (ldrK + fixedK) : ldrK / (ldrK + fixedK));
  const raw = voltageToAdc(vout);
  return <div className="w3-tool"><Heading slide={6} eyebrow="INTERACTIVE MODEL / LDR DIVIDER" title="Sweep the light. Watch the ADC code." subtitle="This illustrative divider uses a 10 kΩ fixed resistor and a changing LDR resistance. The response is not a lux calibration."/><div className="w3-tool-grid"><div className="w3-tool-controls"><label>Light level <b>{brightness}%</b><input type="range" min="0" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))}/><small>More light is modelled as lower LDR resistance.</small></label><div className="segmented-control"><button className={orientation === 'ldr-top' ? 'is-active' : ''} onClick={() => setOrientation('ldr-top')}>LDR ABOVE MIDPOINT</button><button className={orientation === 'ldr-bottom' ? 'is-active' : ''} onClick={() => setOrientation('ldr-bottom')}>LDR BELOW MIDPOINT</button></div><label>Analogue input<select value={pin} onChange={(event) => setPin(event.target.value as 'A5' | 'A0')}><option value="A5">A5 / diagram location</option><option value="A0">A0 / original source</option></select></label><p className="w3-note w3-note--warning">The supplied diagram indicates A5; original Code.txt reads A0. Move the wire or change the code so they agree.</p></div><div className="w3-readout-card"><div className="w3-readout-head"><span><i className="w3-live-dot"/>DIVIDER SAMPLE</span><b>{pin}</b></div><svg viewBox="0 0 500 210" role="img" aria-label={`LDR divider output ${vout.toFixed(2)} volts and ADC code ${raw} on ${pin}`}><text x="58" y="25" className="w3-svg-label">5 V</text><path d="M72 31 V61 H193 M263 61 H428 V31" className="w3-svg-wire"/><rect x="193" y="45" width="70" height="32" rx="5" className="w3-svg-ldr"/><text x="228" y="65" textAnchor="middle" className="w3-svg-dark">{ldrTop ? `LDR ${ldrK}k` : 'Rfixed 10k'}</text><path d="M228 77 V103" className="w3-svg-wire"/><circle cx="228" cy="103" r="5" className="w3-svg-node"/><path d="M228 103 H336" className="w3-svg-wire w3-svg-wire--signal"/><text x="345" y="99" className="w3-svg-lime">{pin} → {raw}</text><path d="M228 103 V132" className="w3-svg-wire"/><rect x="193" y="132" width="70" height="32" rx="5" className="w3-svg-resistor"/><text x="228" y="152" textAnchor="middle" className="w3-svg-dark">{ldrTop ? 'Rfixed 10k' : `LDR ${ldrK}k`}</text><path d="M228 164 V184 H72 V31 M428 31 V184 H228" className="w3-svg-wire"/><text x="55" y="205" className="w3-svg-label">GND</text></svg><div className="w3-metrics"><Metric label="LDR MODEL" value={`${ldrK} kΩ`}/><Metric label="MIDPOINT" value={`${vout.toFixed(2)} V`}/><Metric label="UNO ADC EXAMPLE" value={`${raw} / 1023`}/></div></div></div><p className="w3-model-warning">Ideal divider + nominal 5 V, 10-bit Uno ADC model. Real sensor curves and board references differ.</p></div>;
}

function PwmMappingLab() {
  const [raw, setRaw] = useState(610);
  const [darkRaw, setDarkRaw] = useState(170);
  const [brightRaw, setBrightRaw] = useState(850);
  const span = brightRaw - darkRaw;
  const pwm = span === 0 ? 0 : Math.round(clamp((raw - darkRaw) / span, 0, 1) * 255);
  const duty = pwm / 255 * 100;
  return <div className="w3-tool"><Heading slide={9} eyebrow="LIVE MAPPING / CALIBRATED ENDPOINTS" title="Map measured light to an 8-bit PWM command." subtitle="Change the calibration endpoints to see how reversed divider direction is handled."/><div className="w3-mapping-grid"><div className="w3-tool-controls"><RangeField label="Current ADC code" value={raw} min={0} max={1023} onChange={setRaw}/><RangeField label="Observed dark endpoint" value={darkRaw} min={0} max={1023} onChange={setDarkRaw}/><RangeField label="Observed bright endpoint" value={brightRaw} min={0} max={1023} onChange={setBrightRaw}/><button className="reset-button" onClick={() => { setRaw(610); setDarkRaw(170); setBrightRaw(850); }} aria-label="Reset calibration values"><RotateCcw size={15}/> RESET VALUES</button></div><div className="w3-output-card"><div className="w3-output-lamp" style={{ '--lamp-alpha': `${.12 + duty / 100 * .88}`, '--lamp-glow': `${8 + duty * .45}px` } as CSSProperties}/><div className="w3-output-readout"><span>PWM COMMAND</span><strong>{pwm}<small> / 255</small></strong><b>{duty.toFixed(0)}% DUTY</b></div><div className="w3-pulsebar"><i style={{ width: `${duty}%` }}/></div><p>Input position: {span === 0 ? 'calibration endpoints must differ' : `${clamp((raw - darkRaw) / span * 100, 0, 100).toFixed(1)}% of calibrated span`}</p></div></div><p className="w3-model-warning">The mapping is constrained to 0–255. If both endpoints match, the model returns 0 instead of dividing by zero.</p></div>;
}

function PinMapCheck() {
  const [answer, setAnswer] = useState<number | null>(null);
  const options = ['The starter sketch reads A0; the diagram indicates A5. Verify the wire/code pair.', 'A5 is always the only valid analogue input.', 'PWM output D3 should be connected to the sensor midpoint.'];
  return <div className="w3-quiz-layout"><Heading slide={10} eyebrow="SOURCE INSPECTION / A5 OR A0?" title="Before pressing Run, compare diagram and code." subtitle="The supplied LDR diagram appears to put the divider midpoint on A5. The original source reads A0; the teaching sketch uses A5." tone="coral"/><div className="w3-quiz-card"><div className="pin-compare"><span>DIAGRAM</span><b>A5</b><ArrowRight size={18}/><span>ORIGINAL CODE</span><b>A0</b></div><div className="w3-choice-list">{options.map((option, index) => <button key={option} className={`w3-choice ${answer === index ? (index === 0 ? 'is-right' : 'is-wrong') : ''}`} onClick={() => setAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{answer !== null && <p className="w3-feedback">{answer === 0 ? 'Correct. Match the physical/simulated wire to the pin named by the sketch.' : 'Compare the circuit node and code pin name. A valid pin can still be the wrong pin for this connection.'}</p>}</div></div>;
}

function MoistureCalibrationLab() {
  const [dry, setDry] = useState(260);
  const [wet, setWet] = useState(720);
  const [raw, setRaw] = useState(480);
  const denominator = wet - dry;
  const relative = denominator === 0 ? null : clamp((raw - dry) / denominator * 100, 0, 100);
  return <div className="w3-tool"><Heading slide={13} eyebrow="CALIBRATION LAB / MOISTURE MODULE" title="Describe the conditions behind the numbers." subtitle="Set sample endpoints and compare a new reading. The percent-like display is only a scaled position between your two samples." tone="blue"/><div className="w3-tool-grid"><div className="w3-tool-controls"><RangeField label="Recorded dry sample" value={dry} min={0} max={1023} onChange={setDry}/><RangeField label="Recorded damp sample" value={wet} min={0} max={1023} onChange={setWet}/><RangeField label="Current raw sample" value={raw} min={0} max={1023} onChange={setRaw}/><button className="text-button" onClick={() => { setDry(260); setWet(720); setRaw(480); }}><RotateCcw size={14}/> RESET EXAMPLE</button></div><div className="calibration-card"><div className="calibration-scale"><i style={{ left: `${relative ?? 50}%` }}/></div><div className="calibration-scale__labels"><span>DRY SAMPLE<br/><b>{dry}</b></span><span>WET SAMPLE<br/><b>{wet}</b></span></div><div className="calibration-result"><span>RAW CODE</span><strong>{raw} / 1023</strong><span>SCALED POSITION</span><strong>{relative === null ? 'Set different endpoints' : `${relative.toFixed(0)}%`}</strong></div><p className="w3-model-warning">This is not soil moisture %. Direction depends on the exact sensor module; use labelled observations and the module documentation.</p></div></div></div>;
}

function HysteresisLab() {
  const [threshold, setThreshold] = useState(100);
  const [band, setBand] = useState(10);
  const [raw, setRaw] = useState(100);
  const [state, setState] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(-1);
  const sequence = [96, 103, 98, 102, 99, 112, 106, 100, 87];
  const updateReading = (nextRaw: number) => {
    setRaw(nextRaw);
    setState((previous) => nextRaw > threshold + band ? true : nextRaw < threshold - band ? false : previous);
    setSequenceIndex(-1);
  };
  const stepSequence = () => {
    const nextIndex = (sequenceIndex + 1) % sequence.length;
    const nextRaw = sequence[nextIndex];
    setSequenceIndex(nextIndex);
    setRaw(nextRaw);
    setState((previous) => nextRaw > threshold + band ? true : nextRaw < threshold - band ? false : previous);
  };
  const lower = threshold - band;
  const upper = threshold + band;
  return <div className="w3-tool"><Heading slide={15} eyebrow="INTERACTIVE CONTROL / HYSTERESIS" title="Stop the output chattering at the boundary." subtitle="The controller changes state only outside the band; readings inside it keep the previous state." tone="coral"/><div className="hysteresis-grid"><div className="w3-tool-controls"><RangeField label="Threshold centre" value={threshold} min={100} max={923} onChange={setThreshold}/><RangeField label="Hysteresis half-width" value={band} min={0} max={100} onChange={setBand}/><RangeField label="Current sensor code" value={raw} min={0} max={1023} onChange={updateReading}/><button className="primary-button primary-button--small" onClick={stepSequence}><Activity size={15}/> STEP JITTER SEQUENCE</button><small>Sequence: {sequence.join(' · ')}</small></div><div className="hysteresis-state"><div className="hysteresis-gauge"><div className="hysteresis-gauge__band" style={{ '--lower': `${clamp(lower / 1023 * 100, 0, 100)}%`, '--width': `${clamp((2 * band) / 1023 * 100, 0, 100)}%` } as CSSProperties}/><i style={{ left: `${raw / 1023 * 100}%` }}/></div><div className="hysteresis-labels"><span>LOW <b>&lt; {lower}</b></span><span>HOLD <b>{lower}–{upper}</b></span><span>HIGH <b>&gt; {upper}</b></span></div><div className={`state-output ${state ? 'state-output--high' : ''}`}><span>{state ? 'ABOVE / OUTPUT STATE A' : 'BELOW / OUTPUT STATE B'}</span><strong>{state ? 'SERVO 10°' : 'SERVO 120°'}</strong><small>Reading {raw}; state held when it is inside the band.</small></div><pre className="w3-code-snippet"><code>{`if (raw > threshold + band) state = true;\nelse if (raw < threshold - band) state = false;\n// inside band: keep previous state`}</code></pre></div></div><p className="w3-model-warning">Angles and threshold are example logic from the teaching sketch, not calibrated plant-control recommendations.</p></div>;
}

function FaultResponse() {
  const [fault, setFault] = useState(false);
  const [lastAngle, setLastAngle] = useState(120);
  const [raw, setRaw] = useState(640);
  const angle = raw > 100 ? 10 : 120;
  useEffect(() => { if (!fault) setLastAngle(angle); }, [angle, fault]);
  return <div className="w3-tool"><Heading slide={17} eyebrow="FAULT CASE / DEFINE A SAFE RESPONSE" title="What if the sensor reading is not trustworthy?" subtitle="A reading outside the calibrated range or a stale sample should not silently drive the actuator." tone="coral"/><div className="fault-demo"><div className="w3-tool-controls"><RangeField label="Current raw code" value={raw} min={0} max={1023} onChange={setRaw}/><label className="w3-toggle"><input type="checkbox" checked={fault} onChange={(event) => setFault(event.target.checked)}/> Simulate invalid or stale reading</label><p className="w3-note w3-note--warning">A disconnected analogue pin can still produce an in-range code. Detecting failure requires known constraints, timing checks, or additional circuit design.</p></div><div className={`fault-output ${fault ? 'fault-output--warn' : ''}`}><div className="servo-gauge"><span style={{ '--servo-angle': `${fault ? lastAngle - 90 : angle - 90}deg` } as CSSProperties}/></div><strong>{fault ? 'FAULT: HOLD LAST COMMAND' : `REQUEST ${angle}°`}</strong><p>{fault ? `Output stays at the last accepted command (${lastAngle}°) and the status should be reported.` : `The demonstration threshold selects ${angle}°. This input/output response is not moisture calibration.`}</p></div></div></div>;
}

function TinkercadEmbed({ title, thingId, shareCode, publicUrl }: { title: string; thingId: string; shareCode: string; publicUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const embedUrl = `https://www.tinkercad.com/embed/${thingId}?sharecode=${encodeURIComponent(shareCode)}&editbtn=1`;
  return (
    <section className="tinkercad-embed" aria-label={`${title} Tinkercad embed`}>
      <div className="tinkercad-embed__bar">
        <button className="tinkercad-embed__toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X size={15} /> : <MonitorPlay size={15} />}{isOpen ? 'HIDE EMBED' : 'OPEN TINKERCAD HERE'}
        </button>
        <a className="tinkercad-embed__external" href={publicUrl} target="_blank" rel="noreferrer">OPEN IN NEW TAB <ExternalLink size={14} /></a>
      </div>
      {isOpen && <iframe className="tinkercad-embed__frame" src={embedUrl} title={`${title} interactive circuit`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="clipboard-read; clipboard-write" allowFullScreen />}
      <p className="tinkercad-embed__note">If the embedded simulator requests sign-in or does not load in this browser, open the public Tinkercad design in a new tab.</p>
    </section>
  );
}

function SimulationSlide({ slide, title, note, thingId, shareCode, publicUrl }: { slide: number; title: string; note: string; thingId: string; shareCode: string; publicUrl: string }) {
  return <div className="w3-simulation"><Heading slide={slide} eyebrow={`GUIDED SIMULATION / ${slide === 18 ? 'LDR → PWM' : 'MOISTURE → SERVO'}`} title={title} subtitle={note} tone="blue"/><div className="w3-sim-task"><div><span>BEFORE RUN</span><b>Predict the input/output change.</b></div><div><span>DURING RUN</span><b>Change one condition; record the raw response.</b></div><div><span>AFTER RUN</span><b>Explain observation, map, and limitation.</b></div></div><TinkercadEmbed title={slide === 18 ? 'LDR Controlled PWM' : 'Moisture Sensor Controlled Servo'} thingId={thingId} shareCode={shareCode} publicUrl={publicUrl}/><p className="w3-model-warning">SIMULATION EVIDENCE: save circuit/pin map, sketch version, changed input, observed output, and explanation. This is not physical hardware evidence.</p></div>;
}

function CodeTrace() {
  const [line, setLine] = useState(0);
  const code = ['const byte SENSOR_PIN = A5;', 'const byte LED_PIN = 3;', 'void setup() {', '  pinMode(LED_PIN, OUTPUT);', '  Serial.begin(9600);', '}', 'void loop() {', '  int raw = analogRead(SENSOR_PIN);', '  int pwm = map(raw, darkRaw, brightRaw, 0, 255);', '  pwm = constrain(pwm, 0, 255);', '  analogWrite(LED_PIN, pwm);', '  Serial.println(raw);', '}'];
  return <div className="w3-code-layout"><div><Heading slide={20} eyebrow="CODE TRACE / LDR TO PWM" title="Which line measures? Which line acts?" subtitle="Step through a readable pattern; real code should include calibration variables, input checks, and a verified pin map." tone="blue"/><div className="w3-code-buttons"><button onClick={() => setLine((value) => (value + 1) % code.length)}><ArrowRight size={15}/> STEP LINE</button><button onClick={() => setLine(0)}><RotateCcw size={14}/> RESET</button></div></div><div className="code-trace-panel"><div className="code-window-head"><span><i/>sketch.ino</span><b>LINE {line + 1} / {code.length}</b></div><pre>{code.map((text, index) => <div className={`code-line ${index === line ? 'code-line--active' : ''}`} key={index}><span>{String(index + 1).padStart(2, '0')}</span><code>{text}</code></div>)}</pre><p className="trace-caption" aria-live="polite">{line === 7 ? 'analogRead samples the analogue input into a code.' : line === 8 ? 'map scales one range to another, but does not automatically constrain or calibrate it.' : line === 9 ? 'constrain prevents output commands from exceeding the intended 0–255 range.' : line === 10 ? 'analogWrite sends a PWM duty command on a supported pin; it is not an analogue voltage.' : line === 11 ? 'Serial output helps compare the input against observed conditions.' : 'Check sensor pin, output pin, and setup before interpreting the loop.'}</p></div></div>;
}

function BoundaryTest() {
  const [threshold, setThreshold] = useState(100);
  const [raw, setRaw] = useState(100);
  const result = raw > threshold ? 'ABOVE' : raw < threshold ? 'BELOW' : 'EQUAL';
  return <div className="w3-tool"><Heading slide={14} eyebrow="BOUNDARY TEST / EXACT COMPARISON" title="Test below, equal to, and above." subtitle="The starter logic uses a strict greater-than test. Equality falls into the else branch; write tests that prove it."/><div className="boundary-test"><div className="w3-tool-controls"><RangeField label="Threshold code" value={threshold} min={0} max={1023} onChange={setThreshold}/><RangeField label="Sensor code" value={raw} min={0} max={1023} onChange={setRaw}/><div className="boundary-presets">{[-1,0,1].map((delta) => <button key={delta} onClick={() => setRaw(clamp(threshold + delta, 0, 1023))}>{delta < 0 ? 'BELOW' : delta === 0 ? 'EQUAL' : 'ABOVE'}</button>)}</div></div><div className={`boundary-result boundary-result--${result.toLowerCase()}`}><span>raw {raw} {result === 'ABOVE' ? '>' : result === 'BELOW' ? '<' : '='} threshold {threshold}</span><strong>{result}</strong><small>{raw > threshold ? 'if branch: threshold condition true' : 'else branch: threshold condition false'}</small></div></div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="w3-metric"><span>{label}</span><b>{value}</b></div>; }
function RangeField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="w3-range"><span>{label}<b>{value}</b></span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))}/></label>;
}

function BreakSlide({ second }: { second: boolean }) {
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || seconds <= 0) return; const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [running, seconds]);
  useEffect(() => { if (seconds === 0) setRunning(false); }, [seconds]);
  const minutes = Math.floor(seconds / 60);
  return <div className="break-layout"><div className="break-copy"><Eyebrow tone="blue">PAUSE / {second ? '02' : '01'} OF 02</Eyebrow><h1 id={`week3-title-${second ? 25 : 11}`}>{second ? 'Step away before synthesis.' : 'Reset before the moisture sensor.'}</h1><p>{second ? 'Return ready to compare calibration evidence and defend a safe response.' : 'You have moved from light to voltage, codes, and PWM. Take a short pause before applying calibration to a second sensor.'}</p><div className="break-cues"><span><b>01</b> Rest your eyes.</span><span><b>02</b> Note one open question.</span><span><b>03</b> Return ready to test.</span></div></div><div className="break-timer-panel"><span className="break-timer-label">OPTIONAL SILENT TIMER</span><div className="break-timer">{String(minutes).padStart(2,'0')}<i>:</i>{String(seconds % 60).padStart(2,'0')}</div><div className="break-timer-controls"><button className="primary-button primary-button--small" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={14}/> : <Play size={14}/>} {running ? 'PAUSE' : 'START 10 MIN'}</button><button className="reset-button" onClick={() => { setSeconds(600); setRunning(false); }} aria-label="Reset timer"><RotateCcw size={15}/></button></div><p>The lesson will not advance automatically.</p></div></div>;
}

function DebugActivity() {
  const cases = [
    ['The LED PWM appears inverted.', 'Check whether ADC counts rise or fall with light, then inspect divider orientation and map endpoints.'],
    ['The moisture state flickers at the threshold.', 'Log repeated raw samples; test boundary values, noise, and a hysteresis band.'],
    ['The servo resets when it moves.', 'Inspect supply current capability, wiring, and ground reference; do not power it from a GPIO.'],
  ];
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  return <div className="w3-tool"><Heading slide={21} eyebrow="DEBUG FROM EVIDENCE / CASE FILES" title="Observe first. Change one thing." subtitle="Choose a hypothesis, then compare the evidence before changing the circuit or code." tone="blue"/><div className="debug-card"><span className="quiz-label">CASE {index + 1} / {cases.length}</span><h2>{cases[index][0]}</h2>{revealed ? <div className="debug-feedback"><b>Useful first checks</b><p>{cases[index][1]}</p></div> : <button className="primary-button primary-button--small" onClick={() => setRevealed(true)}>REVEAL CHECKS <CircleHelp size={15}/></button>}<div className="debug-controls"><button onClick={() => { setIndex((value) => (value + 1) % cases.length); setRevealed(false); }}><ArrowRight size={15}/> NEXT CASE</button><span>Record expected → observed → explanation.</span></div></div></div>;
}

function TeamChallenge() {
  const [threshold, setThreshold] = useState(420);
  const [band, setBand] = useState(18);
  const [status, setStatus] = useState('Draft your test plan.');
  return <div className="w3-tool"><Heading slide={22} eyebrow="TEAM DESIGN CHALLENGE / 40 MINUTES" title="Design a calibrated indicator response." subtitle="Build a defendable moisture-to-servo rule from measured dry/damp readings, then test its boundary and failure behaviour."/><div className="team-design"><div className="w3-tool-controls"><RangeField label="Provisional threshold (ADC counts)" value={threshold} min={100} max={923} onChange={setThreshold}/><RangeField label="Hysteresis half-width" value={band} min={0} max={100} onChange={setBand}/><button className="primary-button primary-button--small" onClick={() => setStatus('Test below, inside, and above the band. Record each expected and actual state.')}>CHECK DESIGN <Check size={15}/></button></div><div className="team-board"><div><span>LOW TRANSITION</span><b>{threshold - band}</b></div><div><span>HOLD REGION</span><b>{threshold - band}–{threshold + band}</b></div><div><span>HIGH TRANSITION</span><b>{threshold + band}</b></div><p>{status}</p><ul><li>What measured evidence supports the chosen threshold?</li><li>What state should be held inside the band?</li><li>How will a stale or implausible reading be reported?</li></ul></div></div></div>;
}

function EvidenceLog() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = ['Circuit and pin map captured', 'Sketch version recorded', 'Input or condition change stated', 'Expected response written before run', 'Observed output recorded', 'Calibration limitation explained', 'SIMULATION label included'];
  const completed = Object.values(checks).filter(Boolean).length;
  return <div className="w3-tool"><Heading slide={23} eyebrow="EVIDENCE / INDIVIDUAL LOGBOOK" title="Make the simulation reproducible." subtitle="Capture enough context for another person to understand and repeat your result." tone="blue"/><div className="evidence-layout"><div className="evidence-checklist">{items.map((item) => <label key={item}><input type="checkbox" checked={checks[item] ?? false} onChange={(event) => setChecks((current) => ({ ...current, [item]: event.target.checked }))}/><span>{item}</span></label>)}</div><div className="evidence-score"><span>CHECKLIST</span><strong>{completed} / {items.length}</strong><p>Label all simulator screenshots SIMULATION. Keep simulated and physical datasets separate.</p></div></div></div>;
}

function Debrief({ addPoints }: { addPoints: (amount: number) => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  return <div className="w3-tool"><Heading slide={24} eyebrow="TEAM DEBRIEF / COMPARE EVIDENCE" title="Same condition, different ADC count?" subtitle="Compare setups before comparing conclusions: divider wiring, reference, board, sensor, and environment all matter."/><div className="debrief-card"><span className="quiz-label">DISCUSSION PROMPT</span><h2>Which detail would you ask another group to report first?</h2><div className="debrief-options">{['Exact board and analogue pin', 'Divider component order and resistor value', 'Named light/moisture conditions and repeats'].map((item) => <button key={item} className={choice === item ? 'is-selected' : ''} onClick={() => setChoice(item)}>{item}{choice === item && <Check size={15}/>}</button>)}</div>{choice && <p>All three are useful context. A reading without setup and condition labels is difficult to interpret or reproduce.</p>}<button className="text-button" onClick={() => addPoints(5)}><Sparkles size={14}/> ADD CONTRIBUTION POINTS</button></div></div>;
}

function ExitTicket() {
  const questions = [
    { prompt: 'What does an ADC code represent?', options: ['A voltage-derived digital code for the configured board/reference', 'Lux directly, on every LDR', 'PWM duty'], answer: 0 },
    { prompt: 'What does PWM change?', options: ['The high-time fraction of a digital pulse train', 'The LED forward voltage', 'The ADC resolution'], answer: 0 },
    { prompt: 'Why add hysteresis?', options: ['Reduce switching from noise near a threshold', 'Increase the ADC bit depth', 'Power a servo'], answer: 0 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  return <div className="exit-layout"><div className="exit-heading"><Heading slide={26} eyebrow="EXIT TICKET / 60 SECONDS" title={<>Measure carefully.<br/><span className="text-blue">Respond deliberately.</span></>} subtitle="Check the key ideas, then write one calibration question for the next lab." tone="blue"/><div className="exit-score"><span>YOUR CHECK</span><b>{score} / 3</b></div></div><div className="exit-quiz">{questions.map((question, questionIndex) => <section className="exit-question" key={question.prompt}><div className="exit-question__prompt"><span>0{questionIndex + 1}</span><b>{question.prompt}</b></div><div className="exit-options">{question.options.map((option, optionIndex) => <button key={option} className={answers[questionIndex] === optionIndex ? (optionIndex === question.answer ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}>{option}</button>)}</div></section>)}<label className="reflection-field"><span>ONE QUESTION ABOUT CALIBRATION</span><textarea rows={2} placeholder="e.g. Which board, sensor, divider, and conditions were recorded?"/></label><p className="w3-model-warning">Week 6 physical lab evidence must come from supervised physical measurement, not these simulators.</p></div></div>;
}

export default App;
