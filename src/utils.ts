import { ChargingSession, CostAssumptions, Vehicle } from './types';

// ─── Historical Baseline Types ────────────────────────────────────────────────
// Demo (ujjwal) carries pre-accumulated lifetime data to simulate years of use.
// Real new users start from absolute zero — no faked history.
export interface HistoricalBase {
  savings: number;       // ₹ already accumulated (lifetime)
  petrolLiters: number;  // Liters of petrol avoided historically
  co2Tons: number;       // Tonnes of CO2 reduced historically
  monthSavings: number;  // Baseline already-counted this-month savings
  monthCost: number;     // Baseline already-counted this-month charging cost
  monthKwh: number;      // Baseline already-counted this-month kWh
}

export const DEMO_HISTORICAL: HistoricalBase = {
  savings: 98500,
  petrolLiters: 1450,
  co2Tons: 3.5,
  monthSavings: 12400,
  monthCost: 1550,
  monthKwh: 180,
};

export const EMPTY_HISTORICAL: HistoricalBase = {
  savings: 0,
  petrolLiters: 0,
  co2Tons: 0,
  monthSavings: 0,
  monthCost: 0,
  monthKwh: 0,
};

// ─── Session-Level Metrics ────────────────────────────────────────────────────

export interface SessionMetrics {
  calculatedSavings: number;
  petrolAvoidedLiters: number;
  co2SavedKg: number;
  estimatedKmAdded: number;
}

export function calculateSessionMetrics(
  session: ChargingSession,
  vehicle: Vehicle,
  config: CostAssumptions
): SessionMetrics {
  if (session.energyKwh <= 0) {
    return { calculatedSavings: 0, petrolAvoidedLiters: 0, co2SavedKg: 0, estimatedKmAdded: 0 };
  }

  // kWh → km (efficiency is stored in Wh/km, divide by 1000 to get kWh/km)
  const kwhPerKm = vehicle.efficiency / 1000;
  const estimatedKmAdded = kwhPerKm > 0 ? session.energyKwh / kwhPerKm : 0;

  // Petrol equivalent cost for those kilometres
  const petrolAvoidedLiters = estimatedKmAdded * (config.petrolLitersPer100km / 100);
  const petrolCostAvoided = petrolAvoidedLiters * config.fuelPricePerLiter;

  // Actual electricity cost — solar = ₹0, otherwise use session cost or config rate
  const electricityRate = session.isSolar ? 0 : config.electricityPricePerKwh;
  const billingCost = session.cost > 0 ? session.cost : session.energyKwh * electricityRate;

  const calculatedSavings = petrolCostAvoided - billingCost;

  // CO2 in grams → kg
  const co2SavedKg = (estimatedKmAdded * config.co2EmissionsGPerKm) / 1000;

  return {
    calculatedSavings: Math.max(-billingCost, calculatedSavings),
    petrolAvoidedLiters,
    co2SavedKg,
    estimatedKmAdded,
  };
}

// ─── Lifetime Aggregate Metrics ───────────────────────────────────────────────

export interface AppLifetimeMetrics {
  lifetimeSavings: number;
  petrolAvoidedLiters: number;
  co2ReducedTons: number;
  thisMonthSavings: number;
  thisMonthChargingCost: number;
  thisMonthKwh: number;
  totalEvKm: number;
}

export function calculateLifetimeMetrics(
  sessions: ChargingSession[],
  vehicles: Vehicle[],
  config: CostAssumptions,
  historical: HistoricalBase = EMPTY_HISTORICAL
): AppLifetimeMetrics {
  let extraSavings = 0;
  let extraPetrol = 0;
  let extraCo2Kg = 0;
  let extraEvKm = 0;

  let monthSavings = 0;
  let monthCost = 0;
  let monthKwh = 0;

  // Determine current year+month once for the entire loop
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthPad = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthPrefix = `${currentYear}-${currentMonthPad}-`;

  sessions.forEach(session => {
    const v = vehicles.find(veh => veh.id === session.vehicleId) || vehicles[0];
    if (!v) return;

    const metrics = calculateSessionMetrics(session, v, config);

    extraSavings += metrics.calculatedSavings;
    extraPetrol += metrics.petrolAvoidedLiters;
    extraCo2Kg += metrics.co2SavedKg;
    extraEvKm += metrics.estimatedKmAdded;

    // Only count sessions in the actual current calendar month
    if (session.date.startsWith(currentMonthPrefix)) {
      monthSavings += metrics.calculatedSavings;
      monthCost += session.cost;
      monthKwh += session.energyKwh;
    }
  });

  return {
    lifetimeSavings: historical.savings + extraSavings,
    petrolAvoidedLiters: Math.round(historical.petrolLiters + extraPetrol),
    co2ReducedTons: parseFloat((historical.co2Tons + extraCo2Kg / 1000).toFixed(1)),
    thisMonthSavings: historical.monthSavings + monthSavings,
    thisMonthChargingCost: historical.monthCost + monthCost,
    thisMonthKwh: historical.monthKwh + monthKwh,
    totalEvKm: Math.round(extraEvKm), // Always derived from real session data
  };
}

// ─── Chart Data Generator ─────────────────────────────────────────────────────
// Builds month-by-month accumulated savings from actual session data.
// Used for non-demo users; demo users use the pre-seeded CHART_DATA_6M.

export interface ChartPoint {
  month: string;
  savings: number;
  kwh: number;
}

export function generateChartFromSessions(
  sessions: ChargingSession[],
  vehicles: Vehicle[],
  config: CostAssumptions
): ChartPoint[] {
  if (sessions.length === 0) return [];

  // Accumulate per YYYY-MM bucket
  const buckets = new Map<string, { savings: number; kwh: number }>();

  sessions.forEach(session => {
    const v = vehicles.find(veh => veh.id === session.vehicleId) || vehicles[0];
    if (!v) return;

    const key = session.date.substring(0, 7); // "YYYY-MM"
    const metrics = calculateSessionMetrics(session, v, config);
    const existing = buckets.get(key) ?? { savings: 0, kwh: 0 };
    buckets.set(key, {
      savings: existing.savings + metrics.calculatedSavings,
      kwh: existing.kwh + session.energyKwh,
    });
  });

  // Sort chronologically and format month label
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1, 1)
        .toLocaleString('en', { month: 'short' });
      return {
        month: label,
        savings: Math.round(data.savings),
        kwh: Math.round(data.kwh),
      };
    });
}
