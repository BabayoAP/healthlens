import { deviceById, deviceName } from '../lib/devices';
import { environmentById } from '../lib/environment';
import { useData } from '../lib/store';
import type { Source } from '../lib/types';

const label: Record<Source, string> = {
  manual: 'entered',
  device: 'device',
  'self-report': 'self-report',
  'measured-in-app': 'measured in app',
  simulated: 'simulated',
  estimated: 'estimated',
};

/**
 * Shows where a value came from. Put one next to any value on screen.
 * `simulated` and `estimated` are highlighted: the rule is that no made-up number is ever shown unlabeled (PRD §5.0).
 * In demo mode the banner at the top already says all crew history is simulated, so the per-value tag is left out.
 * A value imported from a (simulated) device shows the device name, plus "simulated" outside demo mode.
 */
export function SourceTag({ source, device }: { source: Source; device?: string }) {
  const { demoMode, environment } = useData();
  const dev = device ? deviceById[device] : undefined;
  if (dev) {
    const loud = source === 'simulated' && !demoMode;
    return <span className={`source-tag${loud ? ' source-tag-loud' : ''}`}>{deviceName(dev, environmentById[environment])}{loud ? ' · simulated' : ''}</span>;
  }
  if (source === 'simulated' && demoMode) return null;
  const loud = source === 'simulated' || source === 'estimated';
  return <span className={`source-tag${loud ? ' source-tag-loud' : ''}`}>{label[source]}</span>;
}
