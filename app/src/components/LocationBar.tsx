import { MapPin, Radio, Scale } from 'lucide-react';
import { ENVIRONMENTS, environmentById, type EnvironmentId } from '../lib/environment';
import { setEnvironment, useData } from '../lib/store';

/**
 * Where the crew is, on top of every screen. The challenge asks the tool to adapt to a spacecraft,
 * a space station or a Moon base, and its video opens "halfway to Mars": location decides how help
 * is reached, how body mass is measured, which checks and emergencies matter most, and where to shelter.
 */
export function LocationBar() {
  const { environment } = useData();
  const env = environmentById[environment];
  return (
    <div className={`location-bar${env.liveHelp ? '' : ' location-delayed'}`}>
      <label className="location-pick">
        <MapPin size={16} strokeWidth={2} aria-hidden />
        <span className="sr-only">Mission location</span>
        <select aria-label="Mission location" value={environment} onChange={(e) => setEnvironment(e.target.value as EnvironmentId)}>
          {ENVIRONMENTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </label>
      <span className="location-fact"><Scale size={14} strokeWidth={1.75} aria-hidden /> {env.gravity}</span>
      <span className="location-fact" title={env.delayNow ? 'Estimated for this point of the mission' : undefined}>
        <Radio size={14} strokeWidth={1.75} aria-hidden /> Signal to Earth: {env.delayNow ?? `${env.commDelay}, each way`}
      </span>
      <strong className="location-help">{env.liveHelp ? 'Live help from Earth' : 'Help is delayed: the crew acts first'}</strong>
    </div>
  );
}
