import { useState } from 'react';
import { crew } from './lib/mockData';
import { Dashboard } from './pages/Dashboard';
import { Skin } from './pages/Skin';
import { Vitals } from './pages/Vitals';
import './App.css';

type Tab = 'dashboard' | 'skin' | 'vitals';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [astronautId, setAstronautId] = useState(crew[0].id);

  return (
    <div className="app">
      <header>
        <h1>HealthLens</h1>
        <nav>
          {(['dashboard', 'skin', 'vitals'] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        {tab !== 'dashboard' && (
          <select value={astronautId} onChange={(e) => setAstronautId(e.target.value)}>
            {crew.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
      </header>

      <main>
        {tab === 'dashboard' && <Dashboard onOpen={(id) => { setAstronautId(id); setTab('skin'); }} />}
        {tab === 'skin' && <Skin astronautId={astronautId} />}
        {tab === 'vitals' && <Vitals astronautId={astronautId} />}
      </main>

      <footer className="muted">Not a medical device. HealthLens flags changes for review; it does not diagnose.</footer>
    </div>
  );
}
