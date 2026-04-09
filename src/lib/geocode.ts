// Geocoding: postal code → lat/lng + city + region (CCAA)
// Uses Nominatim (OpenStreetMap) — free, no API key needed

export interface GeoResult {
  lat: number;
  lon: number;
  city: string;
  region: string; // CCAA name
  province: string;
}

// Spanish CCAA mapping from province
const PROVINCE_TO_CCAA: Record<string, string> = {
  "Álava": "País Vasco", "Albacete": "Castilla-La Mancha", "Alicante": "Comunidad Valenciana",
  "Almería": "Andalucía", "Asturias": "Asturias", "Ávila": "Castilla y León",
  "Badajoz": "Extremadura", "Barcelona": "Cataluña", "Burgos": "Castilla y León",
  "Cáceres": "Extremadura", "Cádiz": "Andalucía", "Cantabria": "Cantabria",
  "Castellón": "Comunidad Valenciana", "Ciudad Real": "Castilla-La Mancha",
  "Córdoba": "Andalucía", "Cuenca": "Castilla-La Mancha", "Girona": "Cataluña",
  "Granada": "Andalucía", "Guadalajara": "Castilla-La Mancha", "Guipúzcoa": "País Vasco",
  "Huelva": "Andalucía", "Huesca": "Aragón", "Jaén": "Andalucía",
  "La Rioja": "La Rioja", "Las Palmas": "Canarias", "León": "Castilla y León",
  "Lleida": "Cataluña", "Lugo": "Galicia", "Madrid": "Madrid",
  "Málaga": "Andalucía", "Murcia": "Murcia", "Navarra": "Navarra",
  "Ourense": "Galicia", "Palencia": "Castilla y León", "Pontevedra": "Galicia",
  "Salamanca": "Castilla y León", "Santa Cruz de Tenerife": "Canarias",
  "Segovia": "Castilla y León", "Sevilla": "Andalucía", "Soria": "Castilla y León",
  "Tarragona": "Cataluña", "Teruel": "Aragón", "Toledo": "Castilla-La Mancha",
  "Valencia": "Comunidad Valenciana", "Valladolid": "Castilla y León",
  "Vizcaya": "País Vasco", "Zamora": "Castilla y León", "Zaragoza": "Aragón",
  "Ceuta": "Ceuta", "Melilla": "Melilla", "Islas Baleares": "Islas Baleares",
};

export async function geocodePostalCode(postalCode: string): Promise<GeoResult | null> {
  try {
    const params = new URLSearchParams({
      postalcode: postalCode,
      country: "es",
      format: "json",
      addressdetails: "1",
      limit: "1",
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: { "User-Agent": "SolarJourneyCalculator/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    const addr = result.address || {};
    const province = addr.province || addr.state || addr.county || "";
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    const region = PROVINCE_TO_CCAA[province] || province;

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      city,
      region,
      province,
    };
  } catch {
    return null;
  }
}

// Fallback: estimate coordinates from postal code prefix
// Spanish postal codes: first 2 digits = province code
const POSTAL_PREFIX_COORDS: Record<string, { lat: number; lon: number; province: string }> = {
  "01": { lat: 42.85, lon: -2.67, province: "Álava" },
  "02": { lat: 38.99, lon: -1.86, province: "Albacete" },
  "03": { lat: 38.35, lon: -0.48, province: "Alicante" },
  "04": { lat: 36.83, lon: -2.46, province: "Almería" },
  "05": { lat: 40.66, lon: -4.70, province: "Ávila" },
  "06": { lat: 38.88, lon: -6.97, province: "Badajoz" },
  "07": { lat: 39.57, lon: 2.65, province: "Islas Baleares" },
  "08": { lat: 41.39, lon: 2.17, province: "Barcelona" },
  "09": { lat: 42.34, lon: -3.70, province: "Burgos" },
  "10": { lat: 39.47, lon: -6.37, province: "Cáceres" },
  "11": { lat: 36.53, lon: -6.29, province: "Cádiz" },
  "12": { lat: 39.99, lon: -0.03, province: "Castellón" },
  "13": { lat: 38.99, lon: -3.93, province: "Ciudad Real" },
  "14": { lat: 37.88, lon: -4.77, province: "Córdoba" },
  "15": { lat: 43.37, lon: -8.40, province: "La Coruña" },
  "16": { lat: 40.07, lon: -2.13, province: "Cuenca" },
  "17": { lat: 41.98, lon: 2.82, province: "Girona" },
  "18": { lat: 37.18, lon: -3.60, province: "Granada" },
  "19": { lat: 40.63, lon: -3.17, province: "Guadalajara" },
  "20": { lat: 43.32, lon: -1.98, province: "Guipúzcoa" },
  "21": { lat: 37.26, lon: -6.95, province: "Huelva" },
  "22": { lat: 42.14, lon: -0.41, province: "Huesca" },
  "23": { lat: 37.77, lon: -3.79, province: "Jaén" },
  "24": { lat: 42.60, lon: -5.57, province: "León" },
  "25": { lat: 41.62, lon: 0.63, province: "Lleida" },
  "26": { lat: 42.46, lon: -2.45, province: "La Rioja" },
  "27": { lat: 43.01, lon: -7.56, province: "Lugo" },
  "28": { lat: 40.42, lon: -3.70, province: "Madrid" },
  "29": { lat: 36.72, lon: -4.42, province: "Málaga" },
  "30": { lat: 37.98, lon: -1.13, province: "Murcia" },
  "31": { lat: 42.81, lon: -1.65, province: "Navarra" },
  "32": { lat: 42.34, lon: -7.86, province: "Ourense" },
  "33": { lat: 43.36, lon: -5.85, province: "Asturias" },
  "34": { lat: 42.01, lon: -4.53, province: "Palencia" },
  "35": { lat: 28.10, lon: -15.41, province: "Las Palmas" },
  "36": { lat: 42.43, lon: -8.64, province: "Pontevedra" },
  "37": { lat: 40.97, lon: -5.66, province: "Salamanca" },
  "38": { lat: 28.47, lon: -16.25, province: "Santa Cruz de Tenerife" },
  "39": { lat: 43.46, lon: -3.80, province: "Cantabria" },
  "40": { lat: 40.95, lon: -4.12, province: "Segovia" },
  "41": { lat: 37.39, lon: -5.98, province: "Sevilla" },
  "42": { lat: 41.76, lon: -2.47, province: "Soria" },
  "43": { lat: 41.12, lon: 1.25, province: "Tarragona" },
  "44": { lat: 40.34, lon: -1.11, province: "Teruel" },
  "45": { lat: 39.86, lon: -4.02, province: "Toledo" },
  "46": { lat: 39.47, lon: -0.38, province: "Valencia" },
  "47": { lat: 41.65, lon: -4.73, province: "Valladolid" },
  "48": { lat: 43.26, lon: -2.93, province: "Vizcaya" },
  "49": { lat: 41.50, lon: -5.75, province: "Zamora" },
  "50": { lat: 41.65, lon: -0.88, province: "Zaragoza" },
  "51": { lat: 35.89, lon: -5.32, province: "Ceuta" },
  "52": { lat: 35.29, lon: -2.94, province: "Melilla" },
};

export function geocodeFallback(postalCode: string): GeoResult | null {
  const prefix = postalCode.substring(0, 2);
  const entry = POSTAL_PREFIX_COORDS[prefix];
  if (!entry) return null;

  const region = PROVINCE_TO_CCAA[entry.province] || entry.province;
  return {
    lat: entry.lat,
    lon: entry.lon,
    city: "",
    region,
    province: entry.province,
  };
}
