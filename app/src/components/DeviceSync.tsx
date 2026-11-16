import { useState, type ReactNode } from 'react';
import { DEVICES, deviceName, lastSync, simulateSync, type DeviceDef } from '../lib/devices';
import { environmentById } from '../lib/environment';
import { indicatorById } from '../lib/indicators';
import { SOURCES } from '../lib/sources';
import { addReadings, useData } from '../lib/store';
import type { IndicatorId } from '../lib/types';

const shortLabel = (id: IndicatorId) => indicatorById[id].label.replace(/ \(.*\)$/, '').replace('Resting ', '');

function ago(iso: string, now: number): string {
  const min = Math.round((now - Date.parse(iso)) / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

/**
 * Import readings from the crew's health devices instead of typing them (PRD §5.0).
 * SIMULATED: each device is modeled on real space hardware (see `lib/devices.ts`); values are saved tagged `simulated`.
 */
export function DeviceSync({ astronautId, onImported }: { astronautId: string; onImported: (ids: IndicatorId[]) => void }) {
  const data = useData();
  const env = environmentById[data.environment];
  const [busy, setBusy] = useState<string>();

  const usable = DEVICES.filter((d) => !d.unavailable?.(env));

  function sync(devices: DeviceDef[], key: string) {
    setBusy(key);
    // A short pause so it reads as a sync, not a button that types numbers
    window.setTimeout(() => {
      const now = Date.now();
      const readings = devices.flatMap((d) => simulateSync(d, astronautId, data.readings, now));
      addReadings(readings);
      onImported(readings.map((r) => r.indicator));
      setBusy(undefined);
    }, 500);
  }

  return (
    <div className="panel devices">
      <div className="panel-head">
        <div>
          <h3>Import from devices</h3>
          <p className="muted devices-note">Simulated: no real device is connected. Each one is modeled on hardware space agencies use to monitor crews, and imported values are tagged.</p>
        </div>
        <button type="button" className="primary" disabled={!!busy} onClick={() => sync(usable, 'all')}>
          {busy === 'all' ? 'Syncing…' : `Sync all (${usable.length})`}
        </button>
      </div>
      <ul className="device-list">
        {DEVICES.map((d) => {
          const off = d.unavailable?.(env);
          const last = lastSync(d.id, astronautId, data.readings);
          return (
            <li key={d.id} className={`device${off ? ' device-off' : ''}`}>
              <div className="device-main">
                <strong>{deviceName(d, env)}</strong>
                <span className="device-measures">{d.measures.filter((m) => m !== 'diastolic').map((m) => (m === 'systolic' ? 'Blood pressure' : shortLabel(m))).join(' · ')}</span>
                <span className="muted device-when">{off ?? `${d.session} ${last ? `Last sync ${ago(last, Date.now())}.` : 'Not synced yet.'}`}</span>
                <details className="fold">
                  <summary>Modeled on</summary>
                  <p>{d.basedOn} {d.sources.map((s) => <a key={s} href={SOURCES[s].url} target="_blank" rel="noreferrer">{SOURCES[s].org}</a>).reduce<ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}</p>
                </details>
              </div>
              <button type="button" className="ghost" disabled={!!off || !!busy} onClick={() => sync([d], d.id)}>
                {busy === d.id ? 'Syncing…' : 'Sync'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
