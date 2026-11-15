import type { Environment } from './environment';
import { GUIDES } from './guides';
import { formatValue } from './indicators';
import { worst, type AstronautEval, type Reason } from './status';
import type { Astronaut, Status } from './types';

/**
 * Insights (PRD §5.9): turns the reasons from the status rules into advice a non-doctor can act on.
 * Every insight states what we saw, why it matters in space, what to do, and when to get help.
 *
 * No new medical content here on purpose: "what we saw" comes from the rules in `status.ts`,
 * everything else from the measurement guide for that indicator (`guides.ts`) and the
 * current environment (`environment.ts`).
 */
export interface Insight {
  /** Guide id, e.g. `bloodPressure`. One insight per guide, so systolic + diastolic make one card. */
  id: string;
  title: string;
  hazard: string;
  status: Status;
  /** What we saw */
  saw: Reason[];
  /** Why it matters in space */
  why: string;
  /** True when the only finding is a skipped measurement: `todo` is then how to take it */
  onlyMissing: boolean;
  todo: string[];
  /** When to get help */
  escalate: string;
  /** Screen where the crew member acts on it */
  tab: 'check-in' | 'skin';
}

const rank: Record<Status, number> = { ok: 0, watch: 1, act: 2 };

/** Extra line for Act-level findings: how to reach the flight surgeon from here. */
export function reportAdvice(env: Environment): string {
  return env.liveHelp
    ? `This is at the Act level: report it to the flight surgeon today. From here you can talk live (signal delay ${env.commDelay}).`
    : `This is at the Act level: send a report to the flight surgeon today and start the steps above without waiting for the reply (signal delay ${env.commDelay}).`;
}

export function buildInsights(ev: AstronautEval, env: Environment): Insight[] {
  const out: Insight[] = [];
  for (const g of GUIDES) {
    const saw = g.id === 'skin'
      ? ev.reasons.filter((r) => r.kind === 'skin')
      : ev.reasons.filter((r) => r.indicator !== undefined && g.indicators.includes(r.indicator));
    if (saw.length === 0) continue;
    const status = saw.reduce<Status>((s, r) => worst(s, r.status), 'ok');
    const onlyMissing = saw.every((r) => r.kind === 'missing');
    out.push({
      id: g.id, title: g.title, hazard: g.hazard, status, saw,
      why: g.why,
      onlyMissing,
      todo: onlyMissing ? g.how(env) : g.ifAbnormal,
      escalate: status === 'act' ? `${g.escalate} ${reportAdvice(env)}` : g.escalate,
      tab: g.id === 'skin' ? 'skin' : 'check-in',
    });
  }
  return out.sort((a, b) => rank[b.status] - rank[a.status]);
}

const tag = (r: { source?: string }) => (r.source === 'simulated' || r.source === 'estimated' ? ` [${r.source}]` : '');

/** Plain-text summary to send to the flight surgeon. Simulated and estimated values stay labeled. */
export function buildReport(a: Astronaut, ev: AstronautEval, insights: Insight[], env: Environment, now: number): string {
  const lines: string[] = [
    'HealthLens report for the flight surgeon',
    `${a.name} (${a.role}) · Mission day ${a.missionDay} · ${env.label}`,
    `Generated ${new Date(now).toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    `Overall status: ${ev.status.toUpperCase()}`,
    '',
  ];
  if (insights.length === 0) lines.push('Nothing flagged. All indicators are within the baseline of this crew member.', '');
  insights.forEach((ins, n) => {
    lines.push(`${n + 1}. ${ins.title}: ${ins.status.toUpperCase()}`, '   What we saw:');
    for (const r of ins.saw) lines.push(`   - ${r.text}${tag(r)}`);
    lines.push(ins.onlyMissing ? '   Crew was told to take the measurement.' : '   Crew was told to:');
    if (!ins.onlyMissing) for (const s of ins.todo) lines.push(`   - ${s}`);
    lines.push('');
  });
  lines.push('Latest readings:');
  for (const i of ev.indicators) {
    if (!i.latest) continue;
    const when = i.daysSince === 0 ? 'today' : `${i.daysSince} d ago`;
    const base = i.baseline !== undefined ? `, baseline ${formatValue(i.def, i.baseline)}` : '';
    lines.push(`- ${i.def.label}: ${formatValue(i.def, i.latest.value)}${base}, measured ${when}${tag(i.latest)}`);
  }
  lines.push('', 'HealthLens is not a medical device. It flags changes for review and does not diagnose.');
  return lines.join('\n');
}
