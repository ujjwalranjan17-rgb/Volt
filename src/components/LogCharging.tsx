import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Zap, Sun, CheckCircle, ArrowLeft, Lightbulb, Car, Gauge } from 'lucide-react';
import { ChargingSession, Vehicle, CostAssumptions } from '../types';

interface LogChargingProps {
  vehicles: Vehicle[];
  defaultVehicleId: string;
  config: CostAssumptions;
  onSave: (session: ChargingSession) => void;
  onCancel: () => void;
}

export default function LogCharging({ vehicles, defaultVehicleId, config, onSave, onCancel }: LogChargingProps) {
  // Field state
  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultVehicleId);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [energy, setEnergy] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [odometerReading, setOdometerReading] = useState<string>('');
  const [isSolar, setIsSolar] = useState(false);
  const [sessionType, setSessionType] = useState<'home' | 'supercharger' | 'commute'>('home');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Initialize location based on session type
  useEffect(() => {
    if (sessionType === 'home') {
      setLocation('Home Charger');
    } else if (sessionType === 'supercharger') {
      setLocation('Fast Charger Station API');
    } else {
      setLocation('Office Parking Chargers');
    }
  }, [sessionType]);

  // Set default draft odometer based on current vehicle status
  useEffect(() => {
    if (selectedVehicle) {
      setOdometerReading((selectedVehicle.odometer + 45).toString());
    }
  }, [selectedVehicleId]);

  // Auto-calculated suggestions banner
  const [calculatedCost, setCalculatedCost] = useState<number>(0);

  // Recalculate billing estimate on inputs update
  useEffect(() => {
    const kwh = parseFloat(energy) || 0;
    if (isSolar) {
      setCalculatedCost(0);
    } else {
      setCalculatedCost(kwh * config.electricityPricePerKwh);
    }
  }, [energy, isSolar, config.electricityPricePerKwh]);

  // Set default cost value if user clicks "auto-fill"
  const handleAutoFillCost = () => {
    setCost(calculatedCost.toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEnergy = parseFloat(energy) || 0;
    const finalCost = parseFloat(cost) || 0;
    const finalOdo = parseInt(odometerReading) || (selectedVehicle ? selectedVehicle.odometer : 0);

    if (!location) return alert('Please enter a location');
    if (finalEnergy <= 0) return alert('Please enter energy in kWh');
    if (selectedVehicle && finalOdo < selectedVehicle.odometer) {
      return alert(`Odometer reading cannot be less than the vehicle's current reading (${selectedVehicle.odometer} km)`);
    }

    const newSession: ChargingSession = {
      id: `session-${Date.now()}`,
      date,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      location,
      energyKwh: finalEnergy,
      cost: finalCost,
      isSolar,
      vehicleId: selectedVehicleId,
      type: sessionType,
      odometerReading: finalOdo,
      notes: isSolar 
        ? `Clean solar energy charge. Saved grid cost. Odo at ${finalOdo} km.` 
        : `Charged ${finalEnergy} kWh of power at ${location}. Odo at ${finalOdo} km.`
    };

    onSave(newSession);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-background min-h-screen relative shadow-[0_0_40px_rgba(0,0,0,0.55)] border-x border-outline-variant/10">
      
      {/* Header section with top navigation */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b border-outline-variant/30 sticky top-0 z-10">
        <button 
          onClick={onCancel}
          className="text-primary hover:bg-surface-variant/50 transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer select-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans font-bold text-lg text-primary uppercase tracking-wider">Log Charging</h1>
        <div className="w-10"></div> {/* Spacer balance */}
      </header>

      {/* Inputs Form */}
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Vehicle Selection list */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="vehicle-select">Select Preferred Car</label>
            <div className="relative">
              <Car className="w-5 h-5 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="vehicle-select"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-primary block w-full pl-11 p-3 text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.trim})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Session Mode toggle list */}
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSessionType('home');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                sessionType === 'home'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Home Outlets
            </button>
            <button
              type="button"
              onClick={() => {
                setSessionType('supercharger');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                sessionType === 'supercharger'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              DC Fast Chargers
            </button>
          </div>

          {/* Date Selector input */}
          <div className="flex flex-col space-y-1.5 animate-slide-up">
            <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="date">Date picker</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="date"
                id="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-primary block w-full pl-11 p-3 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Location details input */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="location">Station Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                id="location"
                placeholder="Search or select recent..."
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-primary block w-full pl-11 p-3 text-sm focus:outline-none transition-colors placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Odometer input */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="odometer">Odometer reading (km)</label>
            <div className="relative">
              <Gauge className="w-5 h-5 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="number"
                id="odometer"
                placeholder={selectedVehicle ? `${selectedVehicle.odometer} km` : "Current km"}
                required
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-primary block w-full pl-11 p-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            {selectedVehicle && (
              <span className="text-[10px] text-on-surface-variant/70 pl-1">
                Current Odometer: <span className="font-mono text-primary font-semibold">{selectedVehicle.odometer} km</span>
              </span>
            )}
          </div>

          {/* Metrics grid inputs */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Added energy kWh input */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="energy">Energy (kWh)</label>
              <div className="relative">
                <Zap className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="number"
                  id="energy"
                  step="0.1"
                  required
                  placeholder="0.0"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-secondary block w-full pl-10 p-3 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Total Billing Cost input */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="cost">Total Cost (₹)</label>
              <div className="relative flex items-center">
                <span className="text-primary font-bold text-sm absolute left-3 mt-0.5">₹</span>
                <input 
                  type="number"
                  id="cost"
                  step="1"
                  required
                  placeholder="₹ 0.0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-lg focus:border-primary block w-full pl-8 p-3 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

          </div>

          {/* Quick Cost Estimator Suggestions Indicator */}
          {parseFloat(energy) > 0 && (
            <div className="p-3 bg-surface-container-low rounded-xl border border-primary/20 flex justify-between items-center text-xs text-on-surface-variant animate-fade-in">
              <span className="flex items-center gap-1.5 text-primary">
                <Lightbulb className="w-4 h-4" />
                <span>Estimate: <span className="font-mono text-on-surface font-bold text-primary">₹ {calculatedCost.toFixed(1)}</span></span>
              </span>
              <button 
                type="button" 
                onClick={handleAutoFillCost}
                className="text-primary font-mono font-bold hover:underline underline-offset-2 hover:text-primary-fixed cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Solar Panel energy toggle */}
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container/25 flex items-center justify-center text-secondary border border-secondary-container/10">
                <Sun className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-sans text-xs font-bold text-on-surface">Solar / Rooftop Charging</p>
                <p className="font-sans text-[10px] text-on-surface-variant mt-0.5">Zero electricity grid tariff</p>
              </div>
            </div>

            {/* Custom interactive toggle button */}
            <button
              type="button"
              onClick={() => {
                const checked = !isSolar;
                setIsSolar(checked);
                if (checked) {
                  setCost('0');
                }
              }}
              className={`w-12 h-6 rounded-full transition-all relative outline-none cursor-pointer flex items-center p-0.5 ${
                isSolar ? 'bg-primary' : 'bg-surface-variant border border-outline-variant'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-surface shadow-md transform transition-all translate-x-0 ${
                isSolar ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Fixed bottom Save Area with rich interactions */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-[15px] py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex justify-center items-center gap-2 select-none cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Save Charge Log</span>
            </button>
          </div>

        </form>
      </main>

    </div>
  );
}
