import type { ComponentType } from 'react';
import { Droplets, Gauge, HeartPulse, Radiation, Thermometer } from 'lucide-react';
import type { FigureRegionId } from '../lib/bodyRegions';
import { buildRegionViews } from '../lib/bodyView';
import type { CheckTab } from '../lib/guides';
import { formatValue, indicatorById } from '../lib/indicators';
import { crew } from '../lib/mockData';
import { buildReminders, dueText, needsDoing } from '../lib/reminders';
import { assessSpaceWeather, useSpaceWeather } from '../lib/spaceWeather';
import { evaluateAstronaut, nextStep, type AstronautEval } from '../lib/status';
import { readingsFor, useData } from '../lib/store';
import type { IndicatorId, Status } from '../lib/types';
import { BodyFigure } from '../components/BodyFigure';
import { RemindersPanel } from '../components/RemindersPanel';
import { SourceTag } from '../components/SourceTag';
import { SpaceWeatherPanel } from '../components/SpaceWeatherPanel';
import { Sparkline } from '../components/Sparkline';
import { StatusBadge } from '../components/StatusBadge';
import { TrendExplorer } from '../components/TrendExplorer';

const DAY = 86_400_000;
const NBSP = String.fromCharCode(160);
const list = (names: string[]) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/** One plain sentence per status group, worst first. */
function crewSummary(groups: Record<Status, string[]>): { status: Status; text: string }[] {
  const out: { status: Status; text: string }[] = [];
  if (groups.act.length) out.push({ status: 'act', text: `${list(groups.act)} ${groups.act.length > 1 ? 'need' : 'needs'} action today.` });
  if (groups.watch.length) out.push({ status: 'watch', text: `${list(groups.watch)} ${groups.watch.length > 1 ? 'are' : 'is'} on watch.` });
  if (groups.ok.length) out.push({ status: 'ok', text: groups.act.length + groups.watch.length === 0 ? 'Everyone is within their baseline.' : `${list(groups.ok)} ${groups.ok.length > 1 ? 'are' : 'is'} clear.` });
  return out;
}

type Icon = ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
const VITALS: { id: IndicatorId; pair?: IndicatorId; label: string; icon: Icon; tint: string }[] = [
  { id: 'heartRate', label: 'Heart rate', icon: HeartPulse, tint: 'rose' },
  { id: 'systolic', pair: 'diastolic', label: 'Blood pressure', icon: Gauge, tint: 'violet' },
  { id: 'spo2', label: 'Blood oxygen', icon: Droplets, tint: 'sky' },
  { id: 'temperature', label: 'Temperature', icon: Thermometer, tint: 'teal' },
];
const WELLBEING: { id: IndicatorId; label: string; max: number; low: string; high: string }[] = [
  { id: 'sleepHours', label: 'Sleep', max: 10, low: '0 h', high: '10 h' },
  { id: 'mood', label: 'Mood', max: 5, low: 'very low', high: 'great' },
  { id: 'stress', label: 'Stress', max: 5, low: 'calm', high: 'very stressed' },
  { id: 'fatigue', label: 'Fatigue', max: 5, low: 'rested', high: 'exhausted' },
];

interface Props {
  astronautId: string;
  onSelect: (id: string) => void;
  onOpenBody: (region?: FigureRegionId) => void;
  onOpenInsights: () => void;
  onOpenCheck: (id: string, tab: CheckTab) => void;
  onOpenStormGuide: () => void;
}

