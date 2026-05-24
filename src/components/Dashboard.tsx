import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Calendar, Route, Plug, Fuel, Sparkles, TrendingUp, PlusCircle, Zap } from 'lucide-react';
import { Vehicle, ChargingSession, CostAssumptions } from '../types';
import { calculateLifetimeMetrics, generateChartFromSessions, HistoricalBase, EMPTY_HISTORICAL } from '../utils';
import { CHART_DATA_6M } from '../mockData';

interface DashboardProps {
  sessions: ChargingSession[];
  vehicles: Vehicle[];
  config: CostAssumptions;
  activeVehicle: Vehicle | null;
  userAvatar: string;
  historical: HistoricalBase;
  isDemo: boolean;
  onNavigateToVehicles: () => void;
  onNavigateToLog: () => void;
}

export default function Dashboard({
  sessions,
  vehicles,
  config,
  activeVehicle,
  userAvatar,
  historical,
  isDemo,
  onNavigateToVehicles,
  onNavigateToLog,
}: DashboardProps) {
  const [timeline, setTimeline] = useState<'3_months' | '6_months' | '1_year'>('6_months');

  // All metrics derived from real sessions + the historical baseline
  const metrics = calculateLifetimeMetrics(sessions, vehicles, config, historical);

  // ── Chart Data ───────────────────────────────────────────────────────────────
  // Demo account: use pre-seeded 6-month chart for a rich initial experience.
  // Real users: build chart from their own logged sessions.
  const getRealChartData = () => generateChartFromSessions(sessions, vehicles, config);

  const getFilteredChartData = () => {
    if (isDemo) {
      switch (timeline) {
        case '3_months':
          return CHART_DATA_6M.slice(3);
        case '1_year':
          return [
            { month: 'Jul', savings: 1500, kwh: 210 },
            { month: 'Aug', savings: 3200, kwh: 260 },
            { month: 'Sep', savings: 5900, kwh: 340 },
            ...CHART_DATA_6M,
          ];
        default:
          return CHART_DATA_6M;
      }
    }

    // Real users — use generated data, filtered by timeline
    const real = getRealChartData();
    if (real.length === 0) return [];
    switch (timeline) {
      case '3_months':
        return real.slice(-3);
      case '1_year':
        return real.slice(-12);
      default:
        return real.slice(-6);
    }
  };

  const chartData = getFilteredChartData();
  const hasData = sessions.length > 0;

  // ── Custom Tooltip ───────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high border border-outline-variant/50 p-3 rounded-lg shadow-xl font-body-sm">
          <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="text-on-surface font-sans text-xs">Savings:</span>
            <span className="font-mono text-primary font-bold text-xs">₹ {payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="text-on-surface font-sans text-xs">Energy:</span>
            <span className="font-mono text-secondary font-bold text-xs">{payload[0].payload.kwh} kWh</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ── Empty State: No sessions yet ─────────────────────────────────────────────
  const EmptyDashboard = () => (
    <div className="space-y-6">
      {/* Zero-state hero */}
      <section className="bg-surface-container-high border border-primary/20 rounded-xl p-6 relative overflow-hidden text-center">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-bold text-on-surface">Your savings start here</h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto leading-relaxed">
              Log your first charging session to see how much you're saving compared to a petrol car.
            </p>
          </div>
          <button
            onClick={vehicles.length === 0 ? onNavigateToVehicles : onNavigateToLog}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {vehicles.length === 0 ? 'Add Your EV First' : 'Log First Charge'}
          </button>
        </div>
      </section>

      {/* Zero metrics */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold text-primary uppercase tracking-widest px-1">Your Progress</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x -mx-4 px-4">
          {[
            { label: 'Lifetime Savings', value: '₹ 0', icon: <Sparkles className="w-4 h-4 text-primary" />, color: 'bg-primary-container/10 border-primary/20' },
            { label: 'EV Kilometers', value: '0 km', icon: <Route className="w-4 h-4 text-secondary" />, color: 'bg-secondary/10 border-secondary/20' },
            { label: 'Charging Cost', value: '₹ 0', icon: <Plug className="w-4 h-4 text-tertiary" />, color: 'bg-tertiary-container/10 border-tertiary-container/20' },
          ].map(card => (
            <div key={card.label} className="min-w-[150px] flex-1 flex-shrink-0 bg-surface-container border border-outline-variant/20 rounded-xl p-4 snap-start opacity-60">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 border ${card.color}`}>
                {card.icon}
              </div>
              <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{card.label}</p>
              <p className="font-mono text-xl font-bold text-on-surface-variant">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chart placeholder */}
      <section className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
        <h3 className="font-semibold text-base text-on-surface mb-1">Savings Growth</h3>
        <p className="text-[11px] text-on-surface-variant mb-6">Your chart will appear once you start logging sessions.</p>
        <div className="h-36 w-full flex items-center justify-center border border-dashed border-outline-variant/30 rounded-lg">
          <div className="text-center space-y-2">
            <TrendingUp className="w-8 h-8 text-on-surface-variant/25 mx-auto" />
            <p className="text-xs text-on-surface-variant/50 font-medium">No data yet</p>
          </div>
        </div>
      </section>
    </div>
  );

  // Show zero state if no sessions have been logged
  if (!hasData && !isDemo) {
    return <EmptyDashboard />;
  }

  // ── Populated Dashboard ───────────────────────────────────────────────────────
  return (
    <div id="dashboard-tab" className="space-y-6">

      {/* Hero: Lifetime Savings */}
      <section className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 relative overflow-hidden shadow-lg transition-all hover:border-outline-variant/50">
        <div className="absolute -top-[120px] -right-[120px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Lifetime Savings</h2>
            <p className="text-[10px] text-primary/80 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Financial offset vs ICE vehicles
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-highest/80 px-2.5 py-1 rounded-full border border-outline-variant/40 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-3xl font-bold text-primary glow-text">₹</span>
            <span className="text-5xl font-mono font-bold text-primary tracking-tighter leading-none glow-text">
              {Math.floor(metrics.lifetimeSavings).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-5">
          <div className="space-y-1">
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Petrol Avoided</p>
            <p className="font-mono text-xl font-bold text-on-surface">
              {metrics.petrolAvoidedLiters.toLocaleString()} <span className="text-sm text-on-surface-variant font-normal">L</span>
            </p>
          </div>
          <div className="h-8 w-px bg-outline-variant/20"></div>
          <div className="space-y-1 text-right">
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">CO₂ Reduced</p>
            <p className="font-mono text-xl font-bold text-primary-fixed">
              {metrics.co2ReducedTons} <span className="text-sm text-on-surface-variant font-normal">t</span>
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold text-primary uppercase tracking-widest px-1">Active Performance</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scroll-smooth -mx-4 px-4 scrollbar-thin">

          <div className="min-w-[150px] flex-1 flex-shrink-0 bg-surface-container border border-outline-variant/20 rounded-xl p-4 snap-start transition-all hover:bg-surface-container-high hover:border-primary/40 group">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">This Month</p>
            <p className="font-mono text-2xl font-bold text-on-surface text-primary-fixed-dim">
              ₹ {Math.round(metrics.thisMonthSavings).toLocaleString()}
            </p>
          </div>

          <div className="min-w-[150px] flex-1 flex-shrink-0 bg-surface-container border border-outline-variant/20 rounded-xl p-4 snap-start transition-all hover:bg-surface-container-high hover:border-primary/40 group">
            <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Route className="w-4 h-4 text-secondary" />
            </div>
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">EV Kilometers</p>
            <p className="font-mono text-2xl font-bold text-on-surface">
              {metrics.totalEvKm.toLocaleString()} <span className="text-xs text-on-surface-variant font-normal">km</span>
            </p>
          </div>

          <div className="min-w-[150px] flex-1 flex-shrink-0 bg-surface-container border border-outline-variant/20 rounded-xl p-4 snap-start transition-all hover:bg-surface-container-high hover:border-primary/40 group">
            <div className="w-8 h-8 rounded-full bg-tertiary-container/10 border border-tertiary-container/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plug className="w-4 h-4 text-tertiary" />
            </div>
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Charging Cost</p>
            <p className="font-mono text-2xl font-bold text-on-surface">
              ₹ {Math.round(metrics.thisMonthChargingCost).toLocaleString()}
            </p>
          </div>

          <div className="min-w-[150px] flex-1 flex-shrink-0 bg-surface-container border border-outline-variant/20 rounded-xl p-4 snap-start transition-all hover:bg-surface-container-high hover:border-primary/40 group">
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4 text-on-surface-variant" />
            </div>
            <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">ICE Fuel Price</p>
            <p className="font-mono text-2xl font-bold text-on-surface">
              ₹ {config.fuelPricePerLiter.toFixed(1)}<span className="text-[10px] font-normal text-on-surface-variant">/L</span>
            </p>
          </div>

        </div>
      </section>

      {/* Savings Growth Chart */}
      <section className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-base text-on-surface">Savings Growth</h3>
            <p className="text-[11px] text-on-surface-variant leading-normal">
              Aggregated capital growth over active driving cycles
            </p>
          </div>
          <div className="flex bg-surface-container-highest/60 p-1 rounded-lg border border-outline-variant/30">
            {(['3_months', '6_months', '1_year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeline(t)}
                className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  timeline === t
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === '3_months' ? '3M' : t === '6_months' ? '6M' : 'YTD'}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 w-full flex items-center justify-center border border-dashed border-outline-variant/30 rounded-lg">
            <div className="text-center space-y-2">
              <TrendingUp className="w-8 h-8 text-on-surface-variant/25 mx-auto" />
              <p className="text-xs text-on-surface-variant/50 font-medium">Not enough data for this period</p>
            </div>
          </div>
        ) : (
          <div className="h-48 w-full mr-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(161,161,170,0.08)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1.5 }} />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGlow)"
                  dot={{ r: 3, stroke: '#0a0a0c', strokeWidth: 1.5, fill: '#6366f1' }}
                  activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 1, fill: '#0a0a0c' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/10 text-[10px] text-on-surface-variant font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span>Capital Saved (₹)</span>
          </div>
          {metrics.lifetimeSavings > 0 && (
            <div className="flex items-center gap-1.5 text-on-surface">
              <TrendingUp className="w-3 h-3" />
              <span>Savings growing</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
