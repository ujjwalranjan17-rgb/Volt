import React, { useState } from 'react';
import { Bolt, Car, Filter, Receipt, PlusCircle, Trash2, Calendar, HelpCircle, AlertCircle } from 'lucide-react';
import { ChargingSession, Vehicle, CostAssumptions } from '../types';
import { calculateLifetimeMetrics, calculateSessionMetrics, HistoricalBase, EMPTY_HISTORICAL } from '../utils';

interface ActivityProps {
  sessions: ChargingSession[];
  vehicles: Vehicle[];
  config: CostAssumptions;
  historical?: HistoricalBase;
  onNavigateToLog: () => void;
  onDeleteSession?: (id: string) => void;
}

export default function Activity({ sessions, vehicles, config, historical = EMPTY_HISTORICAL, onNavigateToLog, onDeleteSession }: ActivityProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'home' | 'commute' | 'supercharger'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const metrics = calculateLifetimeMetrics(sessions, vehicles, config, historical);

  // Group and format timeline sessions
  const getFilteredSessions = () => {
    let list = [...sessions].sort((a, b) => {
      // Sort desc by date, then by time
      const datetimeA = `${a.date}T${a.time}`;
      const datetimeB = `${b.date}T${b.time}`;
      return datetimeB.localeCompare(datetimeA);
    });

    if (activeFilter !== 'all') {
      list = list.filter(s => s.type === activeFilter);
    }
    return list;
  };

  const filteredSessions = getFilteredSessions();

  // Simple relative date label
  const getDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Yesterday logic
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Check month representation (matching October mock labels or general date)
    if (dateStr === today || dateStr === '2026-10-24') {
      return 'Today';
    } else if (dateStr === yesterday || dateStr === '2026-10-23') {
      return 'Yesterday';
    } else {
      // Format nicely
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    }
  };

  // Groups sessions by formatted date labels
  const groupedSessions: { [key: string]: ChargingSession[] } = {};
  filteredSessions.forEach(session => {
    const label = getDateLabel(session.date);
    if (!groupedSessions[label]) {
      groupedSessions[label] = [];
    }
    groupedSessions[label].push(session);
  });

  return (
    <div id="activity-tab" className="space-y-6">
      
      {/* Activity Capital Hero Banner */}
      <section className="bg-surface-container-high rounded-xl border border-outline-variant/40 p-6 flex items-center justify-between shadow-sm hover:border-outline-variant/60 transition-all">
        <div className="space-y-1">
          <h2 className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Monthly Fuel Savings</h2>
          <div className="font-mono text-3xl font-bold text-primary glow-text flex items-baseline">
            +₹ {metrics.thisMonthSavings.toLocaleString()}
          </div>
        </div>
        
        {/* Styled Curve Visual Accent */}
        <div className="h-12 w-28 relative">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path 
              d="M0 31 Q 25 10, 50 20 T 100 5" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]"
            />
          </svg>
        </div>
      </section>

      {/* Action panel & Direct Logs header (Filters removed based on user pref) */}
      <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <h3 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">All Activity Logs</h3>
        </div>

        {/* Add Charging Button */}
        <button
          onClick={onNavigateToLog}
          className="bg-primary/95 hover:bg-primary text-on-primary font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Charge/Travel</span>
        </button>
      </div>

      {/* Main timeline listing */}
      <section className="relative">
        
        {/* Timeline continuity vertical line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-outline-variant/20 z-0"></div>

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-12 px-6 bg-surface-container-low border border-outline-variant/10 rounded-xl space-y-3">
            <Filter className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
            <h4 className="text-on-surface font-semibold">No Sessions Found</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              No records match your selected category filter. Consider clearing active inputs or logging a charge.
            </p>
            <button 
              onClick={() => setActiveFilter('all')} 
              className="mt-2 text-xs font-bold text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="flex flex-col gap-8 relative z-10">
          {Object.entries(groupedSessions).map(([dateLabel, records]) => (
            <div key={dateLabel} className="space-y-4">
              
              {/* Date Header Tag */}
              <div className="font-mono text-[11px] font-bold text-on-surface-variant/80 tracking-widest pl-14">
                {dateLabel}
              </div>

              {/* Records within Date */}
              {records.map((session) => {
                const vehicle = vehicles.find(v => v.id === session.vehicleId) || vehicles[0];
                const sessionMetrics = calculateSessionMetrics(session, vehicle, config);

                // Styling configurations based on event type
                let iconEl;
                let costColorStyle = 'text-primary';
                let tagColors = 'bg-primary-container/10 text-primary border border-primary/20';
                let badgeLabel = 'Premium Charging';
                let specText = `${session.energyKwh} kWh`;
                let secondarySpecText = '100% Battery';

                if (session.type === 'home') {
                  iconEl = <Bolt className="w-5 h-5 text-primary" />;
                  costColorStyle = 'text-primary';
                  tagColors = 'bg-primary-container/10 text-primary border border-primary/25';
                  badgeLabel = 'Home Charging';
                  specText = `${session.energyKwh} kWh`;
                  secondarySpecText = session.notes?.includes('100%') ? '100% Battery' : 'Smart Charge';
                } else if (session.type === 'commute') {
                  iconEl = <Car className="w-5 h-5 text-secondary" />;
                  costColorStyle = 'text-secondary';
                  tagColors = 'bg-secondary/10 text-secondary border border-secondary/25';
                  badgeLabel = session.notes || 'Commute to Office';
                  specText = `Trip Offset`;
                  secondarySpecText = `${session.energyKwh} kWh used`;
                } else {
                  // Supercharger
                  iconEl = <Receipt className="w-5 h-5 text-tertiary" />;
                  costColorStyle = 'text-error';
                  tagColors = 'orange-tag bg-secondary-container/20 text-secondary border border-secondary-container/30';
                  badgeLabel = session.location;
                  specText = `${session.energyKwh} kWh`;
                  secondarySpecText = '35 min';
                }

                return (
                  <div key={session.id} className="flex gap-4 items-start group relative">
                    
                    {/* Event Timestamp and Circular status indicator */}
                    <div className="w-14 flex flex-col items-center shrink-0">
                      <div className="font-mono text-[11px] font-semibold text-on-surface mt-1">
                        {session.time}
                      </div>
                      <div className="w-10 h-10 mt-2 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center relative shadow-sm hover:scale-105 transition-all">
                        {iconEl}
                      </div>
                    </div>

                    {/* Timeline Event details card */}
                    <div className="flex-1 bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 hover:bg-surface-container transition-all relative overflow-hidden group-hover:border-outline-variant/50">
                      
                      {/* Delete Session action overlay */}
                      <button 
                        onClick={() => setShowDeleteConfirm(session.id)}
                        className="absolute top-2.5 right-2 px-2 py-1 bg-surface rounded-md border border-outline-variant/20 text-on-surface-variant hover:text-error hover:border-error/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Header block */}
                      <div className="flex justify-between items-start mb-1 pr-6">
                        <div>
                          <h3 className="font-sans text-sm font-bold text-on-surface leading-tight">
                            {badgeLabel}
                          </h3>
                          {vehicle && (
                            <span className="font-mono text-[10px] text-primary/85 font-semibold">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          )}
                        </div>
                        
                        {/* Dynamic calculations result */}
                        {session.type === 'commute' ? (
                          <span className="font-mono text-xs font-bold text-secondary">
                            Travel Log
                          </span>
                        ) : session.cost === 0 || session.isSolar ? (
                          <span className={`font-mono text-xs font-bold text-primary`}>
                            +₹ {sessionMetrics.calculatedSavings.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-bold text-error">
                            -₹ {session.cost.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Description string */}
                      <p className="font-sans text-xs text-on-surface-variant mb-3">
                        {session.notes || `${session.location} Charging Cycle`}
                      </p>

                      {/* Metadata Labels list */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${tagColors}`}>
                          {specText}
                        </span>
                        {secondarySpecText && (
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-surface-variant/80 text-on-surface-variant">
                            {secondarySpecText}
                          </span>
                        )}
                        {session.isSolar && (
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-secondary-container/20 text-secondary border border-secondary-container/30">
                            ☀ Solar Power
                          </span>
                        )}
                        {/* Captured Odometer Reading field */}
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          Odo: {(session.odometerReading || vehicle?.odometer || 0).toLocaleString()} km
                        </span>
                      </div>

                      {/* Delete Modal Confirmation Inside Event Card */}
                      {showDeleteConfirm === session.id && (
                        <div className="absolute inset-0 bg-surface-container-highest/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center gap-3 z-30 transition-all">
                          <p className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-error" /> Delete this event log completely?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (onDeleteSession) onDeleteSession(session.id);
                                setShowDeleteConfirm(null);
                              }}
                              className="bg-error text-on-error px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-error/90"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-md text-[11px] font-semibold hover:bg-surface-variant/50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
