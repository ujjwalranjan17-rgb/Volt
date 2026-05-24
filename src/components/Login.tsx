import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Check, X, Zap, AlertCircle, KeyRound, ShieldCheck, Sparkles, Users } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

// ─── Password Hashing ─────────────────────────────────────────────────────────
const APP_SALT = 'volt_ev_tracker_2026';

async function hashPassword(raw: string): Promise<string> {
  const encoded = new TextEncoder().encode(raw + APP_SALT);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Community — Early Adopters ───────────────────────────────────────────────
// Seeded members shown as social proof; combined with real registered users.
const EARLY_ADOPTERS = [
  { initials: 'UJ', display: 'Ujj***l R.',  car: 'Tata Nexon EV',       savings: '₹1.2L',  color: 'bg-indigo-500' },
  { initials: 'RS', display: 'Raj** S.',     car: 'Mahindra BE 6e',      savings: '₹88K',   color: 'bg-emerald-500' },
  { initials: 'PP', display: 'Pri** P.',     car: 'Hyundai Creta EV',    savings: '₹74K',   color: 'bg-violet-500' },
  { initials: 'AM', display: 'Arj** M.',     car: 'MG Windsor EV',       savings: '₹61K',   color: 'bg-sky-500' },
  { initials: 'SK', display: 'Sur** K.',     car: 'Tata Punch EV',       savings: '₹53K',   color: 'bg-amber-500' },
  { initials: 'NR', display: 'Neh** R.',     car: 'Kia EV6',             savings: '₹1.4L',  color: 'bg-pink-500' },
  { initials: 'VK', display: 'Vik** K.',     car: 'BYD Atto 3',          savings: '₹96K',   color: 'bg-teal-500' },
  { initials: 'AJ', display: 'Anj** J.',     car: 'Tata Curvv EV',       savings: '₹47K',   color: 'bg-rose-500' },
  { initials: 'DG', display: 'Dee** G.',     car: 'BMW iX1',             savings: '₹1.8L',  color: 'bg-blue-500' },
  { initials: 'MS', display: 'Man** S.',     car: 'Volvo XC40 Recharge', savings: '₹2.1L',  color: 'bg-orange-500' },
  { initials: 'RK', display: 'Roh** K.',     car: 'Mahindra XUV400',     savings: '₹68K',   color: 'bg-cyan-500' },
  { initials: 'SN', display: 'Sha** N.',     car: 'MG ZS EV',            savings: '₹55K',   color: 'bg-lime-500' },
];

function maskUsername(username: string): string {
  if (username.length <= 3) return username + '***';
  const head = username.slice(0, 2);
  const tail = username.length > 5 ? username.slice(-1) : '';
  return `${head}***${tail}.`;
}

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-sky-500',
  'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
];

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDemoPass, setShowDemoPass] = useState(false);

  // Real registered users from localStorage (usernames only, never hashes)
  const [realUsers, setRealUsers] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('volt_users');
    if (raw) {
      try {
        const users: Record<string, string> = JSON.parse(raw);
        setRealUsers(Object.keys(users));
      } catch { /* ignore */ }
    }
  }, []);

  // Live password validation
  const [passRules, setPassRules] = useState({
    length: false, uppercase: false, lowercase: false, number: false, special: false,
  });
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    if (!isRegistering) return;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPassRules(checks);
    setStrengthScore(Object.values(checks).filter(Boolean).length);
  }, [password, isRegistering]);

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setUsername(''); setPassword(''); setConfirmPassword('');
    setErrorMsg(''); setSuccessMsg('');
  };

  // ── One-click demo login ───────────────────────────────────────────────────
  const handleDemoLogin = () => {
    onLoginSuccess('ujjwal');
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) { setErrorMsg('Please enter both username and password.'); return; }
    const cleanUsername = username.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const inputHash = await hashPassword(password);
      if (cleanUsername === 'ujjwal') {
        const demoHash = await hashPassword('Password@123');
        if (inputHash === demoHash) { onLoginSuccess('ujjwal'); return; }
        setErrorMsg('Invalid username or password.'); return;
      }
      const usersRaw = localStorage.getItem('volt_users');
      const users: Record<string, string> = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[cleanUsername] && users[cleanUsername] === inputHash) {
        onLoginSuccess(cleanUsername);
      } else {
        setErrorMsg('Invalid username or password.');
      }
    } catch { setErrorMsg('An unexpected error occurred. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) { setErrorMsg('Username is required.'); return; }
    if (cleanUsername.length < 3) { setErrorMsg('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) { setErrorMsg('Username can only contain letters, numbers, and underscores.'); return; }
    if (!Object.values(passRules).every(Boolean)) { setErrorMsg('Password does not meet all security requirements.'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    const usersRaw = localStorage.getItem('volt_users');
    const users: Record<string, string> = usersRaw ? JSON.parse(usersRaw) : {};
    if (cleanUsername === 'ujjwal' || users[cleanUsername]) { setErrorMsg('That username is already taken. Please choose another.'); return; }
    setIsSubmitting(true);
    try {
      const hashed = await hashPassword(password);
      users[cleanUsername] = hashed;
      localStorage.setItem('volt_users', JSON.stringify(users));
      setSuccessMsg('Account created! Signing you in…');
      setTimeout(() => onLoginSuccess(cleanUsername), 1200);
    } catch { setErrorMsg('Could not create account. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const getStrengthColor = () => strengthScore <= 2 ? 'bg-error' : strengthScore <= 4 ? 'bg-amber-500' : 'bg-success';
  const getStrengthText = () => strengthScore === 0 ? '' : strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Medium' : 'Strong & Secure';

  // ── Community data ────────────────────────────────────────────────────────
  const totalMembers = EARLY_ADOPTERS.length + realUsers.length + 1; // +1 for demo (ujjwal)
  const recentRealUsers = realUsers.slice(-4).map((u, i) => ({
    initials: u.slice(0, 2).toUpperCase(),
    display: maskUsername(u),
    car: 'EV Owner',
    savings: '',
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));
  const communityList = [...EARLY_ADOPTERS, ...recentRealUsers];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-10 relative overflow-hidden font-sans gap-5">

      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

      {/* ── Social Proof Banner ─────────────────────────────────────────────── */}
      <div className="w-full max-w-md z-10">
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl px-5 py-4 space-y-3">

          {/* Headline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-on-surface">
                  <span className="text-primary">{totalMembers}</span> EV owners saving with Volt
                </p>
                <p className="text-[10px] text-on-surface-variant/70 font-medium">
                  ₹2.4L+ saved collectively this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[9px] font-bold text-secondary uppercase tracking-wide">Live</span>
            </div>
          </div>

          {/* Avatar stack + names */}
          <div className="flex items-center gap-3">
            {/* Overlapping avatars */}
            <div className="flex -space-x-2 shrink-0">
              {communityList.slice(0, 8).map((m, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${m.color} border-2 border-surface-container flex items-center justify-center text-[9px] font-black text-white shadow-sm`}
                  title={m.display}
                >
                  {m.initials}
                </div>
              ))}
              {communityList.length > 8 && (
                <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container flex items-center justify-center text-[9px] font-bold text-on-surface-variant">
                  +{communityList.length - 8}
                </div>
              )}
            </div>

            {/* Scrolling names */}
            <div className="overflow-hidden flex-1 relative">
              <div className="flex gap-3 animate-scroll-x whitespace-nowrap">
                {[...communityList, ...communityList].map((m, i) => (
                  <span key={i} className="text-[10px] text-on-surface-variant font-medium shrink-0">
                    <span className="text-on-surface font-semibold">{m.display}</span>
                    {m.car !== 'EV Owner' && <span className="text-primary/70"> · {m.car}</span>}
                    {m.savings && <span className="text-secondary font-bold"> {m.savings}</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/10">
            {[
              { label: 'Avg. Monthly Savings', value: '₹8,400' },
              { label: 'Petrol Avoided', value: '12,000 L' },
              { label: 'CO₂ Reduced', value: '28.4 t' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-mono text-xs font-bold text-primary">{stat.value}</p>
                <p className="text-[9px] text-on-surface-variant/70 font-medium leading-tight mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Login / Register Card ──────────────────────────────────────────────── */}
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl p-8 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7 select-none">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary/20 mb-3 shadow-inner">
            <Zap className="w-6 h-6 text-primary fill-none" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Volt</h1>
          <p className="text-xs text-on-surface-variant/80 mt-1 uppercase tracking-widest font-bold">
            EV Savings Tracker
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-error/10 border border-error/25 text-error rounded-xl flex items-center gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-success/10 border border-success/25 text-success rounded-xl flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegistering ? 'Create a secure password' : 'Enter your password'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-11 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60 hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Registration extras */}
          {isRegistering && (
            <>
              <div className="space-y-1.5 animate-fade-in duration-200">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 animate-fade-in duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/80 font-bold">Password Strength</span>
                  {strengthScore > 0 && (
                    <span className="font-extrabold uppercase tracking-wide text-primary text-[11px]">{getStrengthText()}</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1,2,3,4,5].map(level => (
                    <div key={level} className={`h-1.5 rounded-full transition-all duration-300 ${level <= strengthScore ? getStrengthColor() : 'bg-outline-variant/20'}`} />
                  ))}
                </div>
                <div className="bg-surface-container/50 border border-outline-variant/10 rounded-xl p-3 space-y-2 text-[11px] font-medium text-on-surface-variant">
                  <p className="font-bold text-on-surface text-[10px] uppercase tracking-wider mb-1">Security Requirements</p>
                  {[
                    { key: 'length' as const, label: 'Minimum 8 characters' },
                    { key: 'uppercase' as const, label: 'At least 1 uppercase letter (A–Z)' },
                    { key: 'lowercase' as const, label: 'At least 1 lowercase letter (a–z)' },
                    { key: 'number' as const, label: 'At least 1 number (0–9)' },
                    { key: 'special' as const, label: 'At least 1 special character (!@#$…)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      {passRules[key]
                        ? <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        : <X className="w-3.5 h-3.5 text-on-surface-variant/40 flex-shrink-0" />
                      }
                      <span className={passRules[key] ? 'text-success font-semibold' : ''}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/95 disabled:opacity-60 disabled:cursor-not-allowed text-on-primary font-extrabold rounded-xl py-3 px-4 text-sm tracking-wide shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase block cursor-pointer"
          >
            {isSubmitting
              ? (isRegistering ? 'Creating account…' : 'Signing in…')
              : (isRegistering ? 'Create Secure Account' : 'Sign In Securely')}
          </button>
        </form>

        {/* ── Demo Account Section ─────────────────────────────────────────── */}
        {!isRegistering && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Try Demo Account</p>
              <span className="ml-auto text-[9px] font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">Pre-loaded Data</span>
            </div>

            {/* Credentials display */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5">
                <p className="text-on-surface-variant/60 font-bold uppercase tracking-wider text-[9px]">Username</p>
                <p className="font-mono font-bold text-primary">ujjwal</p>
              </div>
              <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5 relative">
                <p className="text-on-surface-variant/60 font-bold uppercase tracking-wider text-[9px]">Password</p>
                <p className="font-mono font-bold text-primary">
                  {showDemoPass ? 'Password@123' : '••••••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDemoPass(!showDemoPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary cursor-pointer"
                >
                  {showDemoPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-extrabold rounded-xl py-2.5 text-xs uppercase tracking-wide hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Launch Demo — See Your Potential Savings
            </button>
          </div>
        )}

        {/* Toggle mode */}
        <div className="mt-6 border-t border-outline-variant/20 pt-5 text-center text-xs">
          <span className="text-on-surface-variant">
            {isRegistering ? 'Already have an account?' : 'New to Volt?'}{' '}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:text-primary/90 font-extrabold focus:outline-none cursor-pointer transition-all border-b border-transparent hover:border-primary/50 ml-1 pb-0.5"
          >
            {isRegistering ? 'Sign In' : 'Create Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
