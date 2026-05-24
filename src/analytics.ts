// src/analytics.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Dynamically inject the GA4 script only when a Measurement ID is configured.
// Falls back to console.debug in dev mode so events are always observable.
if (MEASUREMENT_ID && typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  // Must use a regular function (not arrow) so `arguments` is available.
  (window as any).gtag = function () {
    ((window as any).dataLayer).push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', MEASUREMENT_ID, { send_page_view: false });
}

// ── Core dispatcher ────────────────────────────────────────────────────────────
function track(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params ?? {});
  } else if (import.meta.env.DEV) {
    console.debug(`[Volt Analytics] ${eventName}`, params ?? {});
  }
}

// ── Typed event helpers ────────────────────────────────────────────────────────
export function trackSignUp(): void {
  track('sign_up', { method: 'email' });
}

export function trackLogin(method: 'email' | 'demo' = 'email'): void {
  track('login', { method });
}

export function trackScreenView(screenName: string): void {
  track('screen_view', { screen_name: screenName });
}

export function trackOnboardingComplete(): void {
  track('onboarding_complete');
}

export function trackVehicleAdded(brand: string, model: string): void {
  track('vehicle_added', { vehicle_brand: brand, vehicle_model: model });
}

export function trackVehicleDeleted(): void {
  track('vehicle_deleted');
}

export function trackSessionLogged(params: {
  type: string;
  isSolar: boolean;
  energyKwh: number;
  hasCost: boolean;
}): void {
  track('charging_session_logged', {
    session_type: params.type,
    is_solar: params.isSolar,
    energy_kwh: Math.round(params.energyKwh * 10) / 10,
    has_cost: params.hasCost,
  });
}

export function trackSessionDeleted(): void {
  track('session_deleted');
}

export function trackTimelineChanged(timeline: '3_months' | '6_months' | '1_year'): void {
  track('timeline_changed', { timeline });
}

export function trackDataCleared(): void {
  track('user_data_cleared');
}
