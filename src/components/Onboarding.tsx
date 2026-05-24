import React, { useState } from 'react';
import { Zap, CarFront, Sliders, ChevronRight, CheckCircle2, Sparkles, Sun, Plug } from 'lucide-react';

interface OnboardingProps {
  username: string;
  onGoToVehicles: () => void;
  onGoToSettings: () => void;
  onGoToLog: () => void;
  onDismiss: () => void; // Skip onboarding and go straight to dashboard
}

type Step = 'welcome' | 'how_it_works' | 'next_steps';

export default function Onboarding({
  username,
  onGoToVehicles,
  onGoToSettings,
  onGoToLog,
  onDismiss,
}: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');

  // ── Step: Welcome ─────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="space-y-6 pt-2">
        {/* Hero Welcome Card */}
        <div className="bg-surface-container-high border border-primary/25 rounded-2xl p-8 relative overflow-hidden text-center shadow-xl">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-secondary/6 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto shadow-inner">
              <Zap className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="font-black text-2xl text-on-surface tracking-tight">
                Welcome to Volt, <span className="text-primary capitalize">{username}</span> ⚡
              </h1>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-sm mx-auto">
                Your personal EV savings tracker. Find out exactly how much you're saving by driving electric instead of petrol.
              </p>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: <Sparkles className="w-4 h-4 text-primary mx-auto mb-1" />, label: 'Real savings vs ICE' },
                { icon: <Sun className="w-4 h-4 text-amber-400 mx-auto mb-1" />, label: 'Solar charging support' },
                { icon: <Plug className="w-4 h-4 text-secondary mx-auto mb-1" />, label: 'Home & public chargers' },
              ].map(({ icon, label }) => (
                <div key={label} className="bg-surface-container/60 border border-outline-variant/20 rounded-xl p-3">
                  {icon}
                  <p className="text-[10px] font-semibold text-on-surface-variant leading-tight">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('how_it_works')}
              className="w-full bg-primary text-on-primary font-extrabold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: How It Works ────────────────────────────────────────────────────────
  if (step === 'how_it_works') {
    return (
      <div className="space-y-5 pt-2">
        <div className="px-1">
          <h2 className="font-black text-xl text-on-surface tracking-tight">How Volt works</h2>
          <p className="text-xs text-on-surface-variant mt-1">Three simple steps to see your savings</p>
        </div>

        <div className="space-y-3">
          {[
            {
              num: '01',
              icon: <CarFront className="w-5 h-5 text-primary" />,
              title: 'Add your EV',
              desc: 'Register your electric vehicle — brand, model, battery size, and efficiency. Volt uses these to calculate accurate savings.',
              color: 'border-primary/30 bg-primary/5',
            },
            {
              num: '02',
              icon: <Plug className="w-5 h-5 text-secondary" />,
              title: 'Log charging sessions',
              desc: 'Every time you charge — at home, solar, or a public charger — log the kWh and cost. Solar charging counts as free.',
              color: 'border-secondary/30 bg-secondary/5',
            },
            {
              num: '03',
              icon: <Sliders className="w-5 h-5 text-tertiary" />,
              title: 'Set your assumptions',
              desc: 'Configure the ICE benchmark: petrol price, fuel efficiency (L/100km), and CO₂ per km. These drive all your savings calculations.',
              color: 'border-tertiary/30 bg-tertiary/5',
            },
          ].map(({ num, icon, title, desc, color }) => (
            <div key={num} className={`bg-surface-container border rounded-xl p-4 flex gap-4 ${color}`}>
              <div className="shrink-0 w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant/60 font-bold tracking-widest uppercase mb-0.5">Step {num}</p>
                <h3 className="font-bold text-sm text-on-surface">{title}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('next_steps')}
          className="w-full bg-primary text-on-primary font-extrabold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onDismiss}
          className="w-full text-on-surface-variant text-xs font-semibold py-2 hover:text-on-surface transition-colors cursor-pointer"
        >
          Skip setup for now
        </button>
      </div>
    );
  }

  // ── Step: Next Steps (action chooser) ────────────────────────────────────────
  return (
    <div className="space-y-5 pt-2">
      <div className="px-1 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-black text-xl text-on-surface tracking-tight">You're all set!</h2>
        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
          Where would you like to start?
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onGoToVehicles}
          className="w-full bg-surface-container-high border border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl p-4 flex items-center gap-4 text-left transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CarFront className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-on-surface">Add my first EV</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Register your vehicle details to begin</p>
          </div>
          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={onGoToLog}
          className="w-full bg-surface-container-high border border-secondary/30 hover:border-secondary hover:bg-secondary/5 rounded-xl p-4 flex items-center gap-4 text-left transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plug className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-on-surface">Log a charging session</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Enter your first kWh and cost data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-secondary transition-colors" />
        </button>

        <button
          onClick={onGoToSettings}
          className="w-full bg-surface-container-high border border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container rounded-xl p-4 flex items-center gap-4 text-left transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sliders className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-on-surface">Configure assumptions</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Set fuel price, ICE efficiency & CO₂ rate</p>
          </div>
          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
        </button>
      </div>

      <button
        onClick={onDismiss}
        className="w-full text-on-surface-variant text-xs font-semibold py-2 hover:text-on-surface transition-colors cursor-pointer"
      >
        Go to dashboard
      </button>
    </div>
  );
}
