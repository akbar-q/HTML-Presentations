import { useState } from 'react';
import { ArrowRight, ExternalLink, MonitorPlay, X } from 'lucide-react';

const ledData = [
  { name: 'Red', vf: 1.9, range: '1.8–2.2 V', color: '#ef5149' },
  { name: 'Amber', vf: 2.1, range: '2.0–2.3 V', color: '#f48a3c' },
  { name: 'Yellow', vf: 2.1, range: '2.0–2.4 V', color: '#e8c94b' },
  { name: 'Green', vf: 2.2, range: '2.0–3.3 V', color: '#56a878' },
  { name: 'Blue', vf: 3.1, range: '2.8–3.5 V', color: '#4388db' },
  { name: 'White', vf: 3.2, range: '2.8–3.6 V', color: '#dce7ea' },
  { name: 'Infrared', vf: 1.3, range: '1.2–1.6 V', color: '#ba6565' },
];

const bandDigits = [
  { name: 'Black', value: 0, color: '#252a2d' },
  { name: 'Brown', value: 1, color: '#805038' },
  { name: 'Red', value: 2, color: '#d94a3f' },
  { name: 'Orange', value: 3, color: '#ee8d38' },
  { name: 'Yellow', value: 4, color: '#e7cc45' },
  { name: 'Green', value: 5, color: '#42956c' },
  { name: 'Blue', value: 6, color: '#477cc0' },
  { name: 'Violet', value: 7, color: '#865da5' },
  { name: 'Grey', value: 8, color: '#92999c' },
  { name: 'White', value: 9, color: '#f0f0e9' },
];
const multipliers = [...bandDigits.map((band) => ({ ...band, factor: 10 ** band.value })), { name: 'Gold', value: -1, factor: 0.1, color: '#c4a34e' }, { name: 'Silver', value: -2, factor: 0.01, color: '#aeb8bf' }];
const tolerances = [
  { name: 'Brown', percent: 1, color: '#805038' }, { name: 'Red', percent: 2, color: '#d94a3f' },
  { name: 'Green', percent: 0.5, color: '#42956c' }, { name: 'Blue', percent: 0.25, color: '#477cc0' },
  { name: 'Violet', percent: 0.1, color: '#865da5' }, { name: 'Grey', percent: 0.05, color: '#92999c' },
  { name: 'Gold', percent: 5, color: '#c4a34e' }, { name: 'Silver', percent: 10, color: '#aeb8bf' },
];
const formatOhms = (value: number) => value >= 1e6 ? `${(value / 1e6).toPrecision(3)} MΩ` : value >= 1000 ? `${(value / 1000).toPrecision(3)} kΩ` : `${Number(value.toPrecision(4))} Ω`;

function LabHeading({ id, eyebrow, title, note }: { id: string; eyebrow: string; title: string; note: string }) {
  return <header className="lab-component-heading"><span className="quiz-label">{eyebrow}</span><h2 id={id}>{title}</h2><p>{note}</p></header>;
}

