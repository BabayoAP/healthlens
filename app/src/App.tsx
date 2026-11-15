import { useState } from 'react';
import { crew } from './lib/mockData';
import { setDemoMode, useData } from './lib/store';
import { SourceTag } from './components/SourceTag';
import { CheckIn } from './pages/CheckIn';
import { Dashboard } from './pages/Dashboard';
import { Skin } from './pages/Skin';
import { Vitals } from './pages/Vitals';
import './App.css';

type Tab = 'dashboard' | 'check-in' | 'skin' | 'vitals';
const TABS: Record<Tab, string> = { dashboard: 'Dashboard', 'check-in': 'Check-in', skin: 'Skin', vitals: 'Vitals' };

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [astronautId, setAstronautId] = useState(crew[0].id);
  const { demoMode } = useData();

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
        {tab !== 'dashboard' && (
          <select value={astronautId} onChange={(e) => setAstronautId(e.target.value)}>
            {crew.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
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
        {tab === 'dashboard' && <Dashboard onOpen={(id) => { setAstronautId(id); setTab('skin'); }} />}
        {tab === 'check-in' && <CheckIn key={astronautId} astronautId={astronautId} />}
        {tab === 'skin' && <Skin astronautId={astronautId} />}
        {tab === 'vitals' && <Vitals astronautId={astronautId} />}
      </main>

      <footer className="muted">Not a medical device. HealthLens flags changes for review; it does not diagnose.</footer>
    </div>
  );
}
