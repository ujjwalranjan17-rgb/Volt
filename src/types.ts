export interface Vehicle {
  id: string;
  brand: string; // e.g., 'Tesla', 'Tata', 'MG', 'Hyundai'
  model: string; // e.g., 'Model 3', 'Nexon EV', 'Comet EV'
  trim: string;  // e.g., 'Long Range Dual Motor'
  image: string; // Image URL
  statusText: string; // e.g., 'Smart Urban Electric'
  range: number; // Est. Range in km
  batteryCapacity: number; // in kWh
  batterySoC: number; // in %
  efficiency: number; // Wh/km
  odometer: number; // total distance in km
}

export interface ChargingSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  energyKwh: number;
  cost: number;
  isSolar: boolean;
  vehicleId: string;
  type: 'home' | 'commute' | 'supercharger' | 'other';
  notes?: string;
  odometerReading?: number; // Captured odometer reading in km
}

export interface CostAssumptions {
  fuelPricePerLiter: number;     // e.g., $1.95 / L
  electricityPricePerKwh: number; // e.g., $0.15 / kWh
  petrolLitersPer100km: number;   // e.g., 7.5 L / 100km (average ICE car efficiency)
  co2EmissionsGPerKm: number;    // e.g., 120 g / km (average ICE vehicle CO2 emission)
}
