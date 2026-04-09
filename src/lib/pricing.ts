// Solar system pricing logic using reference data from SotySolar + market research

export interface ReferencePricing {
  system_size_kwp: number;
  price_min: number;
  price_max: number;
  price_avg: number;
  includes_battery: boolean;
}

// Fallback pricing when DB is unavailable
const FALLBACK_PRICING: ReferencePricing[] = [
  { system_size_kwp: 3.0, price_min: 4200, price_max: 5400, price_avg: 4800, includes_battery: false },
  { system_size_kwp: 3.66, price_min: 5100, price_max: 5600, price_avg: 5350, includes_battery: false },
  { system_size_kwp: 4.8, price_min: 5700, price_max: 9100, price_avg: 6700, includes_battery: false },
  { system_size_kwp: 5.49, price_min: 7500, price_max: 8900, price_avg: 8200, includes_battery: false },
  { system_size_kwp: 6.0, price_min: 6600, price_max: 10700, price_avg: 8400, includes_battery: false },
  { system_size_kwp: 7.26, price_min: 7800, price_max: 8200, price_avg: 8000, includes_battery: false },
  { system_size_kwp: 7.32, price_min: 7900, price_max: 8200, price_avg: 8050, includes_battery: false },
  { system_size_kwp: 10.0, price_min: 10500, price_max: 13500, price_avg: 12000, includes_battery: false },
];

// Standard system sizes (kWp) — common configurations in Spain
export const STANDARD_SIZES = [3.0, 3.66, 4.8, 5.49, 6.0, 7.26, 7.32, 10.0];

const PANEL_WATT = 450; // Standard panel wattage (2025-2026 market)
const ELECTRICITY_PRICE = 0.24; // €/kWh average in Spain

export function roundToStandardSize(kwp: number): number {
  // Find the closest standard size that's >= the calculated size
  const larger = STANDARD_SIZES.find((s) => s >= kwp);
  if (larger) return larger;
  return STANDARD_SIZES[STANDARD_SIZES.length - 1];
}

export function calculatePanelCount(kwp: number): number {
  return Math.ceil((kwp * 1000) / PANEL_WATT);
}

export function estimatePrice(
  kwp: number,
  referencePricing: ReferencePricing[],
  includeBattery: boolean
): { min: number; max: number; avg: number } {
  const data = referencePricing.length > 0 ? referencePricing : FALLBACK_PRICING;
  const filtered = data.filter((r) => r.includes_battery === includeBattery);

  // Find closest match
  let closest = filtered[0];
  let minDiff = Math.abs(filtered[0].system_size_kwp - kwp);

  for (const ref of filtered) {
    const diff = Math.abs(ref.system_size_kwp - kwp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ref;
    }
  }

  // If exact match, use it directly
  if (minDiff < 0.1) {
    return { min: closest.price_min, max: closest.price_max, avg: closest.price_avg };
  }

  // Interpolate using €/kWp from closest reference
  const euroPerKwp = closest.price_avg / closest.system_size_kwp;
  const avg = Math.round(euroPerKwp * kwp);
  const spread = (closest.price_max - closest.price_min) / closest.price_avg;
  const min = Math.round(avg * (1 - spread / 2));
  const max = Math.round(avg * (1 + spread / 2));

  return { min, max, avg };
}

export function calculateSavings(
  annualProductionKwh: number,
  includeBattery: boolean
): { annualSaving: number; monthlySaving: number } {
  const selfConsumption = includeBattery ? 0.65 : 0.35;
  const annualSaving = Math.round(
    annualProductionKwh * selfConsumption * ELECTRICITY_PRICE
  );
  return {
    annualSaving,
    monthlySaving: Math.round(annualSaving / 12),
  };
}

export function calculatePayback(
  netCost: number,
  annualSaving: number
): number {
  if (annualSaving <= 0) return 99;
  return Math.round((netCost / annualSaving) * 10) / 10;
}

export function calculateMonthlyLoanPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate <= 0) return Math.round(principal / months);
  const r = annualRate / 100 / 12;
  const payment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(payment * 100) / 100;
}

export function annualKwhToMonthlyBill(annualKwh: number): number {
  return Math.round((annualKwh / 12) * ELECTRICITY_PRICE);
}

export function monthlyBillToAnnualKwh(monthlyBill: number): number {
  return Math.round((monthlyBill / ELECTRICITY_PRICE) * 12);
}
