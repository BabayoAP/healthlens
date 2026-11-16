import { useState, type ComponentType } from 'react';
import { Activity, BookOpen, ClipboardCheck, Eye, LayoutGrid, LineChart, Moon, ScanFace, Siren, Sparkles, PersonStanding, Sun } from 'lucide-react';
import type { FigureRegionId } from './lib/bodyRegions';
import { crew } from './lib/mockData';
import { evaluateAstronaut } from './lib/status';
import { setDemoMode, useData } from './lib/store';
import { setTheme, useTheme } from './lib/theme';
import { StatusBadge } from './components/StatusBadge';
import { LocationBar } from './components/LocationBar';
import { BodyMap } from './pages/BodyMap';
import { CheckIn } from './pages/CheckIn';
import { Dashboard } from './pages/Dashboard';
import { Emergency } from './pages/Emergency';
import { Guides } from './pages/Guides';
import { Insights } from './pages/Insights';
import { Skin } from './pages/Skin';
import { Tests } from './pages/Tests';
import { Trends } from './pages/Trends';
import { Vitals } from './pages/Vitals';
import './App.css';

type Tab = 'dashboard' | 'body' | 'insights' | 'check-in' | 'tests' | 'skin' | 'vitals' | 'trends' | 'guides';
type Icon = ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;

/** Sidebar groups: what you look at, what you record, what you look up. */
const NAV: { group?: string; items: { id: Tab; label: string; icon: Icon }[] }[] = [
  { items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid }] },
  { group: 'Astronaut', items: [
    { id: 'body', label: 'Body map', icon: PersonStanding },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'trends', label: 'Trends', icon: LineChart },
  ] },
  { group: 'Record', items: [
    { id: 'check-in', label: 'Check-in', icon: ClipboardCheck },
    { id: 'tests', label: 'Tests', icon: Eye },
    { id: 'skin', label: 'Skin scan', icon: ScanFace },
  ] },
  { group: 'Reference', items: [{ id: 'guides', label: 'Guides', icon: BookOpen }] },
];

export default function App() {
  const [tab, setTab] = useState<Tab | 'emergency'>('dashboard');
  const [astronautId, setAstronautId] = useState(crew[0].id);
  const data = useData();
  const theme = useTheme();
  const { demoMode } = data;
  const [emergencyGuide, setEmergencyGuide] = useState<string>();
  const perAstronaut = tab !== 'dashboard' && tab !== 'emergency';

  const [bodyRegion, setBodyRegion] = useState<FigureRegionId>();
  const pickAstronaut = (id: string) => {
    setAstronautId(id);
    if (tab === 'emergency') setTab('dashboard');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="brand-mark">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
          <span>HealthLens</span>
        </div>

        <nav className="nav" aria-label="Screens">
          {NAV.map((g, i) => (
            <div className="nav-group" key={g.group ?? i}>
              {g.group && <div className="nav-label">{g.group}</div>}
              {g.items.map(({ id, label, icon: I }) => (
                <button key={id} type="button" className={`nav-item${tab === id ? ' active' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => { setBodyRegion(undefined); setTab(id); }}>
                  <I size={16} strokeWidth={1.75} aria-hidden />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="nav-group crew-list">
          <div className="nav-label">Crew</div>
          {crew.map((a) => {
            const ev = evaluateAstronaut(a.id, data.readings, data.skinScans, data.now, data.symptomLogs);
            const selected = tab !== 'emergency' && a.id === astronautId;
            return (
              <button key={a.id} type="button" className={`crew-item${selected ? ' active' : ''}`} aria-pressed={selected} onClick={() => pickAstronaut(a.id)}>
                <span className="avatar" aria-hidden="true">{a.name.split(' ').pop()![0]}</span>
                <span className="crew-name">{a.name}</span>
                {ev.hasData && <span className={`status-dot status-dot-${ev.status}`} title={ev.status} />}
              </button>
            );
          })}
        </div>

        <div className="sidebar-foot">
          <label className="switch" title="Loads a seeded demo crew with 6 weeks of simulated history. Your own entries are kept either way.">
            <input type="checkbox" role="switch" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
            <span className="switch-track" aria-hidden="true" />
            Demo mode
          </label>
          <div className="theme-toggle" role="group" aria-label="Display theme">
            <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}><Moon size={14} strokeWidth={1.75} aria-hidden /> Dark</button>
            <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}><Sun size={14} strokeWidth={1.75} aria-hidden /> Light</button>
          </div>
          <button type="button" className={`emergency-btn${tab === 'emergency' ? ' active' : ''}`} onClick={() => { setEmergencyGuide(undefined); setTab('emergency'); }}>
            <Siren size={16} strokeWidth={2} aria-hidden /> Emergency
          </button>
        </div>
      </aside>

      <div className="content">
        <LocationBar />
        {perAstronaut && (() => {
          const a = crew.find((c) => c.id === astronautId)!;
          const ev = evaluateAstronaut(a.id, data.readings, data.skinScans, data.now, data.symptomLogs);
          return (
            <div className="context-bar">
              <span className="avatar avatar-lg" aria-hidden="true">{a.name.split(' ').pop()![0]}</span>
              <div className="context-who">
                <select aria-label="Astronaut" value={astronautId} onChange={(e) => setAstronautId(e.target.value)}>
                  {crew.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="muted">{a.role}, mission day {a.missionDay}</span>
              </div>
              {ev.hasData && <StatusBadge status={ev.status} />}
            </div>
          );
        })()}

        {demoMode && (
          <p className="demo-banner">
            Demo mode: all crew history is <strong>simulated</strong>. Anything you enter is added on top and changes the status live.
          </p>
        )}

        <main>
          {tab === 'dashboard' && (
            <Dashboard
              astronautId={astronautId} onSelect={setAstronautId}
              onOpenBody={(region) => { setBodyRegion(region); setTab('body'); }}
              onOpenInsights={() => setTab('insights')}
              onOpenCheck={(id, t) => { setAstronautId(id); setTab(t); }}
              onOpenStormGuide={() => { setEmergencyGuide('solar-storm'); setTab('emergency'); }}
            />
          )}
          {tab === 'body' && <BodyMap key={`${astronautId}-${bodyRegion}`} astronautId={astronautId} initialRegion={bodyRegion} onNavigate={setTab} />}
          {tab === 'insights' && <Insights astronautId={astronautId} onNavigate={setTab} />}
          {tab === 'check-in' && <CheckIn key={astronautId} astronautId={astronautId} />}
          {tab === 'tests' && <Tests key={astronautId} astronautId={astronautId} />}
          {tab === 'skin' && <Skin astronautId={astronautId} />}
          {tab === 'vitals' && <Vitals astronautId={astronautId} />}
          {tab === 'trends' && <Trends astronautId={astronautId} />}
          {tab === 'guides' && <Guides astronautId={astronautId} />}
          {tab === 'emergency' && <Emergency key={emergencyGuide ?? 'all'} initialGuide={emergencyGuide} />}
        </main>

        <footer>Not a medical device. HealthLens flags changes for review; it does not diagnose.</footer>
      </div>
    </div>
  );
}
