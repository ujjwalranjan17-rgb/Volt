import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Sliders, ChevronRight, CheckCircle, Search, Zap, Trash2, ArrowLeft, PlusCircle,
  Battery, Leaf, Navigation, ChevronDown
} from 'lucide-react';
import { Vehicle } from '../types';
import { EV_CATALOG, EV_BRANDS } from '../evCatalog';

interface VehiclesProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectVehicle: (id: string) => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onNavigateToSettings: () => void;
}

export default function Vehicles({ 
  vehicles, 
  activeVehicle, 
  onSelectVehicle, 
  onAddVehicle, 
  onDeleteVehicle,
  onNavigateToSettings
}: VehiclesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form State for Adding a Vehicle
  const [manualBrand, setManualBrand] = useState('Tata');
  const [selectedModelKey, setSelectedModelKey] = useState('0');   // index into catalog, or '_custom'
  const [manualModel, setManualModel] = useState('');
  const [manualTrim, setManualTrim] = useState('Standard Range Plus');
  const [manualRange, setManualRange] = useState(380);
  const [manualCapacity, setManualCapacity] = useState(60);
  const [manualEfficiency, setManualEfficiency] = useState(130);

  // When brand changes: reset model selection to first in catalog
  const handleBrandChange = (brand: string) => {
    setManualBrand(brand);
    setSelectedModelKey('0');
  };

  // Auto-fill specs when a catalog model is chosen
  useEffect(() => {
    const models = EV_CATALOG[manualBrand] || [];
    if (selectedModelKey === '_custom') {
      setManualModel('');
      setManualTrim('Standard Range Plus');
      return;
    }
    const idx = parseInt(selectedModelKey, 10);
    const spec = models[idx];
    if (spec) {
      setManualModel(spec.model);
      setManualTrim(spec.trim);
      setManualRange(spec.range);
      setManualCapacity(spec.batteryCapacity);
      setManualEfficiency(spec.efficiency);
    }
  }, [selectedModelKey, manualBrand]);

  // Trigger simulated force synchronization
  const handleForceSync = () => {
    setSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      setSyncing(false);
      setSyncMessage('Vehicle synced successfully');
      setTimeout(() => setSyncMessage(null), 3000);
    }, 1500);
  };

  // Quick-pick brands for fast selection
  const QUICK_BRANDS = [
    { name: 'Tata',     label: 'Nexon EV' },
    { name: 'Mahindra', label: 'XUV400 / BE 6e' },
    { name: 'MG',       label: 'Windsor / ZS EV' },
    { name: 'Hyundai',  label: 'Creta / Ioniq 5' },
    { name: 'Kia',      label: 'EV6 / EV9' },
    { name: 'BMW',      label: 'iX1 / i4 / iX' },
  ];

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const finalModel = selectedModelKey === '_custom' ? manualModel : manualModel;
    if (!finalModel) return;

    const brandSlug = manualBrand.toLowerCase().replace(/\s+/g, '-');
    const id = `${brandSlug}-${Date.now()}`;

    // Shared placeholder image (neutral EV photo)
    const img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpJ0OEJLRm4eXKrvhqGucTJjNt-_szYOf0OWMog0ZsNRHzIiQav0wiVXQ4jP-t3fGdHUUTELNY8mQlcXMv0tva5eXN9EbZ_D3BmwgklPKNXfuogOql5oF1uzIlVIqJgOa2sBHV1fec2eVFOaR-Tj2Fhh16da44AbjvostUeZ8EljMxcUJUfL38sV_mEh4MnJYPQglCadrGFvuj2chz-4v0bFw3B_EQKQoYyBwFVWlUxU-3fCFKwSaFRGxw5ryyWGdysoxP8Y-WWdCf';

    const created: Vehicle = {
      id,
      brand: manualBrand,
      model: finalModel,
      trim: manualTrim,
      image: img,
      statusText: 'Registered • Connected',
      range: manualRange,
      batteryCapacity: manualCapacity,
      batterySoC: 90,
      efficiency: manualEfficiency,
      odometer: 0,
    };

    onAddVehicle(created);
    setIsAdding(false);
    setManualModel('');
    setManualTrim('Standard Range Plus');
    setSelectedModelKey('0');
  };

  // Filter brands + models by search query
  const filteredBrands = QUICK_BRANDS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="vehicles-tab" className="space-y-6">
      
      {/* State A: Add New Vehicle Screen */}
      {isAdding ? (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="text-primary hover:bg-surface-variant/40 p-2 rounded-full cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-sans text-xl font-bold text-on-surface">Add Custom Vehicle</h2>
          </div>

          <form onSubmit={handleCreateVehicle} className="space-y-5 bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl">

            {/* ── Step 1: Brand ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Manufacturer</label>
              <div className="relative">
                <select
                  value={manualBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 pr-8 outline-none focus:border-primary/60 transition-colors w-full appearance-none cursor-pointer"
                >
                  {EV_BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-on-surface-variant/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* ── Step 2: Model (catalog or custom) ─────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Model</label>
              <div className="relative">
                <select
                  value={selectedModelKey}
                  onChange={(e) => setSelectedModelKey(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 pr-8 outline-none focus:border-primary/60 transition-colors w-full appearance-none cursor-pointer"
                >
                  {(EV_CATALOG[manualBrand] || []).map((spec, idx) => (
                    <option key={idx} value={String(idx)}>
                      {spec.model} — {spec.trim}
                    </option>
                  ))}
                  <option value="_custom">✏ Enter custom model…</option>
                </select>
                <ChevronDown className="w-4 h-4 text-on-surface-variant/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Custom model name — only shown when custom is chosen */}
            {selectedModelKey === '_custom' && (
              <div className="flex flex-col gap-1.5 animate-fade-in duration-200">
                <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Custom Model Name</label>
                <input
                  type="text"
                  value={manualModel}
                  onChange={(e) => setManualModel(e.target.value)}
                  placeholder="e.g. Model Y, Nexon EV Max, BE 6e"
                  required
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 outline-none focus:border-primary/60 placeholder:text-on-surface-variant/30 transition-colors"
                />
              </div>
            )}

            {/* ── Auto-filled specs (always editable) ───────────────────── */}
            {selectedModelKey !== '_custom' && manualModel && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary font-semibold">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                Specs auto-filled from catalog — tweak below if needed
              </div>
            )}

            {/* Trim */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trim / Variant</label>
              <input
                type="text"
                value={manualTrim}
                onChange={(e) => setManualTrim(e.target.value)}
                placeholder="e.g. Long Range AWD, Standard Range Plus"
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 outline-none focus:border-primary/60 placeholder:text-on-surface-variant/30 transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Range (km)</label>
                <input
                  type="number"
                  value={manualRange}
                  onChange={(e) => setManualRange(Number(e.target.value))}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 text-right font-mono outline-none focus:border-primary/60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Battery (kWh)</label>
                <input
                  type="number"
                  value={manualCapacity}
                  onChange={(e) => setManualCapacity(Number(e.target.value))}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 text-right font-mono outline-none focus:border-primary/60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Wh/km</label>
                <input
                  type="number"
                  value={manualEfficiency}
                  onChange={(e) => setManualEfficiency(Number(e.target.value))}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm rounded-lg p-2.5 text-right font-mono outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary py-3 rounded-xl text-on-primary font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Add Vehicle
            </button>
          </form>

          {/* ── Quick-pick brand shortcuts ─────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] text-primary uppercase tracking-wider pl-1">Quick Pick</h3>
              <span className="font-mono text-[9px] text-on-surface-variant/60">{EV_BRANDS.length} brands · {Object.values(EV_CATALOG).flat().length} models</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brand…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {filteredBrands.map(b => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => handleBrandChange(b.name)}
                  className={`bg-surface-container-high border rounded-xl py-3 px-3.5 flex flex-col text-left hover:border-primary/50 transition-all group cursor-pointer ${manualBrand === b.name ? 'border-primary/60 bg-primary/5' : 'border-outline-variant/20'}`}
                >
                  <span className={`font-sans text-sm font-bold transition-colors ${manualBrand === b.name ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{b.name}</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* State B: Active Selected Vehicle Details Panel */
        <div className="space-y-6">
          
          {/* Header context selectors block */}
          <section className="space-y-4">
            
            {/* Horizontal switch context lists */}
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    v.id === activeVehicle.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                  }`}
                >
                  {v.brand} {v.model}
                </button>
              ))}
              <button
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-dashed border-outline-variant/50 text-primary-fixed hover:border-primary shrink-0 cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3.5" /> Add Car
              </button>
            </div>

            {/* Selected car identification summary */}
            <div className="flex justify-between items-start pt-2">
              <div>
                <h2 className="font-sans text-2xl font-bold text-on-surface tracking-tight">
                  {activeVehicle.brand} {activeVehicle.model}
                </h2>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  {activeVehicle.trim}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-mono text-[10px] text-primary font-bold">Synced 2m ago</span>
              </div>
            </div>

            {/* Image showcase layout */}
            <div className="w-full aspect-video rounded-xl bg-surface-container-high border border-outline-variant/40 overflow-hidden relative shadow-inner group">
              <img 
                src={activeVehicle.image} 
                alt={`${activeVehicle.brand} ${activeVehicle.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center mix-blend-luminosity opacity-85 group-hover:scale-105 transition-transform duration-500"
              />
              {/* Bottom linear dark shade cover */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
              
              {/* Floating metadata indicator */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Estimated Range</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-on-surface leading-none">{activeVehicle.range}</span>
                    <span className="font-mono text-xs font-semibold text-on-surface-variant">km</span>
                  </div>
                </div>

                <div className="bg-surface/85 backdrop-blur-sm p-1.5 rounded-lg border border-outline-variant/30 text-[10px] text-on-surface-variant font-mono">
                  {activeVehicle.statusText}
                </div>
              </div>
            </div>
          </section>

          {/* Telemetry Bento Grid layout */}
          <section className="grid grid-cols-2 gap-3">
            
            {/* Sub-panel A: SoC State card */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-between aspect-square relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2 z-10">
                <Battery className="w-5 h-5 text-secondary" />
                <span className="font-mono text-[9px] font-bold text-on-surface-variant bg-surface px-2 py-0.5 rounded-sm border border-outline-variant/10">SoC</span>
              </div>
              <div className="z-10 mt-auto">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-mono text-3xl font-bold text-on-surface leading-none">
                    {activeVehicle.batterySoC}
                  </span>
                  <span className="font-mono text-sm font-semibold text-secondary">%</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden border border-outline-variant/10">
                  <div 
                    className="bg-secondary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeVehicle.batterySoC}%` }}
                  ></div>
                </div>
              </div>

              {/* Decorative abstract elements overlay matching screenshot */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-[10px] border-secondary/10 group-hover:border-secondary/20 transition-colors pointer-events-none"></div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full border-[6px] border-secondary/15 pointer-events-none"></div>
            </div>

            {/* Sub-panel B: Lifetime Efficiency card */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-between aspect-square relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2 z-10">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-mono text-[9px] font-bold text-on-surface-variant bg-surface px-2 py-0.5 rounded-sm border border-outline-variant/10">Avg</span>
              </div>
              
              <div className="z-10 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-on-surface leading-none">
                    {activeVehicle.efficiency}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-primary">Wh/km</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1.5">
                  Top 15% green ranking
                </p>
              </div>

              {/* Abstract miniature SVG trend overlay line */}
              <svg className="absolute bottom-4 right-0 w-full h-12 opacity-25 group-hover:opacity-45 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0,30 Q20,10 40,25 T80,5 T100,20" fill="none" stroke="#6366f1" strokeWidth="2.5"></path>
              </svg>
            </div>

            {/* Sub-panel C: Cumulative Odometer spanning full width */}
            <div className="col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex items-center justify-between hover:border-outline-variant/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-xs text-on-surface-variant">Total Distance Logged</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-xl font-bold text-on-surface">
                      {activeVehicle.odometer.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">km</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </div>
            
          </section>

          {/* Action trigger interactive buttons list */}
          <section className="flex flex-col gap-3 pt-2">
            
            <button 
              onClick={handleForceSync}
              disabled={syncing}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-primary-fixed-dim transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing Telemetry...' : 'Force Sync Data'}</span>
            </button>

            {syncMessage && (
              <div className="flex items-center gap-2 justify-center py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>{syncMessage}</span>
              </div>
            )}

            <button 
              onClick={onNavigateToSettings}
              className="w-full py-3.5 rounded-xl bg-transparent border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-variant/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Sliders className="w-4 h-4 text-on-surface" />
              <span>Edit Cost Assumptions</span>
            </button>

            {vehicles.length > 1 && (
              <button 
                onClick={() => {
                  if (confirm(`Remove this ${activeVehicle.brand} from active storage?`)) {
                    onDeleteVehicle(activeVehicle.id);
                  }
                }}
                className="w-full py-2.5 bg-error/10 border border-error/20 text-error hover:bg-error hover:text-on-error rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors mt-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>De-register Vehicle Asset</span>
              </button>
            )}

          </section>

        </div>
      )}

    </div>
  );
}
