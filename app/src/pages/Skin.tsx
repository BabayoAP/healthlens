import { useState } from 'react';
import { analyzeSkinPhoto } from '../lib/analysis';
import { skinScans } from '../lib/mockData';
import type { BodyRegion, Lesion } from '../lib/types';
import { StatusBadge } from '../components/StatusBadge';

const regions: BodyRegion[] = [
  'face', 'neck', 'chest', 'abdomen', 'upper-back', 'lower-back',
  'left-arm', 'right-arm', 'left-leg', 'right-leg',
];

export function Skin({ astronautId }: { astronautId: string }) {
  const [region, setRegion] = useState<BodyRegion>('left-arm');
  const [preview, setPreview] = useState<string>();
  const [lesions, setLesions] = useState<Lesion[]>();
  const [busy, setBusy] = useState(false);

  const previous = skinScans
    .filter((s) => s.astronautId === astronautId && s.region === region)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))[0];

  async function onFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setLesions(undefined);
    setBusy(true);
    try {
      setLesions(await analyzeSkinPhoto(file, region, previous));
    } finally {
      setBusy(false);
    }
  }

  const shown = lesions ?? previous?.lesions ?? [];

  return (
    <section>
      <h2>Skin scan</h2>
      <div className="row">
        <label>
          Body region{' '}
          <select value={region} onChange={(e) => { setRegion(e.target.value as BodyRegion); setLesions(undefined); setPreview(undefined); }}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="upload">
          Upload photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>

      <p className="muted">
        {previous ? `Last scan of this region: ${previous.takenAt.slice(0, 10)}` : 'No earlier scan of this region yet. This one becomes the baseline.'}
      </p>

      {preview && (
        <div className="photo">
          <img src={preview} alt={`Skin scan of ${region}`} />
          {lesions?.map((l) => (
            <span key={l.id} className={`dot dot-${l.risk}`} style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }} />
          ))}
        </div>
      )}

      {busy && <p>Analyzing…</p>}

      {shown.length > 0 && (
        <table>
          <thead><tr><th>Spot</th><th>Size</th><th>Color</th><th>Change</th><th>Notes</th><th>Risk</th></tr></thead>
          <tbody>
            {shown.map((l, i) => (
              <tr key={l.id}>
                <td>#{i + 1}</td><td>{l.diameterMm} mm</td><td>{l.color}</td><td>{l.change}</td>
                <td>{l.notes.join(', ')}</td><td><StatusBadge status={l.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
