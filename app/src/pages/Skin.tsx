import { useState } from 'react';
import { ANALYSIS_IS_MOCK, analyzeSkinPhoto } from '../lib/analysis';
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

  // Scans of this region, newest first
  const scans = data.skinScans
    .filter((s) => s.astronautId === astronautId && s.region === region)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const latest = scans[0];
  const before = scans[1];

  async function onFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const lesions = await analyzeSkinPhoto(file, region, latest);
      // The photo itself is not saved yet (TODO: store images). The lesion results are.
      addSkinScan({
        astronautId, region, lesions,
        takenAt: new Date().toISOString(),
        source: ANALYSIS_IS_MOCK ? 'simulated' : 'measured-in-app',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Skin scan</h2>
      <div className="row">
        <label>
          Body region{' '}
          <select value={region} onChange={(e) => { setRegion(e.target.value as BodyRegion); setPreview(undefined); }}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="upload">
          Upload photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>

      <p className="muted">
        {latest
          ? <>Last scan of this region: {latest.takenAt.slice(0, 10)} <SourceTag source={latest.source} />{before && ` · previous: ${before.takenAt.slice(0, 10)}`}</>
          : 'No scan of this region yet. The first one becomes the baseline.'}
      </p>

      {preview && (
        <div className="photo">
          <img src={preview} alt={`Skin scan of ${region}`} />
          {!busy && latest?.lesions.map((l) => (
            <span key={l.id} className={`dot dot-${l.risk}`} style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }} />
          ))}
        </div>
      )}

      {busy && <p>Analyzing…</p>}

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
    </section>
  );
}
