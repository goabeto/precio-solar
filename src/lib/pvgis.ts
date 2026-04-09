// PVGIS API client — EU's Photovoltaic Geographical Information System
// https://re.jrc.ec.europa.eu/api/v5_3/

const PVGIS_BASE = "https://re.jrc.ec.europa.eu/api/v5_3";

export interface PVGISResult {
  annualKwhPer1kWp: number;
  monthlyKwh: number[];
  optimalTilt: number;
  optimalAzimuth: number;
}

export async function getPVGISData(
  lat: number,
  lon: number
): Promise<PVGISResult | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      peakpower: "1",
      loss: "20",
      outputformat: "json",
      pvtechchoice: "crystSi",
      mountingplace: "building",
    });

    const res = await fetch(`${PVGIS_BASE}/PVcalc?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const outputs = data?.outputs;
    if (!outputs) return null;

    const totals = outputs.totals?.fixed;
    const monthly = outputs.monthly?.fixed || [];

    return {
      annualKwhPer1kWp: totals?.E_y || 0,
      monthlyKwh: monthly.map((m: { E_m: number }) => m.E_m),
      optimalTilt: data.inputs?.mounting_system?.fixed?.slope?.value || 35,
      optimalAzimuth: data.inputs?.mounting_system?.fixed?.azimuth?.value || 0,
    };
  } catch {
    return null;
  }
}

// Regional fallback: Peak Sun Hours (PSH) for Spain
// Used when PVGIS API is unavailable
const REGIONAL_PSH: Record<string, number> = {
  // South
  "Andalucía": 5.5,
  "Murcia": 5.3,
  "Canarias": 5.4,
  "Extremadura": 5.2,
  // Central
  "Madrid": 5.0,
  "Castilla-La Mancha": 5.1,
  "Castilla y León": 4.7,
  "Aragón": 4.8,
  "La Rioja": 4.5,
  "Navarra": 4.3,
  // Mediterranean
  "Cataluña": 4.8,
  "Comunidad Valenciana": 5.0,
  "Islas Baleares": 5.1,
  // North
  "País Vasco": 3.8,
  "Cantabria": 3.7,
  "Asturias": 3.6,
  "Galicia": 3.8,
};

export function getFallbackAnnualKwh(region: string): number {
  const psh = REGIONAL_PSH[region] || 4.8; // Default to Mediterranean average
  // Annual kWh per 1 kWp = PSH * 365 * (1 - losses)
  // losses = 20% (same as PVGIS param)
  return psh * 365 * 0.8;
}