export function TinkercadEmbed({ title, thingId, shareCode, publicUrl }: { title: string; thingId: string; shareCode: string; publicUrl: string }) {
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

export function BandCalculator() {
  const [bandCount, setBandCount] = useState<4 | 5>(4);
  const [bands, setBands] = useState(['Orange', 'Orange', 'Brown', 'Gold', 'Brown']);
  const digitCount = bandCount === 4 ? 2 : 3;
  const digits = bands.slice(0, digitCount).map((name) => bandDigits.find((item) => item.name === name)?.value ?? 0);
  const multiplier = multipliers.find((item) => item.name === bands[digitCount])?.factor ?? 1;
  const value = Number(digits.join('')) * multiplier;
  const tolerance = tolerances.find((item) => item.name === bands[digitCount + 1])?.percent ?? 5;
  const setBand = (index: number, name: string) => setBands((current) => current.map((item, currentIndex) => currentIndex === index ? name : item));
  return (
    <div className="bands-layout">
      <LabHeading id="week2-title-13" eyebrow="PASSIVE COMPONENT / LIVE DECODER" title="Read the resistor." note="Select each band, then compare the nominal value with its tolerance range." />
      <div className="bands-panel">
        <div className="bands-mode"><span>NUMBER OF BANDS</span><div className="segmented-control"><button className={bandCount === 4 ? 'is-active' : ''} onClick={() => setBandCount(4)}>4 BAND</button><button className={bandCount === 5 ? 'is-active' : ''} onClick={() => setBandCount(5)}>5 BAND</button></div></div>
        <div className="resistor-illustration" role="img" aria-label={`${bandCount}-band resistor with value ${formatOhms(value)} plus or minus ${tolerance} percent`}><span className="resistor-lead"/><div className="resistor-body"><i/>{bands.slice(0, bandCount).map((name, index) => <span key={index} style={{ backgroundColor: (bandDigits.find((band) => band.name === name) ?? multipliers.find((band) => band.name === name) ?? tolerances.find((band) => band.name === name))?.color }}/>)}</div><span className="resistor-lead"/></div>
        <div className="band-selectors">{Array.from({ length: bandCount }, (_, index) => <label key={index}>BAND {index + 1}<select value={bands[index]} onChange={(event) => setBand(index, event.target.value)}>{(index < digitCount ? bandDigits : index === digitCount ? multipliers : tolerances).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>)}</div>
        <div className="band-result"><div><span>NOMINAL RESISTANCE</span><strong>{formatOhms(value)}</strong></div><div><span>TOLERANCE</span><strong>±{tolerance}%</strong></div><div><span>LIKELY RANGE</span><strong>{formatOhms(value * (1 - tolerance / 100))}–{formatOhms(value * (1 + tolerance / 100))}</strong></div></div>
        <p className="model-disclaimer">Read from the end opposite the wider-spaced tolerance band. Real components may use different band conventions; confirm with a meter where required.</p>
      </div>
    </div>
  );
}

export function BandQuiz() {
  const [choice, setChoice] = useState<number | null>(null);
  const choices = ['27 Ω ±5%', '270 Ω ±5%', '2.7 kΩ ±5%'];
  return <div className="band-quiz-layout"><LabHeading id="week2-title-14" eyebrow="QUICK CHECK / DECODE" title="Red · Violet · Brown · Gold" note="Two significant digits, multiplier, tolerance. Choose the decoded value."/><div className="band-quiz-card"><div className="mini-resistor"><span style={{ backgroundColor: '#d94a3f' }}/><span style={{ backgroundColor: '#865da5' }}/><span style={{ backgroundColor: '#805038' }}/><span style={{ backgroundColor: '#c4a34e' }}/></div><div className="debug-options">{choices.map((item, index) => <button key={item} className={`quiz-choice ${choice === index ? (index === 1 ? 'is-correct' : 'is-wrong') : ''}`} onClick={() => setChoice(index)}><span>{String.fromCharCode(65 + index)}</span>{item}</button>)}</div>{choice !== null && <p className="debug-feedback">{choice === 1 ? 'Correct: 27 × 10 = 270 Ω; gold means ±5%.' : 'Try again: red is 2, violet is 7, brown multiplies by 10, and gold is ±5%.'}</p>}</div></div>;
}

export function LedReference() {
  return <div className="led-reference-layout"><LabHeading id="week2-title-16" eyebrow="REFERENCE / INDICATIVE ONLY" title="LED colour is a clue, not a specification." note="Forward voltage varies with part, current, and temperature. Use the exact manufacturer datasheet for design."/><div className="led-reference-table"><div className="led-reference-row led-reference-row--head"><span>EMISSION</span><span>COMMON Vf RANGE</span><span>EXAMPLE Vf</span><span>DESIGN REMINDER</span></div>{ledData.map((led) => <div className="led-reference-row" key={led.name}><span><i style={{ background: led.color }}/>{led.name}</span><b>{led.range}</b><span>{led.vf.toFixed(1)} V</span><small>Check the component datasheet</small></div>)}</div><p className="model-disclaimer">Ranges are broad classroom examples, not guarantees. White and blue LEDs commonly need more voltage headroom than red or infrared LEDs.</p></div>;
}

function ledCurrent(voltage: number, vf: number, referenceCurrent = 0.02) {
  return voltage <= 0 ? 0 : referenceCurrent * Math.exp(Math.max(-60, Math.min(5, (voltage - vf) / 0.08)));
}

export function IvLab() {
  const [ledName, setLedName] = useState('White');
  const [supply, setSupply] = useState(9);
  const [resistance, setResistance] = useState(330);
  const led = ledData.find((item) => item.name === ledName)!;
  const maxCurrent = 60;
  const maxVoltage = Math.max(5, supply);
  const curve = Array.from({ length: 81 }, (_, index) => {
    const voltage = maxVoltage * index / 80;
    return { voltage, current: Math.min(maxCurrent, ledCurrent(voltage, led.vf) * 1000) };
  });
  let low = 0;
  let high = maxVoltage;
  for (let iteration = 0; iteration < 40; iteration++) {
    const voltage = (low + high) / 2;
    const diodeCurrent = ledCurrent(voltage, led.vf);
    const resistorCurrent = Math.max(0, (supply - voltage) / resistance);
    if (diodeCurrent > resistorCurrent) high = voltage;
    else low = voltage;
  }
  const opVoltage = (low + high) / 2;
  const opCurrent = ledCurrent(opVoltage, led.vf) * 1000;
  const point = (voltage: number, current: number) => `${48 + voltage / maxVoltage * 410},${208 - Math.min(maxCurrent, current) / maxCurrent * 180}`;
  const curvePath = curve.map((item, index) => `${index ? 'L' : 'M'}${point(item.voltage, item.current)}`).join(' ');
  const loadPath = `M${point(0, supply / resistance * 1000)} L${point(Math.min(supply, maxVoltage), 0)}`;
  return <div className="iv-layout"><LabHeading id="week2-title-18" eyebrow="INTERACTIVE DEVICE MODEL / NOT A DATASHEET" title="The knee is steep. Add a load line." note="Adjust the LED, supply, and resistor. Their intersection estimates the operating point in this simplified model."/><div className="iv-layout-grid"><div className="iv-chart-card"><svg viewBox="0 0 500 250" role="img" aria-label={`Illustrative ${led.name} LED current-voltage curve and resistor load line. Estimated operating current ${opCurrent.toFixed(1)} milliamps.`}><rect x="48" y="28" width="410" height="180" className="plot-bg"/>{[0,20,40,60].map((current) => <g key={current}><line x1="48" x2="458" y1={208 - current / maxCurrent * 180} y2={208 - current / maxCurrent * 180} className="grid-line"/><text x="40" y={212 - current / maxCurrent * 180} textAnchor="end" className="axis-label">{current}</text></g>)}<path d={curvePath} className="iv-curve-line"/><path d={loadPath} className="load-line"/><circle cx={48 + opVoltage / maxVoltage * 410} cy={208 - Math.min(maxCurrent, opCurrent) / maxCurrent * 180} r="6" className="iv-operating-point"/><text x="58" y="18" className="axis-title">CURRENT (mA)</text><text x="390" y="238" className="axis-title">LED Vf (V)</text></svg><div className="chart-legend"><span><i className="curve-key"/>LED model</span><span><i className="load-key"/>Resistor load line</span><b>OP {opCurrent.toFixed(1)} mA @ {opVoltage.toFixed(2)} V</b></div></div><div className="iv-controls"><label>LED<select value={ledName} onChange={(event) => setLedName(event.target.value)}>{ledData.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>Supply <b>{supply.toFixed(1)} V</b><input type="range" min="5" max="12" step="0.5" value={supply} onChange={(event) => setSupply(Number(event.target.value))}/></label><label>Series resistor <b>{resistance} Ω</b><input type="range" min="68" max="1000" step="1" value={resistance} onChange={(event) => setResistance(Number(event.target.value))}/></label><p className="model-disclaimer">Illustrative exponential I–V curve with an ideal resistor load line. It does not model a specific part, temperature, tolerance, or failure threshold. Never remove the current-limiting resistor.</p></div></div></div>;
}

export function LedCircuitSimulation() {
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [count, setCount] = useState(2);
  const [ledName, setLedName] = useState('Red');
  const [powered, setPowered] = useState(true);
  const led = ledData.find((item) => item.name === ledName)!;
  const branchCount = mode === 'parallel' ? count : 1;
  const ledsPerBranch = mode === 'series' ? count : 1;
  const rows = Array.from({ length: branchCount }, (_, index) => branchCount === 1 ? 190 : 70 + index * 68);
  const railTop = Math.min(145, ...rows);
  const railBottom = Math.max(230, ...rows);
  const headroom = 9 - led.vf * ledsPerBranch;
  return (
    <div className="tinkercad-layout">
      <LabHeading id="week2-title-21" eyebrow="SIMULATION 01 / 9 V LED CIRCUIT" title="Inspect the circuit. Then explain it." note="A local circuit model for topology and polarity. The linked Tinkercad project is a separate simulation." />
      <div className="tinkercad-grid">
        <div className="bench-sim">
          <div className="sim-toolbar"><span>9 V BATTERY / CURRENT-LIMITED BRANCHES</span><button className={`sim-power ${powered ? 'is-on' : ''}`} onClick={() => setPowered((value) => !value)}>{powered ? 'POWER ON' : 'POWER OFF'}</button></div>
          <svg viewBox="0 0 720 380" role="img" aria-label={`${mode} circuit with ${branchCount} LED branch${branchCount > 1 ? 'es' : ''}, each with a resistor`}>
            <rect x="34" y="113" width="90" height="150" rx="10" className="battery-outline" />
            <text x="79" y="187" textAnchor="middle" className="battery-text">9 V</text><text x="79" y="286" textAnchor="middle" className="diagram-label">BATTERY</text>
            <path d={`M124 145 H165 M165 ${railTop} V${railBottom} M124 230 H625 M625 ${railTop} V${railBottom}`} className="circuit-wire" />
            {rows.map((y, branchIndex) => (
              <g key={branchIndex}>
                <path d={`M165 ${y} H220`} className="circuit-wire circuit-wire--positive" />
                <rect x="220" y={y - 13} width="72" height="26" rx="5" className="circuit-resistor" />
                <text x="256" y={y + 4} textAnchor="middle" className="diagram-dark-text">R{branchIndex + 1}</text>
                <path d={`M292 ${y} H370`} className="circuit-wire" />
                {Array.from({ length: ledsPerBranch }, (_, ledIndex) => {
                  const x = 370 + ledIndex * 74;
                  return <g key={ledIndex}><path d={`M${x} ${y - 12} L${x + 22} ${y} L${x} ${y + 12} Z`} className={powered && headroom > 0 ? 'bench-led bench-led--on' : 'bench-led'} style={{ stroke: led.color, fill: powered && headroom > 0 ? led.color : 'transparent' }} /><path d={`M${x + 27} ${y - 14} V${y + 14}`} className="circuit-part-wire" /><path d={`M${x + 25} ${y - 18} l12 -11 M${x + 29} ${y - 10} l12 -11`} className="bench-light-rays" /></g>;
                })}
                <path d={`M${370 + (ledsPerBranch - 1) * 74 + 27} ${y} H625`} className="circuit-wire circuit-wire--return" />
              </g>
            ))}
          </svg>
          <p className="model-disclaimer">Parallel strings are shown with an individual resistor in each branch. The supplied drawing should be inspected critically; do not assume one shared resistor gives equal current sharing.</p>
        </div>
        <div className="sim-controls">
          <label>LED colour<select value={ledName} onChange={(event) => setLedName(event.target.value)}>{ledData.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label>LED count<input type="range" min="1" max="4" value={count} onChange={(event) => setCount(Number(event.target.value))} /><b>{count}</b></label>
          <div className="segmented-control"><button className={mode === 'series' ? 'is-active' : ''} onClick={() => setMode('series')}>SERIES</button><button className={mode === 'parallel' ? 'is-active' : ''} onClick={() => setMode('parallel')}>PARALLEL</button></div>
          <div className={`sim-callout ${headroom > 0 ? '' : 'sim-callout--warning'}`}>{headroom > 0 ? `${headroom.toFixed(1)} V remains across resistor and wiring.` : 'Insufficient nominal headroom for this LED string.'}</div>
        </div>
      </div>
      <TinkercadEmbed title="LED Interfacing" thingId="0jE23TsG6V8" shareCode="cB1osCxwd_ja-YpadmkOgm7_vhplCuqtWFejQrOQ1lE" publicUrl="https://www.tinkercad.com/things/0jE23TsG6V8-led-interfacing?sharecode=cB1osCxwd_ja-YpadmkOgm7_vhplCuqtWFejQrOQ1lE" />
    </div>
  );
}

export function ButtonLedSimulation() {
  const [pressed, setPressed] = useState(false);
  const [activeLow, setActiveLow] = useState(true);
  const rawHigh = activeLow ? !pressed : pressed;
  const ledOn = activeLow ? !rawHigh : rawHigh;
  return (
    <div className="digital-sim-layout">
      <LabHeading id="week2-title-26" eyebrow="SIMULATION 03 / INPUT → OUTPUT" title="A button can command an LED." note="Change the logic convention and compare physical state, raw pin level, and LED output." />
      <div className="digital-sim-card">
        <div className="segmented-control"><button className={activeLow ? 'is-active' : ''} onClick={() => setActiveLow(true)}>ACTIVE-LOW / PULL-UP</button><button className={!activeLow ? 'is-active' : ''} onClick={() => setActiveLow(false)}>ACTIVE-HIGH / PULL-DOWN</button></div>
        <div className="button-led-stage">
          <div className="physical-button-wrap"><button className={`physical-button ${pressed ? 'physical-button--pressed' : ''}`} onClick={() => setPressed((value) => !value)} aria-label={`Button input ${pressed ? 'pressed' : 'released'}`} aria-pressed={pressed}><span /></button><small>INPUT / D2</small><b>{pressed ? 'PRESSED' : 'RELEASED'}</b></div>
          <div className="logic-arrow"><span>digitalRead()</span><ArrowRight size={22} /><small>RAW {rawHigh ? 'HIGH' : 'LOW'}</small><ArrowRight size={22} /><span>digitalWrite()</span></div>
          <div className="large-led-wrap"><div className={`large-led ${ledOn ? 'large-led--on' : ''}`} /><small>OUTPUT / D3</small><b>{ledOn ? 'LED ON' : 'LED OFF'}</b></div>
        </div>
        <p className="sim-warning">This is a logic model, not an electrical emulator. Check the linked Tinkercad pin map and code before wiring.</p>
      </div>
      <TinkercadEmbed title="Button Controlled LED" thingId="9LWLfdLh0to" shareCode="5lUC6v8SJ1geBLviCCzwcx4W9nxnDrNwuuN5h9Tp_lo" publicUrl="https://www.tinkercad.com/things/9LWLfdLh0to-button-controlled-led?sharecode=5lUC6v8SJ1geBLviCCzwcx4W9nxnDrNwuuN5h9Tp_lo" />
    </div>
  );
}
