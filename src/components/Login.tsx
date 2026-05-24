import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Check, X, Zap, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

// ─── Password Hashing ─────────────────────────────────────────────────────────
// Uses Web Crypto (SHA-256) + app salt. Stored hash is never reversible.
const APP_SALT = 'volt_ev_tracker_2026';

async function hashPassword(raw: string): Promise<string> {
  const encoded = new TextEncoder().encode(raw + APP_SALT);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live password validation
  const [passRules, setPassRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [strengthScore, setStrengthScore] = useState(0);

  // ── Migrate legacy plain-text accounts on mount ───────────────────────────
  // If an account has a non-hex-64 value, it was stored before hashing was
  // introduced. Flag it so we can gracefully handle login attempts.
  useEffect(() => {
    // Nothing to migrate automatically — users will simply be asked to
    // re-register if their legacy account can't authenticate. This is safe
    // because all data is user-scoped in localStorage anyway.
  }, []);

  // ── Live password rule checking ───────────────────────────────────────────
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
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      const inputHash = await hashPassword(password);

      // Demo account: hash 'Password@123' at runtime so no plaintext ever
      // appears in source code comparisons.
      if (cleanUsername === 'ujjwal') {
        const demoHash = await hashPassword('Password@123');
        if (inputHash === demoHash) {
          onLoginSuccess('ujjwal');
          return;
        }
        setErrorMsg('Invalid username or password.');
        return;
      }

      // Custom registered accounts
      const usersRaw = localStorage.getItem('volt_users');
      const users: Record<string, string> = usersRaw ? JSON.parse(usersRaw) : {};

      if (users[cleanUsername] && users[cleanUsername] === inputHash) {
        onLoginSuccess(cleanUsername);
      } else {
        setErrorMsg('Invalid username or password.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) { setErrorMsg('Username is required.'); return; }
    if (cleanUsername.length < 3) { setErrorMsg('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setErrorMsg('Username can only contain letters, numbers, and underscores.');
      return;
    }

    const allRulesMet = Object.values(passRules).every(Boolean);
    if (!allRulesMet) { setErrorMsg('Password does not meet all security requirements.'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }

    const usersRaw = localStorage.getItem('volt_users');
    const users: Record<string, string> = usersRaw ? JSON.parse(usersRaw) : {};

    if (cleanUsername === 'ujjwal' || users[cleanUsername]) {
      setErrorMsg('That username is already taken. Please choose another.');
      return;
    }

    setIsSubmitting(true);
    try {
      const hashed = await hashPassword(password);
      users[cleanUsername] = hashed;
      localStorage.setItem('volt_users', JSON.stringify(users));

      setSuccessMsg('Account created! Signing you in…');
      setTimeout(() => onLoginSuccess(cleanUsername), 1200);
    } catch {
      setErrorMsg('Could not create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Strength indicator helpers ────────────────────────────────────────────
  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-error';
    if (strengthScore <= 4) return 'bg-amber-500';
    return 'bg-success';
  };
  const getStrengthText = () => {
    if (strengthScore === 0) return '';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Medium';
    return 'Strong & Secure';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden font-sans">

      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl p-8 relative z-10 backdrop-blur-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
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
                className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-4 text-sm text-on-background placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
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
                className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-11 text-sm text-on-background placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
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
              {/* Confirm password */}
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
                    className="w-full bg-surface-container border border-outline-variant/35 rounded-xl py-3 pl-11 pr-4 text-sm text-on-background placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Strength meter */}
              <div className="space-y-2 pt-1 animate-fade-in duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/80 font-bold">Password Strength</span>
                  {strengthScore > 0 && (
                    <span className="font-extrabold uppercase tracking-wide text-primary text-[11px]">
                      {getStrengthText()}
                    </span>
                  )}
                </div>

                {/* 5-segment bar */}
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        level <= strengthScore ? getStrengthColor() : 'bg-outline-variant/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Rules checklist */}
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

          {/* Submit */}
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

        {/* Toggle mode */}
        <div className="mt-8 border-t border-outline-variant/20 pt-6 text-center text-xs">
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