/** All-in-one view: crew at a glance, then one astronaut's vitals, body, checks, trends and wellbeing. */
export function Dashboard({ astronautId, onSelect, onOpenBody, onOpenInsights, onOpenCheck, onOpenStormGuide }: Props) {
  const data = useData();
  const weather = useSpaceWeather();
  const sw = assessSpaceWeather(weather.events, data.now, data.environment);

  const rows = crew.map((a) => ({ a, ev: evaluateAstronaut(a.id, data.readings, data.skinScans, data.now, data.symptomLogs) }));
  const groups: Record<Status, string[]> = { act: [], watch: [], ok: [] };
  // Non-breaking spaces keep each name on one line in the headline
  for (const { a, ev } of rows) if (ev.hasData) groups[ev.status].push(a.name.replace(/ /g, NBSP));
  const summary = crewSummary(groups);
  const date = new Date(data.now).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const { a, ev } = rows.find((r) => r.a.id === astronautId) ?? rows[0];
  const views = buildRegionViews(a.id, ev, data.skinScans);
  const reminders = buildReminders(a.id, ev, data.skinScans, data.now);
  const todo = reminders.filter(needsDoing);
  const done = reminders.length - todo.length;

  return (
    <section className="dashboard">
      <header className="dash-head">
        <p className="page-meta">{date}, mission day {crew[0].missionDay}</p>
        <h2>Crew health</h2>
        {summary.length > 0 && (
          <p className="crew-summary">{summary.map((s) => <span key={s.status} className={`summary-${s.status}`}>{s.text} </span>)}</p>
        )}
      </header>

      <div className="crew-strip" role="group" aria-label="Choose a crew member">
        {rows.map(({ a: c, ev: e }) => (
          <button key={c.id} type="button" aria-pressed={c.id === a.id} className={`crew-pick${c.id === a.id ? ' active' : ''}`} onClick={() => onSelect(c.id)}>
            <span className={`avatar avatar-lg avatar-${e.hasData ? e.status : 'none'}`} aria-hidden="true">{c.name.split(' ').pop()![0]}</span>
            <span className="crew-pick-who">
              <strong>{c.name}</strong>
              <span className="muted">{c.role}</span>
            </span>
            {e.hasData && <StatusBadge status={e.status} />}
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-col vitals-col">
          {VITALS.map((v) => <VitalTile key={v.id} v={v} ev={ev} astronautId={a.id} />)}
        </div>

        <div className="panel body-card">
          <div className="panel-head">
            <h3>Body overview</h3>
            <button type="button" className="ghost" onClick={() => onOpenBody()}>Open body map</button>
          </div>
          <div className="viewfinder">
            <BodyFigure views={views} onPick={(id) => onOpenBody(id)} callouts />
          </div>
          <ul className="legend" aria-label="Body parts by status">
            {(['act', 'watch', 'ok'] as Status[]).map((st) => {
              const n = views.filter((x) => x.status === st).length;
              return n > 0 && <li key={st}><span className={`status-dot status-dot-${st}`} />{n} {st === 'ok' ? 'OK' : st === 'act' ? 'need action' : 'to watch'}</li>;
            })}
            <li className="muted">Select a part to see details</li>
          </ul>
        </div>

        <div className="dash-col">
          <div className="panel checks-card">
            <div className="panel-head"><h3>Checks</h3></div>
            <div className="ring-row">
              <Ring value={done} total={reminders.length} />
              <div>
                <p className="ring-big">{done} of {reminders.length}</p>
                <p className="muted">checks up to date</p>
              </div>
            </div>
            {todo.length > 0 ? (
              <ul className="todo-list">
                {todo.map((r) => (
                  <li key={r.id}>
                    <button type="button" className={`todo-item todo-${r.state}`} onClick={() => onOpenCheck(a.id, r.tab)}>
                      <span>{r.label}</span><span className="todo-when">{dueText(r)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">All checks are done for now.</p>}
          </div>

          <div className="panel radiation-card">
            <div className="panel-head">
              <h3 className="with-icon"><span className="tile-icon tint-amber" aria-hidden="true"><Radiation size={15} strokeWidth={2} /></span>Radiation</h3>
              <StatusBadge status={sw.status} />
            </div>
            <p className="dose"><strong>{a.radiationMSv}</strong> mSv so far <SourceTag source="estimated" /></p>
            <p className="muted">{sw.headline}.</p>
            {sw.status !== 'ok' && <button type="button" className="ghost" onClick={onOpenStormGuide}>Radiation storm guide</button>}
          </div>
        </div>
      </div>

      <div className="dash-row">
        <TrendExplorer key={a.id} astronautId={a.id} title="Health trends" />

        <div className="dash-col">
          <Attention ev={ev} onOpenInsights={onOpenInsights} />
          <div className="panel wellbeing">
            <div className="panel-head"><h3>Sleep and wellbeing</h3></div>
            {WELLBEING.map((w) => {
              const i = ev.indicators.find((x) => x.def.id === w.id);
              if (!i?.latest) return null;
              return (
                <div className="meter" key={w.id}>
                  <div className="meter-head">
                    <span>{w.label}</span>
                    <span><strong>{formatValue(i.def, i.latest.value)}</strong> {i.status !== 'ok' && <StatusBadge status={i.status} />}</span>
                  </div>
                  <div className="meter-track" role="img" aria-label={`${w.label} ${formatValue(i.def, i.latest.value)} on a scale from ${w.low} to ${w.high}`}>
                    <div className="meter-fill" style={{ width: `${Math.min(100, (i.latest.value / w.max) * 100)}%` }} />
                    {i.baseline !== undefined && <div className="meter-base" style={{ left: `${Math.min(100, (i.baseline / w.max) * 100)}%` }} />}
                  </div>
                </div>
              );
            })}
            <p className="muted meter-key"><span className="meter-base-key" aria-hidden="true" /> your baseline</p>
          </div>
        </div>
      </div>

      <div className="dash-row dash-row-even">
        <RemindersPanel onOpen={onOpenCheck} />
        <SpaceWeatherPanel onOpenStormGuide={onOpenStormGuide} />
      </div>
    </section>
  );
}

function VitalTile({ v, ev, astronautId }: { v: (typeof VITALS)[number]; ev: AstronautEval; astronautId: string }) {
  const data = useData();
  const main = ev.indicators.find((i) => i.def.id === v.id);
  const pair = v.pair ? ev.indicators.find((i) => i.def.id === v.pair) : undefined;
  const I = v.icon;
  const def = indicatorById[v.id];
  const spark = readingsFor(data, astronautId, v.id).filter((r) => Date.parse(r.takenAt) >= data.now - 14 * DAY).map((r) => r.value);
  const worstOf = [main?.status, pair?.status];
  const status: Status | undefined = !main?.latest ? undefined : worstOf.includes('act') ? 'act' : worstOf.includes('watch') ? 'watch' : 'ok';
  const value = !main?.latest ? '—' : pair?.latest ? `${main.latest.value.toFixed(0)}/${pair.latest.value.toFixed(0)}` : main.latest.value.toFixed(def.decimals);

  return (
    <div className={`panel vital-tile${status && status !== 'ok' ? ` vital-${status}` : ''}`}>
      <div className="vital-head">
        <span className={`tile-icon tint-${v.tint}`} aria-hidden="true"><I size={16} strokeWidth={2} /></span>
        <span className="vital-label">{v.label}</span>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="vital-body">
        <p className="vital-value"><strong>{value}</strong> <span className="vital-unit">{def.unit}</span></p>
        <Sparkline values={spark} />
      </div>
      <div className="vital-foot">
        {main?.baseline !== undefined ? <span className="muted">baseline {formatValue(def, main.baseline)}</span> : <span className="muted">last 14 days</span>}
        {main?.latest && <SourceTag source={main.latest.source} />}
      </div>
    </div>
  );
}

function Ring({ value, total }: { value: number; total: number }) {
  const r = 26, c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <svg className="ring" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="ring-track" />
      <circle cx="32" cy="32" r={r} className="ring-fill" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 32 32)" />
    </svg>
  );
}

function Attention({ ev, onOpenInsights }: { ev: AstronautEval; onOpenInsights: () => void }) {
  const flagged = ev.headlines.filter((h) => h.status !== 'ok');
  return (
    <div className={`panel attention${ev.hasData ? ` attention-${ev.status}` : ''}`}>
      <div className="panel-head"><h3>Needs attention</h3>{ev.hasData && <StatusBadge status={ev.status} />}</div>
      {!ev.hasData ? <p className="muted">No data yet. Log a check-in to start a baseline.</p> : flagged.length === 0 ? (
        <p className="muted">Nothing flagged. All indicators are within baseline.</p>
      ) : (
        <ul className="findings">
          {flagged.map((r) => (
            <li key={r.text} className={`finding finding-${r.status}`}>
              <span>{r.text}</span>
              {(r.source === 'simulated' || r.source === 'estimated') && <SourceTag source={r.source} />}
            </li>
          ))}
        </ul>
      )}
      {ev.hasData && <p className="next">{nextStep[ev.status]}</p>}
      {flagged.length > 0 && <button type="button" className="primary" onClick={onOpenInsights}>See what to do</button>}
    </div>
  );
}
