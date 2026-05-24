import React, { useState } from 'react';
import { Sliders, RefreshCw, Trash2, HelpCircle, Save, CheckCircle2, ShieldAlert, Sparkles, User, Info } from 'lucide-react';
import { CostAssumptions } from '../types';

interface SettingsProps {
  config: CostAssumptions;
  onSaveConfig: (newConfig: CostAssumptions) => void;
  onClearSessions: () => void;
  currentUser: string;
  onLogout: () => void;
}

export default function Settings({ config, onSaveConfig, onClearSessions, currentUser, onLogout }: SettingsProps) {
  const [fuelPrice, setFuelPrice] = useState(config.fuelPricePerLiter.toString());
  const [electricityPrice, setElectricityPrice] = useState(config.electricityPricePerKwh.toString());
  const [petrolLiters, setPetrolLiters] = useState(config.petrolLitersPer100km.toString());
  const [co2Emissions, setCo2Emissions] = useState(config.co2EmissionsGPerKm.toString());

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedFuel = parseFloat(fuelPrice);
    const parsedElec = parseFloat(electricityPrice);
    const parsedLiters = parseFloat(petrolLiters);
    const parsedCO2 = parseFloat(co2Emissions);

    if (isNaN(parsedFuel) || isNaN(parsedElec) || isNaN(parsedLiters) || isNaN(parsedCO2)) {
      alert('Please fill in valid numerical values');
      return;
    }

    onSaveConfig({
      fuelPricePerLiter: parsedFuel,
      electricityPricePerKwh: parsedElec,
      petrolLitersPer100km: parsedLiters,
      co2EmissionsGPerKm: parsedCO2
    });

    setFeedback('Settings updated successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetToDefaults = () => {
    setFuelPrice('101.5');
    setElectricityPrice('7.5');
    setPetrolLiters('7.5');
    setCo2Emissions('120');

    onSaveConfig({
      fuelPricePerLiter: 101.5,
      electricityPricePerKwh: 7.5,
      petrolLitersPer100km: 7.5,
      co2EmissionsGPerKm: 120
    });

    setFeedback('Restored initial assumptions');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div id="settings-tab" className="space-y-6">
      
      {/* Profile Header Widget */}
      <section className="bg-surface-container-high rounded-xl border border-outline-variant/30 p-5 flex items-center justify-between hover:border-outline-variant/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-on-surface">Volt Profile</h3>
            <p className="font-mono text-xs text-on-surface-variant leading-none mt-1">
              {currentUser === 'ujjwal' ? 'Ujjwal.Ranjan@walmart.com' : `${currentUser}@volt.ev`}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-xs bg-surface-container-highest border border-outline-variant hover:border-error hover:text-error rounded-xl px-4 py-2 font-bold transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </section>

      {/* Assumptions Configuration Form */}
      <section className="space-y-4">
        <div className="px-1 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-on-surface">Cost Assumptions</h3>
            <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">Parameters used to estimate fuel and clean CO2 offset</p>
          </div>
          <Sliders className="w-4 h-4 text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container-low border border-outline-variant/20 p-5 rounded-2xl">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Fuel Price per Liter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                Fuel Price (₹/L)
              </span>
              <input 
                type="number"
                step="0.01"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono rounded-lg p-2.5 text-right outline-none text-sm focus:border-primary/60 transition-colors"
                required
              />
            </div>

            {/* Electricity rate */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                Electricity (₹/kWh)
              </span>
              <input 
                type="number"
                step="0.01"
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono rounded-lg p-2.5 text-right outline-none text-sm focus:border-primary/60 transition-colors"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* ICE fuel consumption benchmark */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                ICE Liters / 100km
              </span>
              <input 
                type="number"
                step="0.1"
                value={petrolLiters}
                onChange={(e) => setPetrolLiters(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono rounded-lg p-2.5 text-right outline-none text-sm focus:border-primary/60 transition-colors"
                required
              />
            </div>

            {/* CO2 Emissions */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                ICE CO2 g/km
              </span>
              <input 
                type="number"
                step="1"
                value={co2Emissions}
                onChange={(e) => setCo2Emissions(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono rounded-lg p-2.5 text-right outline-none text-sm focus:border-primary/60 transition-colors"
                required
              />
            </div>

          </div>

          {/* Quick tips alert */}
          <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/10 text-[11px] text-on-surface-variant flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Adjusting these targets directly impacts your estimated savings calculation metrics in real time. Standard baseline estimates are aligned with EPA global indices.
            </span>
          </div>

          {/* Actions button list */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold text-sm hover:bg-primary-fixed-dim transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 select-none cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Assumes
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-4 bg-surface-container border border-outline-variant text-on-surface rounded-xl hover:bg-surface-variant/40 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {feedback && (
            <div className="flex items-center gap-2 justify-center py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}
        </form>
      </section>

      {/* Storage and Reset Actions list */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-on-surface text-error">Account Maintenance</h3>
          <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">Admin capabilities to clear system caches or sign out</p>
        </div>

        {showClearConfirm ? (
          <div className="bg-surface p-4 rounded-xl border border-error/20 space-y-3 animate-fade-in">
            <p className="text-xs text-on-surface leading-relaxed flex gap-2 items-center">
              <ShieldAlert className="w-5 h-5 text-error shrink-0" />
              <span>Are you sure? This deletes ALL logged charging events and resets your vehicles list.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClearSessions();
                  setShowClearConfirm(false);
                  setFeedback('History erased successfully');
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="bg-error text-on-error px-4 py-2 rounded-lg text-xs font-bold hover:bg-error/90 cursor-pointer"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-surface-container-high border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-xs font-semibold hover:border-on-surface cursor-pointer"
              >
                Nevermind
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-3.5 bg-error/10 border border-error/20 hover:bg-error hover:text-on-error rounded-xl font-bold text-xs text-error flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Erase User Data & Settings</span>
            </button>
            
            <button
              onClick={onLogout}
              className="w-full py-3.5 bg-surface-container-high border border-outline-variant hover:border-on-surface rounded-xl font-bold text-xs text-on-surface-variant flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign Out of Account ({currentUser})</span>
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
