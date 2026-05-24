import { Vehicle, ChargingSession, CostAssumptions } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'tata-nexon',
    brand: 'Tata',
    model: 'Nexon EV',
    trim: 'Empowering Green Mobility',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc3P10Pz7obg5vaNiZzt1Rj0CBt0gzv3whgs3OOBHK7smxCx6UlzF7xL-Dox281JrxQ4lM0zv-brYb5qZUhz6KOdD_WNMq4el8f0-IfK7mbMjFG6BAIjKuPAoe35f8YnU8p4FIuAS-GNCkbA6qDJWjM_2SXRvjlYiYHslGxdKYq_3H5i-DXgNAkVJfHFPHsmXMs8Vx5cW8mLg1P_GHeb1RuGxxcXpgmu2DRhQIIRWeOVj0vjuz-Ufncp65IgE2s0ZQ4APofLULqtOi',
    statusText: 'Ziptron High Voltage Tech',
    range: 312,
    batteryCapacity: 40.5,
    batterySoC: 78,
    efficiency: 135, // Wh/km
    odometer: 18450
  },
  {
    id: 'mg-comet',
    brand: 'MG',
    model: 'Comet EV',
    trim: 'Smart Urban Electric',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjdXUvJmojBrzBHyIdRq9z_-NmByzmVm1HYmsdSl9mk4WCaNF4_SjtDnO1d5BDZLOnYlbSzGZc2In42imfpN4_PnaHfc_B1c8Uurb5Ek4B6TFy80l6hxZ2QVH3duYnVb6HBKldO_Ek-1HCehQ-tst_W2qhTvbS4i8H1GOM_s4LW9Iey5ssoOpH1BUobq414-Lmhj6xpSGKlg7CU10ig0dopkdScjeq6pSNsoZKf7bbw3JsKcmWqY9eQ13I7tuKjVyCgA9Ds6z2MR3M',
    statusText: 'Glow Tech Edition',
    range: 230,
    batteryCapacity: 17.3,
    batterySoC: 92,
    efficiency: 95,
    odometer: 6412
  },
  {
    id: 'mahindra-xuv400',
    brand: 'Mahindra',
    model: 'XUV400',
    trim: 'EL Pro Fast Charge',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc3P10Pz7obg5vaNiZzt1Rj0CBt0gzv3whgs3OOBHK7smxCx6UlzF7xL-Dox281JrxQ4lM0zv-brYb5qZUhz6KOdD_WNMq4el8f0-IfK7mbMjFG6BAIjKuPAoe35f8YnU8p4FIuAS-GNCkbA6qDJWjM_2SXRvjlYiYHslGxdKYq_3H5i-DXgNAkVJfHFPHsmXMs8Vx5cW8mLg1P_GHeb1RuGxxcXpgmu2DRhQIIRWeOVj0vjuz-Ufncp65IgE2s0ZQ4APofLULqtOi', // Falling back to a clean SUV view
    statusText: 'Fearless Electric Compact SUV',
    range: 396,
    batteryCapacity: 39.4,
    batterySoC: 58,
    efficiency: 140,
    odometer: 11210
  },
  {
    id: 'hyundai-ioniq',
    brand: 'Hyundai',
    model: 'Ioniq 5',
    trim: 'Dynamic Tech AWD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpJ0OEJLRm4eXKrvhqGucTJjNt-_szYOf0OWMog0ZsNRHzIiQav0wiVXQ4jP-t3fGdHUUTELNY8mQlcXMv0tva5eXN9EbZ_D3BmwgklPKNXfuogOql5oF1uzIlVIqJgOa2sBHV1fec2eVFOaR-Tj2Fhh16da44AbjvostUeZ8EljMxcUJUfL38sV_mEh4MnJYPQglCadrGFvuj2chz-4v0bFw3B_EQKQoYyBwFVWlUxU-3fCFKwSaFRGxw5ryyWGdysoxP8Y-WWdCf',
    statusText: 'E-GMP Futuristic Architecture',
    range: 480,
    batteryCapacity: 77.4,
    batterySoC: 84,
    efficiency: 158,
    odometer: 14210
  }
];

export const INITIAL_ASSUMPTIONS: CostAssumptions = {
  fuelPricePerLiter: 101.5, // INR per Liter
  electricityPricePerKwh: 7.5, // INR per kWh
  petrolLitersPer100km: 7.5,
  co2EmissionsGPerKm: 120
};

// Generates logs based on user request details
export const INITIAL_SESSIONS: ChargingSession[] = [
  {
    id: 'session-1',
    date: '2026-05-24',
    time: '08:30',
    location: 'Home Charger',
    energyKwh: 30,
    cost: 225, // 30 kWh * ₹7.5
    isSolar: false,
    vehicleId: 'tata-nexon',
    type: 'home',
    notes: 'Standard overnight top-up.',
    odometerReading: 18450
  },
  {
    id: 'session-2',
    date: '2026-05-23',
    time: '12:15',
    location: 'Office Parking Solar',
    energyKwh: 12.5,
    cost: 0,
    isSolar: true,
    vehicleId: 'tata-nexon',
    type: 'commute',
    notes: 'Green commute solar charging',
    odometerReading: 18320
  },
  {
    id: 'session-3',
    date: '2026-05-20',
    time: '18:45',
    location: 'Tata Power EZ Charge (Highway)',
    energyKwh: 35,
    cost: 595, // 35 * ₹17
    isSolar: false,
    vehicleId: 'tata-nexon',
    type: 'supercharger',
    notes: 'Fast charge session on weekend trip',
    odometerReading: 18150
  },
  {
    id: 'session-4',
    date: '2026-05-18',
    time: '14:20',
    location: 'Home Solar Grid',
    energyKwh: 22,
    cost: 0,
    isSolar: true,
    vehicleId: 'tata-nexon',
    type: 'home',
    notes: '100% clean solar generation during mid-day',
    odometerReading: 17980
  },
  {
    id: 'session-5',
    date: '2026-05-15',
    time: '19:15',
    location: 'Zeon Fast Charger',
    energyKwh: 28,
    cost: 504, // 28 * ₹18
    isSolar: false,
    vehicleId: 'tata-nexon',
    type: 'supercharger',
    notes: 'Top up',
    odometerReading: 17850
  }
];

// Historical growth points for the last 6 months chart in Indian Rupees
export interface ChartDataPoint {
  month: string;
  savings: number;
  kwh: number;
}

export const CHART_DATA_6M: ChartDataPoint[] = [
  { month: 'Dec', savings: 14500, kwh: 390 },
  { month: 'Jan', savings: 28000, kwh: 410 },
  { month: 'Feb', savings: 43200, kwh: 460 },
  { month: 'Mar', savings: 59100, kwh: 420 },
  { month: 'Apr', savings: 74600, kwh: 510 },
  { month: 'May', savings: 94500, kwh: 520 }
];
