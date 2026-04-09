// Database types matching Supabase schema — European Energy Directories

// --- Verticals ---

export type VerticalSlug = "solar" | "heat-pumps" | "ess" | "ev-charging";

export interface Vertical {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  config_json: Record<string, unknown>;
  status: "draft" | "active" | "paused";
  created_at: string;
  updated_at: string;
}

// --- Country config ---

export interface Region {
  slug: string;
  name: string;
}

export interface CountryConfig {
  slug: string;
  name: string;
  language: string;
  currency: string;
  verticals: VerticalSlug[];
  regions: Region[];
}

// --- Listings ---

export interface Listing {
  id: string;
  vertical_id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  region: string;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  trustpilot_rating: number | null;
  trustpilot_review_count: number | null;
  trustpilot_url: string | null;
  checkatrade_rating: number | null;
  checkatrade_review_count: number | null;
  checkatrade_url: string | null;
  description: string | null;
  verticals_served: string[] | null;
  year_established: number | null;
  employee_count: string | null;
  status: "active" | "inactive" | "claimed" | "removed";
  created_at: string;
  updated_at: string;
}

// --- Certifications ---

export interface Certification {
  id: string;
  listing_id: string;
  cert_name: string;
  cert_body: string;
  cert_number: string | null;
  cert_date: string | null;
  verified: boolean;
  country: string;
}

// --- Equipment brands ---

export type BrandCategory =
  | "inverter"
  | "panel"
  | "battery"
  | "charger"
  | "heat_pump";

export interface EquipmentBrand {
  id: string;
  listing_id: string;
  brand_name: string;
  brand_category: BrandCategory;
  verified: boolean;
}

// --- Pricing ---

export interface Pricing {
  id: string;
  listing_id: string;
  config_type: string;
  price_min: number | null;
  price_max: number | null;
  price_exact: number | null;
  currency: string;
  system_size: string | null;
  source: "website" | "email_response" | "user_submission" | "manual";
  source_date: string;
  verified: boolean;
  created_at: string;
}

// --- Services ---

export interface Service {
  id: string;
  listing_id: string;
  service_name: string;
  service_category: string;
  available: boolean;
}

// --- Leads ---

export interface Lead {
  id: string;
  listing_id: string | null;
  vertical_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  vertical: string | null;
  system_size: string | null;
  property_type: string | null;
  service_type: string | null;
  preferred_date: string | null;
  status: "new" | "contacted" | "converted" | "spam";
  created_at: string;
}

// --- Content ---

export type ContentType =
  | "subsidy_guide"
  | "technology_explainer"
  | "comparison"
  | "calculator"
  | "city_guide"
  | "general";

