import type {
  Subsidy,
  ResolverResult,
  ComunidadAutonoma,
  Municipality,
} from "@shared/types";

// ---------------------------------------------------------------------------
// Config — read at call time, not module load time
// ---------------------------------------------------------------------------

function getApiUrl(): string {
  const url = process.env.SUBSIDIES_API_URL;
  if (!url) throw new Error("SUBSIDIES_API_URL is not set");
  return url;
}

function getApiKey(): string {
  const key = process.env.SUBSIDIES_API_KEY;
  if (!key) throw new Error("SUBSIDIES_API_KEY is not set");
  return key;
}

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

function apiUrl(path: string): string {
  return `${getApiUrl()}${path}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: { code: string; message: string };
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(apiUrl(path), {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `[subsidies-api] ${path} returned ${res.status}: ${res.statusText}`
      );
      return null;
    }

    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) {
      console.error(`[subsidies-api] ${path} error:`, json.error);
      return null;
    }

    return json.data;
  } catch (err) {
    console.error(`[subsidies-api] ${path} fetch failed:`, err);
    return null;
  }
}

async function apiFetchPaginated<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(apiUrl(path), {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const json = (await res.json()) as ApiResponse<T[]>;
    if (!json.success) return [];

    return json.data;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Check if the subsidies API is configured */
export function isSubsidiesApiConfigured(): boolean {
  return Boolean(process.env.SUBSIDIES_API_URL && process.env.SUBSIDIES_API_KEY);
}

/** Resolve an address to all applicable subsidies */
export async function resolveAddress(
  address: string
): Promise<ResolverResult | null> {
  const path = `/api/v1/resolve?address=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(apiUrl(path), {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[subsidies-api] resolve returned ${res.status}: ${body}`
      );
      return null;
    }

    const json = (await res.json()) as ApiResponse<ResolverResult>;
    if (!json.success) {
      console.error(`[subsidies-api] resolve error:`, json.error);
      return null;
    }

    return json.data;
  } catch (err) {
    console.error(`[subsidies-api] resolve fetch failed:`, err);
    return null;
  }
}

/** Fetch all comunidades autónomas */
export async function getComunidades(): Promise<ComunidadAutonoma[]> {
  return apiFetchPaginated<ComunidadAutonoma>(
    "/api/v1/comunidades?pageSize=100"
  );
}

/** Fetch a single comunidad autónoma by slug ID */
export async function getComunidad(
  id: string
): Promise<ComunidadAutonoma | null> {
  return apiFetch<ComunidadAutonoma>(`/api/v1/comunidades/${id}`);
}

/** Fetch municipalities, optionally filtered by comunidad */
export async function getMunicipalities(
  ca?: string
): Promise<Municipality[]> {
  const params = new URLSearchParams({ pageSize: "100" });
  if (ca) params.set("ca", ca);
  return apiFetchPaginated<Municipality>(
    `/api/v1/municipalities?${params.toString()}`
  );
}

/** Fetch a single municipality by INE code */
export async function getMunicipalityByIne(
  ineCode: string
): Promise<Municipality | null> {
  return apiFetch<Municipality>(`/api/v1/municipalities/${ineCode}`);
}
