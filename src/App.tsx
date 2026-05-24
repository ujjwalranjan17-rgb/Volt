import React, { useState, useEffect } from 'react';
import {
  Zap, LayoutDashboard, ReceiptText, CarFront,
  Settings as SettingsIcon, LogOut,
} from 'lucide-react';

import { Vehicle, ChargingSession, CostAssumptions } from './types';
import { INITIAL_VEHICLES, INITIAL_ASSUMPTIONS, INITIAL_SESSIONS } from './mockData';
import { DEMO_HISTORICAL, EMPTY_HISTORICAL, HistoricalBase } from './utils';

import Dashboard from './components/Dashboard';
import Activity from './components/Activity';
import Vehicles from './components/Vehicles';
import LogCharging from './components/LogCharging';
import Settings from './components/Settings';
import Login from './components/Login';
import Onboarding from './components/Onboarding';

type Tab = 'dashboard' | 'activity' | 'vehicles' | 'settings' | 'log_charging';

export default function App() {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<string | null>(() =>
    localStorage.getItem('volt_current_user')
  );

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');

  // Controls the onboarding overlay — shown once for brand-new users
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── User-scoped state ────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>('');
  const [config, setConfig] = useState<CostAssumptions>(INITIAL_ASSUMPTIONS);

  const isDemo = currentUser === 'ujjwal';
  const historical: HistoricalBase = isDemo ? DEMO_HISTORICAL : EMPTY_HISTORICAL;

  // ── Load user data on login ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      setVehicles([]);
      setSessions([]);
      setActiveVehicleId('');
      setConfig(INITIAL_ASSUMPTIONS);
      setShowOnboarding(false);
      return;
    }

    const savedVehicles = localStorage.getItem(`volt_${currentUser}_vehicles`);
    const savedSessions = localStorage.getItem(`volt_${currentUser}_sessions`);
    const savedActiveId = localStorage.getItem(`volt_${currentUser}_active_vehicle_id`);
    const savedConfig = localStorage.getItem(`volt_${currentUser}_config`);
    const hasSeenOnboarding = localStorage.getItem(`volt_${currentUser}_onboarding_done`);

    if (isDemo) {
      setVehicles(savedVehicles ? JSON.parse(savedVehicles) : INITIAL_VEHICLES);
      setSessions(savedSessions ? JSON.parse(savedSessions) : INITIAL_SESSIONS);
      setActiveVehicleId(savedActiveId || 'tata-nexon');
      setConfig(savedConfig ? JSON.parse(savedConfig) : INITIAL_ASSUMPTIONS);
      // Demo account never shows onboarding — it's pre-populated
      setShowOnboarding(false);
    } else {
      const userVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
      const userSessions = savedSessions ? JSON.parse(savedSessions) : [];

      setVehicles(userVehicles);
      setSessions(userSessions);
      setActiveVehicleId(savedActiveId || '');
      setConfig(savedConfig ? JSON.parse(savedConfig) : INITIAL_ASSUMPTIONS);

      // Show onboarding if this user has never seen it and has no data yet
      const isFirstTimer = !hasSeenOnboarding && userVehicles.length === 0;
      setShowOnboarding(isFirstTimer);
    }
  }, [currentUser]);

  // ── Persist state ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser) localStorage.setItem(`volt_${currentUser}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(`volt_${currentUser}_sessions`, JSON.stringify(sessions));
  }, [sessions, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(`volt_${currentUser}_active_vehicle_id`, activeVehicleId);
  }, [activeVehicleId, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(`volt_${currentUser}_config`, JSON.stringify(config));
  }, [config, currentUser]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('volt_current_user', username);
    setCurrentUser(username);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('volt_current_user');
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleDismissOnboarding = () => {
    if (currentUser) {
      localStorage.setItem(`volt_${currentUser}_onboarding_done`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleOnboardingNavigate = (tab: Tab) => {
    handleDismissOnboarding();
    setCurrentTab(tab);
  };

  const handleAddSession = (newSession: ChargingSession) => {
    setSessions(prev => [newSession, ...prev]);

    setVehicles(prevVehs => prevVehs.map(veh => {
      if (veh.id === newSession.vehicleId) {
        const finalOdometer = newSession.odometerReading
          || (veh.odometer + Math.round(newSession.energyKwh / (veh.efficiency / 1000)));
        const addedSoC = Math.round((newSession.energyKwh / veh.batteryCapacity) * 100);
        return {
          ...veh,
          odometer: finalOdometer,
          batterySoC: Math.min(100, veh.batterySoC + addedSoC),
        };
      }
      return veh;
    }));

    setCurrentTab('activity');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
    setActiveVehicleId(newVehicle.id);
    // Once user adds a vehicle, dismiss onboarding if still showing
    if (showOnboarding) handleDismissOnboarding();
  };

  const handleDeleteVehicle = (id: string) => {
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    setActiveVehicleId(updated.length > 0 ? updated[0].id : '');
  };

  const handleClearSessions = () => {
    if (!currentUser) return;
    localStorage.removeItem(`volt_${currentUser}_sessions`);
    localStorage.removeItem(`volt_${currentUser}_vehicles`);
    localStorage.removeItem(`volt_${currentUser}_config`);
    localStorage.removeItem(`volt_${currentUser}_onboarding_done`);
    setSessions([]);
    setVehicles([]);
    setConfig(INITIAL_ASSUMPTIONS);
    setActiveVehicleId('');
    // Re-show onboarding after a full data wipe for non-demo users
    if (!isDemo) setShowOnboarding(true);
  };

  // ── Render login wall ────────────────────────────────────────────────────────
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || null;

  // Avatar: initials-based for real users, hosted image for demo
  const userInitials = currentUser.slice(0, 2).toUpperCase();
  const demoAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMBxaHoza_-xFrt3Dxc_K-6jjdlVNLUKiBpSS8fc1XFV8auGADAe8liCooyZ3F33y9DrjO6qsMIXqCIqFpqM0hxyaPVXtpFmUkQ5nMykTGBuGzgVuePU_UuDyEq6xDgnXx1Y2fL4cg31GKPHTIiPzLOMFBozacyC4FiqMBgDTho3JLshw9giJu5mUzruJv2wIO9AGWz_mkS5Fdb0yvTcFRNLgTMk7mifAhy9RVfalB2EUJJx3FOHSHCVeX8m65R0S7Wi7JX884PBV1';

  return (
    <div className="bg-background text-on-background min-h-screen pb-28 relative font-sans selection:bg-primary/30 selection:text-white">

      {currentTab === 'log_charging' ? (
        <div className="flex justify-center py-4 bg-background px-container-padding-mobile">
          <LogCharging
            vehicles={vehicles}
            defaultVehicleId={activeVehicleId}
            config={config}
            onSave={handleAddSession}
            onCancel={() => setCurrentTab('activity')}
          />
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 md:px-0">

          {/* ── Header ── */}
          <header className="fixed top-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 h-16 flex justify-between items-center transition-all">
            <div className="max-w-xl w-full mx-auto flex justify-between items-center">

              <div
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <Zap className="w-5 h-5 text-primary fill-none group-hover:scale-110 transition-transform" />
                <span className="font-sans text-xl font-black text-primary tracking-tight">Volt</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-on-surface-variant/70 hidden sm:inline-block">
                  <span className="font-bold text-primary capitalize">{currentUser}</span>
                </span>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg border border-outline-variant/20 hover:border-error/30 hover:bg-error/5 text-on-surface-variant hover:text-error transition-all cursor-pointer hidden sm:inline-flex"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Avatar: image for demo, initials for real users */}
                <div
                  onClick={() => setCurrentTab('settings')}
                  className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center hover:border-primary transition-all cursor-pointer shadow-md select-none"
                  title="Profile Settings"
                >
                  {isDemo ? (
                    <img src={demoAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-black text-primary">{userInitials}</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ── Desktop Nav Rail ── */}
          <nav className="hidden md:flex fixed top-0 left-1/2 -translate-x-1/2 h-16 items-center gap-8 z-50 pointer-events-auto">
            {(['dashboard', 'activity', 'vehicles', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer transition-colors ${
                  currentTab === tab
                    ? 'text-primary border-b-2 border-primary h-full mt-1 pt-0.5'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* ── Main Content ── */}
          <main className="pt-20 px-1">
            <div className="animate-fade-in duration-300">

              {/* Onboarding overlay — only for first-time non-demo users */}
              {showOnboarding && currentTab === 'dashboard' && (
                <Onboarding
                  username={currentUser}
                  onGoToVehicles={() => handleOnboardingNavigate('vehicles')}
                  onGoToSettings={() => handleOnboardingNavigate('settings')}
                  onGoToLog={() => handleOnboardingNavigate('log_charging')}
                  onDismiss={handleDismissOnboarding}
                />
              )}

              {/* Regular tab views (hidden while onboarding is shown on dashboard) */}
              {!(showOnboarding && currentTab === 'dashboard') && (
                <>
                  {currentTab === 'dashboard' && (
                    <Dashboard
                      sessions={sessions}
                      vehicles={vehicles}
                      config={config}
                      activeVehicle={activeVehicle}
                      userAvatar={isDemo ? demoAvatar : ''}
                      historical={historical}
                      isDemo={isDemo}
                      onNavigateToVehicles={() => setCurrentTab('vehicles')}
                      onNavigateToLog={() => setCurrentTab('log_charging')}
                    />
                  )}

                  {currentTab === 'activity' && (
                    <Activity
                      sessions={sessions}
                      vehicles={vehicles}
                      config={config}
                      historical={historical}
                      onNavigateToLog={() => setCurrentTab('log_charging')}
                      onDeleteSession={handleDeleteSession}
                    />
                  )}

                  {currentTab === 'vehicles' && (
                    <Vehicles
                      vehicles={vehicles}
                      activeVehicle={activeVehicle}
                      onSelectVehicle={setActiveVehicleId}
                      onAddVehicle={handleAddVehicle}
                      onDeleteVehicle={handleDeleteVehicle}
                      onNavigateToSettings={() => setCurrentTab('settings')}
                    />
                  )}

                  {currentTab === 'settings' && (
                    <Settings
                      config={config}
                      onSaveConfig={setConfig}
                      onClearSessions={handleClearSessions}
                      currentUser={currentUser}
                      onLogout={handleLogout}
                    />
                  )}
                </>
              )}
            </div>
          </main>

          {/* ── Mobile Bottom Nav ── */}
          <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container border-t border-outline-variant/30 shadow-2xl rounded-t-xl md:hidden">
            {([
              { tab: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
              { tab: 'activity', Icon: ReceiptText, label: 'Activity' },
              { tab: 'vehicles', Icon: CarFront, label: 'Vehicles' },
              { tab: 'settings', Icon: SettingsIcon, label: 'Settings' },
            ] as const).map(({ tab, Icon, label }) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer select-none outline-none transition-all ${
                  currentTab === tab
                    ? 'text-primary bg-primary-container/10 px-4 py-2 scale-95 font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider leading-none">{label}</span>
              </button>
            ))}
          </nav>

        </div>
      )}
    </div>
  );
}