export interface Content {
  id: string;
  vertical_id: string;
  slug: string;
  title: string;
  body: string;
  meta_description: string;
  type: ContentType;
  region: string | null;
  vertical: string | null;
  country: string | null;
  status: "draft" | "review" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Subsidy programs (legacy — from Supabase seed data) ---

export interface SubsidyProgram {
  id: string;
  country: string;
  region: string | null;
  vertical: string | null;
  name: string;
  amount: string | null;
  eligibility: string | null;
  url: string | null;
  last_verified: string | null;
  status: "active" | "expired" | "pending";
}

// --- Subsidies API types (from spain-subsidies-research) ---

export type SubsidyLevel = "national" | "regional" | "municipal";

export type SubsidyType =
  | "tax_deduction"
  | "tax_reduction"
  | "tax_bonification"
  | "direct_grant"
  | "reduced_rate";

export type SubsidyStatus =
  | "active"
  | "open"
  | "closed"
  | "uncertain"
  | "not-applicable";

/** Structured subsidy from the subsidies resolver API */
export interface Subsidy {
  id: string;
  name: string;
  level: SubsidyLevel;
  type: SubsidyType;
  status: SubsidyStatus;
  description: string;
  conditions?: string;
  /** Percentage benefit (e.g. 50 for 50%) */
  pct?: number;
  /** Max annual benefit in EUR */
  cap_eur?: number;
  /** How many years it applies */
  duration_years?: number;
  /** For VAT/IGIC/IPSI: the applicable rate */
  rate_pct?: number;
  /** Legal reference (e.g. "RDL 19/2021") */
  legal_ref?: string;
  /** Official URL to verify */
  source_url?: string;
}

export interface RegionalProgram {
  name: string;
  status: "open" | "closed" | "expected";
  technology: string[];
  type: "direct_grant" | "tax_deduction" | "soft_loan";
  amount: string | null;
  amount_en: string | null;
  budget: string | null;
  deadline: string | null;
  source_url: string;
  notes: string | null;
  notes_en: string | null;
}

export interface ComunidadAutonoma {
  id: string;
  name: string;
  ine_code: string;
  capital: string;
  provinces: number;
  municipalities: number;
  energy_agency: { name: string; acronym: string | null; url: string };
  gazette: { name: string; url: string };
  tax_regime: "common" | "foral";
  vat_type: "IVA" | "IGIC" | "IPSI";
  has_open_pv_program: boolean;
  has_open_heat_pump_program: boolean;
  notable_program: string | null;
  notable_program_en: string | null;
  programs: RegionalProgram[];
}

export interface Municipality {
  ine_code: string;
  name: string;
  province: string;
  ca: string;
  population: number;
  ibi_pct: number | null;
  ibi_years: number | null;
  icio_pct: number | null;
  ibi_notes: string | null;
  ibi_notes_en: string | null;
  technologies: string[];
  confidence?: "high" | "medium" | "low";
  verification_status?: "unverified" | "verified" | "flagged";
}

export interface GeocodeResult {
  muniCode: string;
  muni: string;
  provinceCode: string;
  province: string;
  lat: number;
  lng: number;
  postalCode: string;
  address: string;
  validated: boolean;
}

export interface ResolverResult {
  address: string;
  geocode: GeocodeResult;
  location: {
    municipality: string;
    municipality_ine: string;
    province: string;
    province_code: string;
    postal_code: string;
    ca_id: string;
    ca_name: string;
    tax_regime: "common" | "foral";
    vat_type: "IVA" | "IGIC" | "IPSI";
    in_top50: boolean;
    extracted: boolean;
  };
  subsidies: Subsidy[];
  closed_programs: Subsidy[];
  references: {
    energy_agency: { name: string; acronym: string | null; url: string };
    gazette: { name: string; url: string };
    ayuntamiento_url?: string;
    sede_url?: string;
    ibi_ordenanza_url?: string;
    icio_ordenanza_url?: string;
    alt_sources?: string[];
    technologies?: string[];
  };
}

/** Labels for subsidy types in Spanish */
export const SUBSIDY_TYPE_LABELS_ES: Record<SubsidyType, string> = {
  tax_deduction: "Deducción fiscal",
  tax_reduction: "Reducción fiscal",
  tax_bonification: "Bonificación fiscal",
  direct_grant: "Subvención directa",
  reduced_rate: "Tipo reducido",
};

/** Labels for subsidy levels in Spanish */
export const SUBSIDY_LEVEL_LABELS_ES: Record<SubsidyLevel, string> = {
  national: "Nacional",
  regional: "Autonómica",
  municipal: "Municipal",
};

// --- Countries ---

export interface Country {
  id: string;
  slug: string;
  name: string;
  language: string;
  currency: string;
  domain: string | null;
  config_json: Record<string, unknown>;
  status: "draft" | "active" | "paused";
}

// --- Images ---

export interface Image {
  id: string;
  listing_id: string;
  url: string;
  alt_text: string | null;
  source: string | null;
  verified: boolean;
}

// --- Pipeline ---

export interface PipelineRun {
  id: string;
  vertical_id: string;
  step: string;
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at: string | null;
  stats_json: Record<string, unknown>;
}

export interface EmailCampaign {
  id: string;
  vertical_id: string;
  listing_id: string;
  template: string;
  sent_at: string;
  response_received: boolean;
  response_parsed: boolean;
}

// --- Composite types ---

export interface ListingWithPricing extends Listing {
  pricing: Pricing[];
  services: Service[];
}

export interface ListingWithDetails extends ListingWithPricing {
  certifications: Certification[];
  equipment_brands: EquipmentBrand[];
  images: Image[];
}

// --- Vertical labels per country ---

export const VERTICAL_LABELS_ES: Record<VerticalSlug, string> = {
  solar: "Solar",
  "heat-pumps": "Aerotermia",
  ess: "Baterías",
  "ev-charging": "Cargadores EV",
};

export const VERTICAL_LABELS_EN: Record<VerticalSlug, string> = {
  solar: "Solar",
  "heat-pumps": "Heat Pumps",
  ess: "Battery Storage",
  "ev-charging": "EV Charging",
};

// --- Vertical URL slugs per country ---

export const VERTICAL_SLUGS_ES: Record<VerticalSlug, string> = {
  solar: "solar",
  "heat-pumps": "aerotermia",
  ess: "baterias",
  "ev-charging": "cargadores",
};

export const VERTICAL_SLUGS_EN: Record<VerticalSlug, string> = {
  solar: "solar",
  "heat-pumps": "heat-pumps",
  ess: "batteries",
  "ev-charging": "ev-charging",
};

// --- Spain: Comunidades Autónomas ---

export const COMUNIDADES_AUTONOMAS_ES = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y León",
  "Cataluña",
  "Valencia",
  "Extremadura",
  "Galicia",
  "Madrid",
  "Murcia",
  "Navarra",
  "País Vasco",
  "La Rioja",
] as const;

export type ComunidadAutonomaName = (typeof COMUNIDADES_AUTONOMAS_ES)[number];

/** Postal code prefix (first 2 digits) → Comunidad Autónoma */
export const POSTAL_CODE_TO_CCAA: Record<string, ComunidadAutonomaName> = {
  "01": "País Vasco", "20": "País Vasco", "48": "País Vasco",
  "02": "Castilla-La Mancha", "13": "Castilla-La Mancha", "16": "Castilla-La Mancha",
  "19": "Castilla-La Mancha", "45": "Castilla-La Mancha",
  "03": "Valencia", "12": "Valencia", "46": "Valencia",
  "04": "Andalucía", "11": "Andalucía", "14": "Andalucía", "18": "Andalucía",
  "21": "Andalucía", "23": "Andalucía", "29": "Andalucía", "41": "Andalucía",
  "05": "Castilla y León", "09": "Castilla y León", "24": "Castilla y León",
  "34": "Castilla y León", "37": "Castilla y León", "40": "Castilla y León",
  "42": "Castilla y León", "47": "Castilla y León", "49": "Castilla y León",
  "06": "Extremadura", "10": "Extremadura",
  "07": "Baleares",
  "08": "Cataluña", "17": "Cataluña", "25": "Cataluña", "43": "Cataluña",
  "15": "Galicia", "27": "Galicia", "32": "Galicia", "36": "Galicia",
  "22": "Aragón", "44": "Aragón", "50": "Aragón",
  "26": "La Rioja",
  "28": "Madrid",
  "30": "Murcia",
  "31": "Navarra",
  "33": "Asturias",
  "35": "Canarias", "38": "Canarias",
  "39": "Cantabria",
  "51": "Ceuta" as ComunidadAutonomaName,
  "52": "Melilla" as ComunidadAutonomaName,
};

export * from "../theme/types";
