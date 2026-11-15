import { useState } from 'react';
import { analyzeSkinPhoto, getApiKey, MODEL, setApiKey } from '../lib/analysis';
import { addSkinScan, useData } from '../lib/store';
import type { BodyRegion } from '../lib/types';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';

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

  return (
    <section>
      <h2>Skin scan</h2>
      <div className="row">
        <label>
          Body region{' '}
          <select value={region} onChange={(e) => { setRegion(e.target.value as BodyRegion); setPreview(undefined); setMessage(undefined); }}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="upload">
          Upload photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>

      <details className="muted">
        <summary>AI analysis: {hasKey ? `live (${MODEL})` : 'simulated (no API key)'}</summary>
        {hasKey ? (
          <p>An Anthropic API key is saved in this browser only. <button onClick={clearKey}>Remove key</button></p>
        ) : (
          <p>
            <input type="password" placeholder="Anthropic API key (sk-ant-…)" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} />{' '}
            <button onClick={saveKey} disabled={!keyDraft}>Save</button>
            <br />The key stays in this browser's storage and is sent only to the Anthropic API. Without it, results are simulated.
          </p>
        )}
      </details>

      <p className="muted">
        {latest
          ? <>Last scan of this region: {latest.takenAt.slice(0, 10)} <SourceTag source={latest.source} />{before && ` · previous: ${before.takenAt.slice(0, 10)}`}</>
          : 'No scan of this region yet. The first one becomes the baseline.'}
      </p>

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

      {latest && latest.lesions.length > 0 && (
        <table>
          <thead><tr><th>Spot</th><th>Size</th>{before && <th>Previous size</th>}<th>Color</th><th>Change</th><th>Notes</th><th>Risk</th></tr></thead>
          <tbody>
            {latest.lesions.map((l, i) => {
              const was = before?.lesions.find((p) => p.id === l.id);
              return (
                <tr key={l.id}>
                  <td>#{i + 1}</td><td>{l.diameterMm} mm</td>
                  {before && <td>{was ? `${was.diameterMm} mm` : '—'}</td>}
                  <td>{l.color}</td><td>{l.change}</td>
                  <td>{l.notes.join(', ')}</td><td><StatusBadge status={l.risk} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="muted">Flags spots for review by the flight surgeon. Does not diagnose.</p>
    </section>
  );
}
