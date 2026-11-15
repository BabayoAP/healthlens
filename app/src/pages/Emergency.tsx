import { useState } from 'react';
import { EMERGENCY_GUIDES } from '../lib/emergency';
import { environmentById } from '../lib/environment';
import { useData } from '../lib/store';

/** Step-by-step emergency guidance, one step per screen, adjusted for the comm delay of the current environment. */
export function Emergency() {
  const { environment } = useData();
  const env = environmentById[environment];
  const [guideId, setGuideId] = useState<string>();
  const [step, setStep] = useState(0);

  const guide = EMERGENCY_GUIDES.find((g) => g.id === guideId);
  const comm = (
    <p className={`comm ${env.liveHelp ? '' : 'comm-delayed'}`}>
      <strong>{env.label}.</strong> Signal delay to Earth: {env.commDelay} each way. {env.helpAdvice}
    </p>
  );

  if (!guide) {
    return (
      <section className="emergency">
        <h2>Emergency</h2>
        {comm}
        <p>What is happening?</p>
        <div className="grid">
          {EMERGENCY_GUIDES.map((g) => (
            <button key={g.id} className="card emergency-pick" onClick={() => { setGuideId(g.id); setStep(0); }}>
              <strong>{g.title}</strong>
              <p className="muted">{g.when}</p>
            </button>
          ))}
        </div>
        <p className="muted">Reference steps for this demo. They do not replace mission medical procedures or trained judgment.</p>
      </section>
    );
  }

  const steps = guide.steps(env);
  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <section className="emergency">
      <h2>{guide.title}</h2>
      {comm}
      <div className="panel step" aria-live="polite">
        <p className="muted">Step {step + 1} of {steps.length}</p>
        <h3>{s.title}</h3>
        <p className="step-detail">{s.detail}</p>
        {s.log && <p className="step-log"><strong>Write down:</strong> {s.log}</p>}
      </div>
      <div className="row step-nav">
        <button type="button" className="ghost" onClick={() => (step === 0 ? setGuideId(undefined) : setStep(step - 1))}>
          {step === 0 ? 'All emergencies' : 'Back'}
        </button>
        {last
          ? <button type="button" className="primary" onClick={() => setGuideId(undefined)}>Done</button>
          : <button type="button" className="primary" onClick={() => setStep(step + 1)}>Next step</button>}
      </div>
    </section>
  );
}
