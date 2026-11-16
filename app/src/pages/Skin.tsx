import { useState } from 'react';
import { analyzeSkinPhoto, getApiKey, MODEL, setApiKey } from '../lib/analysis';
import { addSkinScan, useData } from '../lib/store';
import type { BodyRegion } from '../lib/types';
import { SourceTag } from '../components/SourceTag';
import { Camera } from 'lucide-react';

const regions: BodyRegion[] = [
  'face', 'neck', 'chest', 'abdomen', 'upper-back', 'lower-back',
  'left-arm', 'right-arm', 'left-leg', 'right-leg',
];

export function Skin({ astronautId }: { astronautId: string }) {
  const data = useData();
  const [region, setRegion] = useState<BodyRegion>('left-arm');
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [hasKey, setHasKey] = useState(() => !!getApiKey());
  const [keyDraft, setKeyDraft] = useState('');

  // Scans of this region, newest first
  const scans = data.skinScans
    .filter((s) => s.astronautId === astronautId && s.region === region)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const latest = scans[0];
  const before = scans[1];

  async function onFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setMessage(undefined);
    setBusy(true);
    try {
      const result = await analyzeSkinPhoto(file, region, latest);
      setMessage(result.message);
      // The photo itself is not saved yet (TODO: store images). The lesion results are.
      addSkinScan({
        astronautId, region, lesions: result.lesions,
        takenAt: new Date().toISOString(),
        source: result.source,
      });
    } finally {
      setBusy(false);
    }
  }

  function saveKey() {
    setApiKey(keyDraft || undefined);
    setHasKey(!!keyDraft);
    setKeyDraft('');
  }

  function clearKey() {
    setApiKey(undefined);
    setHasKey(false);
  }

  const nice = (r: string) => r[0].toUpperCase() + r.slice(1).replace('-', ' ');

  return (
    <section>
      <h2>Skin scan</h2>
      <p className="muted">Photograph one body area. Spots are matched to the last scan of that area. Flags spots for review; does not diagnose.</p>

      <div className="skin">
        <div className="panel">
          <div className="panel-head"><h3>New scan</h3></div>
          <span className="field-label skin-label">Body area</span>
          <div className="chip-row" role="group" aria-label="Body area">
            {regions.map((r) => (
              <button key={r} type="button" className={`chip${region === r ? ' on' : ''}`} aria-pressed={region === r}
                onClick={() => { setRegion(r); setPreview(undefined); setMessage(undefined); }}>{nice(r)}</button>
            ))}
          </div>
          <label className="dropzone">
            <Camera size={22} strokeWidth={1.75} aria-hidden={true} />
            <strong>Take or upload a photo</strong>
            <span className="muted">{nice(region)} · include a ruler or coin for size</span>
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          <details className="fold">
            <summary>AI analysis: {hasKey ? `live (${MODEL})` : 'simulated, no API key'}</summary>
            {hasKey ? (
              <p>An OpenRouter key is saved in this browser only. <button type="button" className="link" onClick={clearKey}>Remove key</button></p>
            ) : (
              <>
                <div className="row key-row">
                  <input type="password" placeholder="OpenRouter API key (sk-or-…)" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} />
                  <button type="button" className="ghost" onClick={saveKey} disabled={!keyDraft}>Save</button>
                </div>
                <p>Stays in this browser and is sent only to OpenRouter (free keys at openrouter.ai/keys).</p>
              </>
            )}
          </details>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>{nice(region)}</h3>
            {latest && <span className="muted">scanned {latest.takenAt.slice(0, 10)}{before && ` · before ${before.takenAt.slice(0, 10)}`} <SourceTag source={latest.source} /></span>}
          </div>
          {!latest && !busy && <p className="muted">No scan of this area yet. The first one becomes the baseline.</p>}

          {preview && (
            <div className="photo">
              <img src={preview} alt={`Skin scan of ${region}`} />
              {!busy && latest?.lesions.map((l, i) => (
                <span key={l.id} title={`#${i + 1} · ${l.diameterMm} mm · ${l.change}`} className={`dot dot-${l.risk}`} style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }} />
              ))}
            </div>
          )}
          {busy && <p>Analyzing…</p>}
          {!busy && message && <p className="muted">{message}</p>}

          {latest && latest.lesions.length === 0 && <p className="muted">No spots found.</p>}
          {latest && latest.lesions.length > 0 && (
            <ul className="spot-list">
              {latest.lesions.map((l, i) => {
                const was = before?.lesions.find((p) => p.id === l.id);
                return (
                  <li key={l.id} className={`spot spot-${l.risk}`}>
                    <span className={`status-dot status-dot-${l.risk}`} aria-hidden="true" />
                    <span className="spot-main">
                      <strong>Spot {i + 1}</strong>
                      <span className="muted">{l.color}{l.notes.length ? ` · ${l.notes.join(', ')}` : ''}</span>
                    </span>
                    <span className={`spot-change spot-change-${l.change}`}>{l.change}</span>
                    <span className="spot-size">
                      <strong>{l.diameterMm} mm</strong>
                      {was && was.diameterMm !== l.diameterMm && <span className="muted">was {was.diameterMm} mm</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
