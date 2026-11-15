import { useState } from 'react';
import { crew } from './lib/mockData';
import { ENVIRONMENTS, type EnvironmentId } from './lib/environment';
import { setDemoMode, setEnvironment, useData } from './lib/store';
import { SourceTag } from './components/SourceTag';
import { BodyMap } from './pages/BodyMap';
import { CheckIn } from './pages/CheckIn';
import { Dashboard } from './pages/Dashboard';
import { Emergency } from './pages/Emergency';
import { Guides } from './pages/Guides';
import { Skin } from './pages/Skin';
import { Trends } from './pages/Trends';
import { Vitals } from './pages/Vitals';
import './App.css';

type Tab = 'dashboard' | 'body' | 'check-in' | 'skin' | 'vitals' | 'trends' | 'guides';
const TABS: Record<Tab, string> = { dashboard: 'Dashboard', body: 'Body map', 'check-in': 'Check-in', skin: 'Skin', vitals: 'Vitals', trends: 'Trends', guides: 'Guides' };

export default function App() {
  const [tab, setTab] = useState<Tab | 'emergency'>('dashboard');
  const [astronautId, setAstronautId] = useState(crew[0].id);
  const { demoMode, environment } = useData();

  return (
    <div className="app">
      <header>
        <h1>HealthLens</h1>
        <nav>
          {(Object.keys(TABS) as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {TABS[t]}
            </button>
          ))}
        </nav>
        {tab !== 'dashboard' && tab !== 'emergency' && (
          <select aria-label="Astronaut" value={astronautId} onChange={(e) => setAstronautId(e.target.value)}>
            {crew.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <select aria-label="Environment" value={environment} onChange={(e) => setEnvironment(e.target.value as EnvironmentId)}>
          {ENVIRONMENTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <button type="button" className="emergency-btn" onClick={() => setTab('emergency')}>Emergency</button>
        <label className="demo-toggle" title="Loads a seeded demo crew with 6 weeks of simulated history. Your own entries are kept either way.">
          <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} /> Demo mode
        </label>
      </header>

      {demoMode && (
        <p className="demo-banner">
          Demo mode: crew history is <SourceTag source="simulated" />. Anything you enter is added on top and changes the status live.
        </p>
      )}

      <main>
        {tab === 'dashboard' && <Dashboard onOpen={(id) => { setAstronautId(id); setTab('body'); }} />}
        {tab === 'body' && <BodyMap key={astronautId} astronautId={astronautId} onNavigate={setTab} />}
        {tab === 'check-in' && <CheckIn key={astronautId} astronautId={astronautId} />}
        {tab === 'skin' && <Skin astronautId={astronautId} />}
        {tab === 'vitals' && <Vitals astronautId={astronautId} />}
        {tab === 'trends' && <Trends astronautId={astronautId} />}
        {tab === 'guides' && <Guides astronautId={astronautId} />}
        {tab === 'emergency' && <Emergency />}
      </main>

      <footer className="muted">Not a medical device. HealthLens flags changes for review; it does not diagnose.</footer>
    </div>
  );
}
