import { useEffect, useState } from 'react';
import type { EnvironmentId } from './environment';
import snapshot from './spaceWeatherSnapshot.json';
import type { Status } from './types';

/**
 * Live space weather from NASA's DONKI service (Space Weather Database Of Notifications,
 * Knowledge, Information), run by the Community Coordinated Modeling Center at NASA Goddard.
 * https://ccmc.gsfc.nasa.gov/tools/DONKI/ · API: https://api.nasa.gov/
 *
 * The app asks for the last 30 days of notifications, keeps the answer for an hour, and falls
 * back to a saved copy when there is no connection, so it still works offline.
 * DONKI products are NASA research information; NOAA SWPC is the official US forecast source.
 */
export type SwType = 'SEP' | 'FLR' | 'CME' | 'GST' | 'RBE' | 'IPS' | 'MPC' | 'HSS' | 'Report';

export const SW_LABEL: Record<SwType, string> = {
  SEP: 'Solar particle event',
  FLR: 'Solar flare',
  CME: 'Coronal mass ejection',
  GST: 'Geomagnetic storm',
  RBE: 'Radiation belt enhancement',
  IPS: 'Interplanetary shock',
  MPC: 'Magnetopause crossing',
  HSS: 'High-speed solar wind stream',
  Report: 'Weekly space weather report',
};

export interface SpaceWeatherEvent {
  id: string;
  type: SwType;
  /** ISO time the notification was issued */
  issued: string;
  url: string;
  summary: string;
}

export interface SpaceWeather {
  events: SpaceWeatherEvent[];
  /** When this data was fetched from NASA (ms) */
  fetchedAt: number;
  origin: 'live' | 'saved';
}

interface RawNotification {
  messageType?: string;
  messageID?: string;
  messageURL?: string;
  messageIssueTime?: string;
  messageBody?: string;
}

/** Pulls the plain-language summary out of a DONKI message body. */
function summarize(body: string): string {
  const after = body.split(/##\s*Summary:/i)[1] ?? body;
  const text = after.split(/\n\s*##/)[0].replace(/\s+/g, ' ').trim();
  if (!text) return 'See the NASA notice for details.';
  if (text.length <= 220) return text;
  const cut = text.slice(0, 220);
  const stop = cut.lastIndexOf('. ');
  return stop > 80 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`;
}

/** Turns a DONKI /notifications response into events, newest first. Ignores anything malformed. */
export function parseNotifications(raw: unknown): SpaceWeatherEvent[] {
  if (!Array.isArray(raw)) return [];
  const events: SpaceWeatherEvent[] = [];
  for (const n of raw as RawNotification[]) {
    if (!n?.messageType || !(n.messageType in SW_LABEL) || !n.messageID || !n.messageIssueTime) continue;
    if (Number.isNaN(Date.parse(n.messageIssueTime))) continue;
    events.push({
      id: n.messageID,
      type: n.messageType as SwType,
      issued: n.messageIssueTime,
      url: n.messageURL ?? 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
      summary: summarize(n.messageBody ?? ''),
    });
  }
  return events.sort((a, b) => Date.parse(b.issued) - Date.parse(a.issued));
}

export interface SpaceWeatherAssessment {
  status: Status;
  headline: string;
  detail: string;
  /** The event that triggered a Watch or Act */
  event?: SpaceWeatherEvent;
}

const HOUR = 3_600_000;

/** What the latest NASA notifications mean for this crew, in plain words. */
export function assessSpaceWeather(events: SpaceWeatherEvent[], now: number, environment: EnvironmentId): SpaceWeatherAssessment {
  const recent = (type: SwType, hours: number) =>
    events.find((e) => e.type === type && now - Date.parse(e.issued) <= hours * HOUR && Date.parse(e.issued) <= now + HOUR);

  const sep = recent('SEP', 72);
  if (sep) {
    return {
      status: 'act', event: sep,
      headline: 'Solar particle event in progress',
      detail: 'NASA has reported a solar particle event (radiation storm). Open the radiation storm guide and take shelter.',
    };
  }
  const rbe = environment === 'station' ? recent('RBE', 72) : undefined;
  if (rbe) {
    return {
      status: 'watch', event: rbe,
      headline: 'Radiation belts are enhanced',
      detail: 'NASA reports raised particle levels in Earth\'s outer radiation belt, which the station passes close to. Log your dosimeter reading today.',
    };
  }
  const flare = recent('FLR', 48);
  if (flare) {
    return {
      status: 'watch', event: flare,
      headline: 'Strong solar flare reported',
      detail: 'A particle event can follow a strong flare within minutes to hours. Know where your shelter is and keep your dosimeter with you.',
    };
  }
  return {
    status: 'ok',
    headline: 'No radiation storm reported',
    detail: environment === 'station'
      ? 'NASA has reported no solar particle event in the last 3 days.'
      : 'NASA has reported no solar particle event in the last 3 days. Outside Earth\'s magnetic field a solar particle event is the main sudden radiation danger.',
  };
}

const CACHE_KEY = 'healthlens.spaceWeather.v1';
const MAX_AGE = HOUR;
const day = (t: number) => new Date(t).toISOString().slice(0, 10);

const saved: SpaceWeather = {
  events: parseNotifications(snapshot.notifications),
  fetchedAt: Date.parse(snapshot.fetchedAt),
  origin: 'saved',
};

function readCache(): SpaceWeather | undefined {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as SpaceWeather | null;
    if (c && Array.isArray(c.events) && typeof c.fetchedAt === 'number') return c;
  } catch { /* fall through */ }
  return undefined;
}

async function fetchLive(now: number): Promise<SpaceWeather> {
  // DEMO_KEY works without sign-up but is rate-limited; set VITE_NASA_API_KEY for a free personal key.
  const key = (import.meta.env.VITE_NASA_API_KEY as string | undefined) || 'DEMO_KEY';
  const url = `https://api.nasa.gov/DONKI/notifications?startDate=${day(now - 30 * 24 * HOUR)}&endDate=${day(now)}&type=all&api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA DONKI answered ${res.status}`);
  return { events: parseNotifications(await res.json()), fetchedAt: now, origin: 'live' };
}

/** Latest space weather: fresh from NASA when online, otherwise the last saved copy. */
export function useSpaceWeather(): SpaceWeather {
  const [state, setState] = useState<SpaceWeather>(() => {
    const cached = readCache();
    return cached && cached.fetchedAt > saved.fetchedAt ? cached : saved;
  });

  useEffect(() => {
    const now = Date.now();
    if (state.origin === 'live' && now - state.fetchedAt < MAX_AGE) return;
    let cancelled = false;
    fetchLive(now)
      .then((fresh) => {
        if (cancelled) return;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch { /* fine */ }
        setState(fresh);
      })
      .catch(() => { /* offline or rate-limited: keep showing the saved copy */ });
    return () => { cancelled = true; };
    // Run once per mount; `state` is only the starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
