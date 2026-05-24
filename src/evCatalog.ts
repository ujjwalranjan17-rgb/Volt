// ─── India EV Catalog ────────────────────────────────────────────────────────
// Comprehensive list of electric cars available/announced in India (2024-2026).
// Specs: range (km, WLTP or ARAI), batteryCapacity (kWh), efficiency (Wh/km).

export interface EVSpec {
  model: string;
  trim: string;
  range: number;
  batteryCapacity: number;
  efficiency: number; // Wh/km
}

export const EV_CATALOG: Record<string, EVSpec[]> = {
  'Tata': [
    { model: 'Nexon EV',            trim: 'Medium Range',                range: 312, batteryCapacity: 40.5, efficiency: 135 },
    { model: 'Nexon EV Max',        trim: 'Long Range',                  range: 437, batteryCapacity: 40.5, efficiency: 130 },
    { model: 'Punch EV',            trim: 'Long Range Creative+',        range: 421, batteryCapacity: 35,   efficiency: 130 },
    { model: 'Punch EV',            trim: 'Medium Range',                range: 315, batteryCapacity: 25,   efficiency: 118 },
    { model: 'Tiago EV',            trim: 'Long Range XZ+ Tech Lux',     range: 315, batteryCapacity: 24,   efficiency: 106 },
    { model: 'Tigor EV',            trim: 'XZ+ Long Range',              range: 306, batteryCapacity: 26,   efficiency: 108 },
    { model: 'Curvv EV',            trim: 'Long Range Empowered+',       range: 502, batteryCapacity: 55,   efficiency: 128 },
    { model: 'Harrier EV',          trim: 'Long Range AWD',              range: 500, batteryCapacity: 60,   efficiency: 145 },
  ],
  'Mahindra': [
    { model: 'XUV400 EC',           trim: 'Pro',                         range: 456, batteryCapacity: 39.4, efficiency: 140 },
    { model: 'XUV400 EL',           trim: 'Pro DC Fast Charge',          range: 456, batteryCapacity: 39.4, efficiency: 138 },
    { model: 'BE 6e',               trim: 'Pack One AWD',                range: 556, batteryCapacity: 59,   efficiency: 145 },
    { model: 'XEV 9e',              trim: 'Standard Range',              range: 542, batteryCapacity: 59,   efficiency: 148 },
    { model: 'XEV 9e',              trim: 'Long Range AWD',              range: 656, batteryCapacity: 79,   efficiency: 148 },
  ],
  'MG': [
    { model: 'ZS EV',               trim: 'Excite Pro',                  range: 461, batteryCapacity: 50.3, efficiency: 155 },
    { model: 'Comet EV',            trim: 'Pace',                        range: 230, batteryCapacity: 17.3, efficiency:  95 },
    { model: 'Windsor EV',          trim: 'Excite',                      range: 331, batteryCapacity: 38,   efficiency: 140 },
    { model: 'Windsor EV',          trim: 'Exclusive Pro',               range: 331, batteryCapacity: 38,   efficiency: 138 },
    { model: 'MG 4 EV',             trim: 'Excite 64',                   range: 520, batteryCapacity: 64,   efficiency: 155 },
    { model: 'MG Cloud EV',         trim: 'Exclusive',                   range: 530, batteryCapacity: 50.6, efficiency: 150 },
  ],
  'Hyundai': [
    { model: 'Creta Electric',      trim: 'Long Range Executive',        range: 473, batteryCapacity: 51.4, efficiency: 148 },
    { model: 'Creta Electric',      trim: 'Standard Range Smart',        range: 390, batteryCapacity: 42,   efficiency: 152 },
    { model: 'Ioniq 5',             trim: 'Standard Range',              range: 631, batteryCapacity: 72.6, efficiency: 155 },
    { model: 'Ioniq 5',             trim: 'Long Range AWD',              range: 631, batteryCapacity: 77.4, efficiency: 148 },
    { model: 'Ioniq 6',             trim: 'Long Range RWD',              range: 614, batteryCapacity: 77.4, efficiency: 145 },
    { model: 'Kona Electric',       trim: 'Knight Edition',              range: 452, batteryCapacity: 39.2, efficiency: 145 },
  ],
  'Kia': [
    { model: 'EV6',                 trim: 'Standard Range RWD',          range: 528, batteryCapacity: 74,   efficiency: 155 },
    { model: 'EV6',                 trim: 'GT-Line Long Range RWD',      range: 708, batteryCapacity: 77.4, efficiency: 155 },
    { model: 'EV6 GT',              trim: 'AWD Performance',             range: 585, batteryCapacity: 77.4, efficiency: 185 },
    { model: 'EV9',                 trim: 'Standard Range RWD',          range: 561, batteryCapacity: 99.8, efficiency: 185 },
    { model: 'EV9',                 trim: 'GT-Line AWD',                 range: 505, batteryCapacity: 99.8, efficiency: 195 },
  ],
  'BYD': [
    { model: 'Atto 3',              trim: 'Extended Range',              range: 521, batteryCapacity: 60.48, efficiency: 148 },
    { model: 'Seal',                trim: 'Dynamic RWD',                 range: 650, batteryCapacity: 82.56, efficiency: 155 },
    { model: 'Seal',                trim: 'Premium AWD',                 range: 570, batteryCapacity: 82.56, efficiency: 172 },
    { model: 'e6',                  trim: 'MPV Premium',                 range: 520, batteryCapacity: 71.7,  efficiency: 168 },
  ],
  'BMW': [
    { model: 'iX1 xDrive30',        trim: 'M Sport',                     range: 438, batteryCapacity: 66.5, efficiency: 175 },
    { model: 'i4 eDrive40',         trim: 'M Sport',                     range: 590, batteryCapacity: 83.9, efficiency: 178 },
    { model: 'i4 M50',              trim: 'Gran Coupé',                  range: 510, batteryCapacity: 83.9, efficiency: 195 },
    { model: 'iX xDrive50',         trim: 'Sport',                       range: 630, batteryCapacity: 111.5, efficiency: 185 },
    { model: 'iX M60',              trim: 'M Performance',               range: 564, batteryCapacity: 111.5, efficiency: 215 },
    { model: 'i5 eDrive40',         trim: 'M Sport',                     range: 582, batteryCapacity: 84,   efficiency: 175 },
    { model: 'i7 xDrive60',         trim: 'Excellence',                  range: 625, batteryCapacity: 101.7, efficiency: 185 },
  ],
  'Mercedes-Benz': [
    { model: 'EQA 250+',            trim: 'AMG Line',                    range: 426, batteryCapacity: 66.5, efficiency: 175 },
    { model: 'EQB 350 4MATIC',      trim: 'AMG Line',                    range: 419, batteryCapacity: 66.5, efficiency: 185 },
    { model: 'EQE 350+',            trim: 'AMG Line',                    range: 617, batteryCapacity: 90.6, efficiency: 175 },
    { model: 'EQS 450+',            trim: 'AMG Line',                    range: 857, batteryCapacity: 107.8, efficiency: 165 },
    { model: 'EQS 580 4MATIC',      trim: 'AMG Line',                    range: 770, batteryCapacity: 107.8, efficiency: 178 },
  ],
  'Audi': [
    { model: 'e-tron 55 quattro',           trim: 'Technology Pack',     range: 484, batteryCapacity: 95,   efficiency: 210 },
    { model: 'e-tron Sportback 55 quattro', trim: 'Technology Pack',     range: 484, batteryCapacity: 95,   efficiency: 210 },
    { model: 'Q8 e-tron 55 quattro',        trim: 'S Line',              range: 600, batteryCapacity: 114,  efficiency: 210 },
    { model: 'e-tron GT',                   trim: 'quattro',             range: 488, batteryCapacity: 93.4, efficiency: 235 },
    { model: 'RS e-tron GT',                trim: 'Performance',         range: 472, batteryCapacity: 93.4, efficiency: 250 },
  ],
  'Volvo': [
    { model: 'XC40 Recharge',       trim: 'Twin Motor AWD',              range: 418, batteryCapacity: 78,   efficiency: 210 },
    { model: 'C40 Recharge',        trim: 'Twin Motor AWD',              range: 437, batteryCapacity: 78,   efficiency: 205 },
    { model: 'EX40',                trim: 'Extended Range Single Motor', range: 475, batteryCapacity: 69,   efficiency: 195 },
    { model: 'EX90',                trim: 'Twin Motor AWD',              range: 600, batteryCapacity: 111,  efficiency: 210 },
  ],
  'Porsche': [
    { model: 'Taycan',              trim: 'Standard Range',              range: 484, batteryCapacity: 93.4, efficiency: 225 },
    { model: 'Taycan 4S',           trim: 'Performance Battery Plus',    range: 464, batteryCapacity: 93.4, efficiency: 235 },
    { model: 'Taycan GTS',          trim: 'Sport Turismo',               range: 435, batteryCapacity: 93.4, efficiency: 248 },
    { model: 'Taycan Turbo',        trim: 'Performance',                 range: 435, batteryCapacity: 105,  efficiency: 265 },
  ],
  'Tesla': [
    { model: 'Model Y',             trim: 'Standard Range',              range: 440, batteryCapacity: 57.5, efficiency: 145 },
    { model: 'Model Y',             trim: 'Long Range AWD',              range: 533, batteryCapacity: 75,   efficiency: 155 },
    { model: 'Model Y',             trim: 'Performance AWD',             range: 514, batteryCapacity: 75,   efficiency: 165 },
    { model: 'Model 3',             trim: 'Standard Range Plus',         range: 491, batteryCapacity: 57.5, efficiency: 138 },
    { model: 'Model S',             trim: 'Long Range AWD',              range: 634, batteryCapacity: 100,  efficiency: 175 },
    { model: 'Model X',             trim: 'Long Range AWD',              range: 580, batteryCapacity: 100,  efficiency: 200 },
  ],
  'Mini': [
    { model: 'Cooper SE',           trim: '3-Door Classic',              range: 225, batteryCapacity: 32.6, efficiency: 175 },
    { model: 'Aceman E',            trim: 'Classic',                     range: 300, batteryCapacity: 42.5, efficiency: 175 },
  ],
  'Citroen': [
    { model: 'eC3',                 trim: 'Feel Pack',                   range: 320, batteryCapacity: 29.2, efficiency: 112 },
  ],
  'Nissan': [
    { model: 'Leaf',                trim: 'e+ Tekna',                    range: 385, batteryCapacity: 62,   efficiency: 185 },
    { model: 'Ariya',               trim: 'Engage e-4ORCE',              range: 500, batteryCapacity: 87,   efficiency: 195 },
  ],
  'Lexus': [
    { model: 'UX 300e',             trim: 'Luxury',                      range: 450, batteryCapacity: 72.8, efficiency: 185 },
    { model: 'RZ 450e',             trim: 'Premium AWD',                 range: 440, batteryCapacity: 71.4, efficiency: 195 },
  ],
  'Jaguar': [
    { model: 'I-PACE',              trim: 'SE AWD',                      range: 470, batteryCapacity: 90,   efficiency: 230 },
  ],
};

export const EV_BRANDS = Object.keys(EV_CATALOG).sort();
