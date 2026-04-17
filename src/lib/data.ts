import { cache } from "react";
import { getServerSupabase } from "./supabase-server";
import { dedupListings } from "./dedup";
import { isSubsidiesApiConfigured, resolveAddress } from "./subsidies-api";
import type { ReferencePricing } from "./pricing";
import type {
  Listing,
  ListingWithPricing,
  ListingWithDetails,
  Pricing,
  Service,
  Certification,
  EquipmentBrand,
  SubsidyProgram,
  ResolverResult,
} from "@shared/types";

const COUNTRY = "spain";

// ============================================================
// Reference Pricing
// ============================================================

export const getReferencePricing = cache(
  async (includeBattery: boolean): Promise<ReferencePricing[]> => {
    const supabase = getServerSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reference_pricing")
      .select("system_size_kwp, price_min, price_max, price_avg, includes_battery")
      .eq("includes_battery", includeBattery)
      .order("system_size_kwp");

    if (error || !data) return [];
    return data as ReferencePricing[];
  }
);

// ============================================================
// Loan Products
// ============================================================

export interface LoanProvider {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  website: string | null;
  provider_type: string;
  is_digital: boolean;
}

export interface LoanProduct {
  id: string;
  provider_id: string;
  slug: string;
  name: string;
  product_type: string;
  tae_min: number | null;
  tae_max: number | null;
  tin_min: number | null;
  tin_max: number | null;
  amount_min: number | null;
  amount_max: number | null;
  term_min_months: number | null;
  term_max_months: number | null;
  opening_fee_pct: number;
  approval_speed: string | null;
  fully_digital: boolean;
  subsidy_compatible: boolean;
  product_url: string | null;
  provider?: LoanProvider;
}

// ── Hardcoded fallback loan data (used when DB tables don't exist) ──
// Last updated: 2026-04-17 — Sources: CaixaBank.es, BBVA.es, ICO.es, provider websites
// Next review: 2026-04-24 (weekly cadence)
// ICO Linea Verde confirmed active until June 1, 2026 (asesoriasantanderasinem.com)
const FALLBACK_PROVIDERS: Record<string, LoanProvider> = {
  caixabank: { id: "fb-caixa", slug: "caixabank", name: "CaixaBank", short_name: "CaixaBank", logo_url: null, website: "https://www.caixabank.es", provider_type: "bank", is_digital: false },
  bbva: { id: "fb-bbva", slug: "bbva", name: "BBVA", short_name: "BBVA", logo_url: null, website: "https://www.bbva.es", provider_type: "bank", is_digital: false },
  santander: { id: "fb-sant", slug: "santander", name: "Banco Santander", short_name: "Santander", logo_url: null, website: "https://www.santander.es", provider_type: "bank", is_digital: false },
  sabadell: { id: "fb-sab", slug: "sabadell", name: "Banco Sabadell", short_name: "Sabadell", logo_url: null, website: "https://www.bancsabadell.com", provider_type: "bank", is_digital: false },
  bankinter: { id: "fb-bki", slug: "bankinter", name: "Bankinter Consumer Finance", short_name: "Bankinter", logo_url: null, website: "https://www.bankinterconsumerfinance.com", provider_type: "bank", is_digital: true },
  kutxabank: { id: "fb-kut", slug: "kutxabank", name: "Kutxabank", short_name: "Kutxabank", logo_url: null, website: "https://www.kutxabank.es", provider_type: "bank", is_digital: false },
  cofidis: { id: "fb-cof", slug: "cofidis", name: "Cofidis", short_name: "Cofidis", logo_url: null, website: "https://www.cofidis.es", provider_type: "fintech", is_digital: true },
  sofinco: { id: "fb-sof", slug: "sofinco", name: "Sofinco", short_name: "Sofinco", logo_url: null, website: "https://www.sofinco.es", provider_type: "fintech", is_digital: true },
  cetelem: { id: "fb-cet", slug: "cetelem", name: "Cetelem (BNP Paribas)", short_name: "Cetelem", logo_url: null, website: "https://www.cetelem.es", provider_type: "fintech", is_digital: true },
  "ico-verde": { id: "fb-ico", slug: "ico-verde", name: "ICO Linea Verde", short_name: "ICO Verde", logo_url: null, website: "https://www.ico.es", provider_type: "government", is_digital: false },
  pontio: { id: "fb-pon", slug: "pontio", name: "Pontio", short_name: "Pontio", logo_url: null, website: "https://www.gopontio.com", provider_type: "fintech", is_digital: true },
  "younited-credit": { id: "fb-you", slug: "younited-credit", name: "Younited Credit", short_name: "Younited", logo_url: null, website: "https://es.younited-credit.com", provider_type: "fintech", is_digital: true },
  fintonic: { id: "fb-fin", slug: "fintonic", name: "Fintonic", short_name: "Fintonic", logo_url: null, website: "https://www.fintonic.com", provider_type: "fintech", is_digital: true },
};

const FALLBACK_LOAN_PRODUCTS: LoanProduct[] = [
  { id: "fb-lp-1", provider_id: "fb-ico", slug: "ico-linea-verde", name: "Linea ICO Verde", product_type: "ico_line", tae_min: 2.50, tae_max: 4.00, tin_min: 2.00, tin_max: 3.50, amount_min: 5000, amount_max: 100000, term_min_months: 12, term_max_months: 120, opening_fee_pct: 0, approval_speed: "10_days", fully_digital: false, subsidy_compatible: true, product_url: "https://www.ico.es/linea-ico-verde", provider: FALLBACK_PROVIDERS["ico-verde"] },
  { id: "fb-lp-2", provider_id: "fb-caixa", slug: "caixabank-facilitea-solar", name: "Facilitea Paneles Solares", product_type: "green_loan", tae_min: 2.90, tae_max: 3.90, tin_min: 2.86, tin_max: 3.83, amount_min: 3000, amount_max: 60000, term_min_months: 15, term_max_months: 123, opening_fee_pct: 0, approval_speed: "48h", fully_digital: false, subsidy_compatible: true, product_url: "https://www.caixabank.es/particular/facilitea/paneles-solares.html", provider: FALLBACK_PROVIDERS.caixabank },
  { id: "fb-lp-3", provider_id: "fb-bbva", slug: "bbva-eficiencia-energetica", name: "Prestamo Eficiencia Energetica", product_type: "energy_loan", tae_min: 4.50, tae_max: 7.00, tin_min: 4.00, tin_max: 6.50, amount_min: 3000, amount_max: 75000, term_min_months: 24, term_max_months: 180, opening_fee_pct: 0, approval_speed: "48h", fully_digital: false, subsidy_compatible: true, product_url: "https://www.bbva.es/personas/productos/prestamos/prestamo-eficiencia-energetica-particulares.html", provider: FALLBACK_PROVIDERS.bbva },
  { id: "fb-lp-4", provider_id: "fb-kut", slug: "kutxabank-eficiencia", name: "Prestamo Eficiencia Energetica", product_type: "energy_loan", tae_min: 4.50, tae_max: 6.50, tin_min: 4.00, tin_max: 6.00, amount_min: 3000, amount_max: 50000, term_min_months: 12, term_max_months: 96, opening_fee_pct: 0, approval_speed: "5_days", fully_digital: false, subsidy_compatible: true, product_url: null, provider: FALLBACK_PROVIDERS.kutxabank },
  { id: "fb-lp-5", provider_id: "fb-pon", slug: "pontio-solar", name: "Financiacion Solar Pontio", product_type: "solar_loan", tae_min: 4.50, tae_max: 7.00, tin_min: 4.00, tin_max: 6.50, amount_min: 3000, amount_max: 60000, term_min_months: 24, term_max_months: 240, opening_fee_pct: 0, approval_speed: "instant", fully_digital: true, subsidy_compatible: true, product_url: "https://www.gopontio.com/placas-solares-financiadas-clientes-pontio/", provider: FALLBACK_PROVIDERS.pontio },
  { id: "fb-lp-6", provider_id: "fb-bki", slug: "bankinter-eficiencia", name: "Prestamo Eficiencia Energetica", product_type: "energy_loan", tae_min: 5.00, tae_max: 7.00, tin_min: 4.50, tin_max: 6.50, amount_min: 4000, amount_max: 30000, term_min_months: 24, term_max_months: 120, opening_fee_pct: 0, approval_speed: "24h", fully_digital: true, subsidy_compatible: true, product_url: "https://www.bankinterconsumerfinance.com/financiacion/prestamos/prestamo-eficiencia-energetica", provider: FALLBACK_PROVIDERS.bankinter },
  { id: "fb-lp-7", provider_id: "fb-sant", slug: "santander-reforma-verde", name: "Prestamo Reforma Verde", product_type: "green_loan", tae_min: 5.00, tae_max: 7.50, tin_min: 4.50, tin_max: 7.00, amount_min: 5000, amount_max: 100000, term_min_months: 12, term_max_months: 84, opening_fee_pct: 1.50, approval_speed: "5_days", fully_digital: false, subsidy_compatible: true, product_url: null, provider: FALLBACK_PROVIDERS.santander },
  { id: "fb-lp-8", provider_id: "fb-sab", slug: "sabadell-sostenible", name: "Financiacion Sostenible", product_type: "green_loan", tae_min: 5.50, tae_max: 8.00, tin_min: 5.00, tin_max: 7.50, amount_min: 3000, amount_max: 60000, term_min_months: 24, term_max_months: 120, opening_fee_pct: 0, approval_speed: "5_days", fully_digital: false, subsidy_compatible: true, product_url: null, provider: FALLBACK_PROVIDERS.sabadell },
  { id: "fb-lp-9", provider_id: "fb-sof", slug: "sofinco-solar", name: "Prestamo Paneles Solares", product_type: "personal_loan", tae_min: 6.00, tae_max: 9.50, tin_min: 5.50, tin_max: 9.00, amount_min: 1000, amount_max: 40000, term_min_months: 12, term_max_months: 84, opening_fee_pct: 0, approval_speed: "24h", fully_digital: true, subsidy_compatible: true, product_url: "https://www.sofinco.es/credito-sofinco/prestamo-paneles-solares", provider: FALLBACK_PROVIDERS.sofinco },
  { id: "fb-lp-10", provider_id: "fb-cet", slug: "cetelem-reforma", name: "Prestamo Reforma", product_type: "personal_loan", tae_min: 6.00, tae_max: 10.00, tin_min: 5.50, tin_max: 9.50, amount_min: 3000, amount_max: 60000, term_min_months: 12, term_max_months: 96, opening_fee_pct: 0, approval_speed: "24h", fully_digital: true, subsidy_compatible: true, product_url: null, provider: FALLBACK_PROVIDERS.cetelem },
  { id: "fb-lp-11", provider_id: "fb-fin", slug: "fintonic-prestamo-personal", name: "Prestamo Personal Fintonic", product_type: "personal_loan", tae_min: 6.50, tae_max: 12.00, tin_min: 6.00, tin_max: 11.00, amount_min: 3000, amount_max: 30000, term_min_months: 12, term_max_months: 84, opening_fee_pct: 0, approval_speed: "24h", fully_digital: true, subsidy_compatible: true, product_url: "https://www.fintonic.com/prestamos/", provider: FALLBACK_PROVIDERS.fintonic },
  { id: "fb-lp-12", provider_id: "fb-cof", slug: "cofidis-solar", name: "Prestamo Placas Solares", product_type: "personal_loan", tae_min: 6.50, tae_max: 10.50, tin_min: 6.00, tin_max: 10.00, amount_min: 1000, amount_max: 30000, term_min_months: 12, term_max_months: 72, opening_fee_pct: 0, approval_speed: "24h", fully_digital: true, subsidy_compatible: true, product_url: "https://www.cofidis.es/es/prestamo-personal/prestamos-online/prestamo-placas-solares.html", provider: FALLBACK_PROVIDERS.cofidis },
  { id: "fb-lp-13", provider_id: "fb-you", slug: "younited-reforma-energetica", name: "Prestamo Reforma Energetica", product_type: "personal_loan", tae_min: 10.49, tae_max: 13.98, tin_min: 10.02, tin_max: 12.52, amount_min: 1000, amount_max: 50000, term_min_months: 24, term_max_months: 96, opening_fee_pct: 1.50, approval_speed: "48h", fully_digital: true, subsidy_compatible: true, product_url: "https://es.younited-credit.com/", provider: FALLBACK_PROVIDERS["younited-credit"] },
];

export const getLoanProducts = cache(
  async (amount?: number): Promise<LoanProduct[]> => {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("loan_products")
        .select("*, provider:loan_providers(*)")
        .eq("active", true)
        .order("tae_min", { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        return data as unknown as LoanProduct[];
      }
    }

    // Fallback to hardcoded data (sorted by tae_min)
    return FALLBACK_LOAN_PRODUCTS;
  }
);

export const getLoanProviders = cache(async (): Promise<LoanProvider[]> => {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("loan_providers")
      .select("*")
      .eq("active", true)
      .order("name");

    if (!error && data && data.length > 0) {
      return data as LoanProvider[];
    }
  }

  // Fallback to hardcoded providers
  return Object.values(FALLBACK_PROVIDERS);
});

// ============================================================
// Installers (from tuenergiaverde.es listings)
// ============================================================

export async function getInstallersByRegion(
  region: string,
  limit: number = 10
): Promise<ListingWithPricing[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  // Get spain vertical IDs
  const { data: verticals } = await supabase
    .from("verticals")
    .select("id")
    .like("slug", "spain-%");

  if (!verticals || verticals.length === 0) return [];
  const verticalIds = verticals.map((v: { id: string }) => v.id);

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("vertical_id", verticalIds)
    .eq("status", "active")
    .ilike("region", region)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) return [];

  const listings = data as unknown as Listing[];
  if (listings.length === 0) return [];

  const listingIds = listings.map((l) => l.id);
  const [{ data: pricingData }, { data: servicesData }] = await Promise.all([
    supabase.from("pricing").select("*").in("listing_id", listingIds),
    supabase.from("services").select("*").in("listing_id", listingIds),
  ]);

  const results = listings.map((listing) => ({
    ...listing,
    pricing: ((pricingData || []) as unknown as Pricing[]).filter(
      (p) => p.listing_id === listing.id
    ),
    services: ((servicesData || []) as unknown as Service[]).filter(
      (s) => s.listing_id === listing.id
    ),
  }));

  return dedupListings(results);
}

export async function getInstallersByCity(
  city: string,
  limit: number = 10
): Promise<ListingWithPricing[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data: verticals } = await supabase
    .from("verticals")
    .select("id")
    .like("slug", "spain-%");

  if (!verticals || verticals.length === 0) return [];
  const verticalIds = verticals.map((v: { id: string }) => v.id);

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("vertical_id", verticalIds)
    .eq("status", "active")
    .ilike("city", city)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) return [];

  const listings = data as unknown as Listing[];
  if (listings.length === 0) return [];

  const listingIds = listings.map((l) => l.id);
  const [{ data: pricingData }, { data: servicesData }] = await Promise.all([
    supabase.from("pricing").select("*").in("listing_id", listingIds),
    supabase.from("services").select("*").in("listing_id", listingIds),
  ]);

  const results = listings.map((listing) => ({
    ...listing,
    pricing: ((pricingData || []) as unknown as Pricing[]).filter(
      (p) => p.listing_id === listing.id
    ),
    services: ((servicesData || []) as unknown as Service[]).filter(
      (s) => s.listing_id === listing.id
    ),
  }));

  return dedupListings(results);
}

// ============================================================
// Installers with full details (certs, equipment, pricing, services)
// ============================================================

export async function getInstallersWithDetails(
  city: string,
  region: string,
  limit: number = 10
): Promise<ListingWithDetails[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data: verticals } = await supabase
    .from("verticals")
    .select("id")
    .like("slug", "spain-%");

  if (!verticals || verticals.length === 0) return [];
  const verticalIds = verticals.map((v: { id: string }) => v.id);

  // Try city first
  let { data } = await supabase
    .from("listings")
    .select("*")
    .in("vertical_id", verticalIds)
    .eq("status", "active")
    .ilike("city", city)
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  // Fallback to region if city yields < 3
  if (!data || data.length < 3) {
    const cityIds = new Set((data || []).map((d: { id: string }) => d.id));
    const remaining = limit - (data?.length || 0);
    const { data: regionData } = await supabase
      .from("listings")
      .select("*")
      .in("vertical_id", verticalIds)
      .eq("status", "active")
      .ilike("region", region)
      .order("google_rating", { ascending: false, nullsFirst: false })
      .limit(remaining + 10);

    const extra = (regionData || []).filter(
      (r: { id: string }) => !cityIds.has(r.id)
    ).slice(0, remaining);
    data = [...(data || []), ...extra];
  }

  if (!data || data.length === 0) return [];

  const listings = data as unknown as Listing[];
  const listingIds = listings.map((l) => l.id);

  const [
    { data: pricingData },
    { data: servicesData },
    { data: certsData },
    { data: brandsData },
  ] = await Promise.all([
    supabase.from("pricing").select("*").in("listing_id", listingIds),
    supabase.from("services").select("*").in("listing_id", listingIds),
    supabase.from("certifications").select("*").in("listing_id", listingIds),
    supabase.from("equipment_brands").select("*").in("listing_id", listingIds),
  ]);

  const results = listings.map((listing) => ({
    ...listing,
    pricing: ((pricingData || []) as unknown as Pricing[]).filter(
      (p) => p.listing_id === listing.id
    ),
    services: ((servicesData || []) as unknown as Service[]).filter(
      (s) => s.listing_id === listing.id
    ),
    certifications: ((certsData || []) as unknown as Certification[]).filter(
      (c) => c.listing_id === listing.id
    ),
    equipment_brands: ((brandsData || []) as unknown as EquipmentBrand[]).filter(
      (b) => b.listing_id === listing.id
    ),
    images: [],
  }));

  return dedupListings(results) as ListingWithDetails[];
}

// ============================================================
// Subsidies (reuse from tuenergiaverde.es)
// ============================================================

export async function getSubsidyPrograms(
  region?: string
): Promise<SubsidyProgram[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("subsidy_programs")
    .select("*")
    .eq("country", COUNTRY)
    .eq("status", "active");

  if (region) query = query.or(`region.eq.${region},region.is.null`);
  query = query.or("vertical.eq.solar,vertical.is.null");

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as SubsidyProgram[];
}

// ============================================================
// Subsidies — API-first with Supabase fallback
// ============================================================

export async function resolveSubsidiesForAddress(
  address: string
): Promise<ResolverResult | null> {
  if (!isSubsidiesApiConfigured()) return null;
  return resolveAddress(address);
}

// ============================================================
// Save lead
// ============================================================

export async function saveLead(lead: Record<string, unknown>): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("solar_journey_leads" as never)
    .insert(lead as never)
    .select("id")
    .single();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

// ============================================================
// Cases, Chats, Messages
// ============================================================

export interface CaseData {
  id: string;
  session_token: string;
  display_name: string | null;
  postal_code: string;
  city: string | null;
  region: string | null;
  system_size_kwp: number | null;
  panel_count: number | null;
  estimated_cost: number | null;
  subsidy_amount: number | null;
  net_cost: number | null;
  monthly_bill: number | null;
  monthly_saving: number | null;
  include_battery: boolean;
  financing_preference: string | null;
  name: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

export interface ChatData {
  id: string;
  case_id: string;
  listing_id: string;
  listing_name: string;
  status: string;
  initial_message: string | null;
  installer_responded: boolean;
  created_at: string;
}

export interface MessageData {
  id: string;
  chat_id: string;
  sender_type: "user" | "installer" | "system" | "bot";
  body: string;
  read_at: string | null;
  created_at: string;
}

export async function createCase(caseData: Record<string, unknown>): Promise<CaseData | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("solar_journey_cases" as never)
    .insert(caseData as never)
    .select("*")
    .single();
  if (error || !data) {
    console.error("createCase error:", error?.message, error?.code);
    return null;
  }
  return data as unknown as CaseData;
}

export async function getCaseBySession(sessionToken: string): Promise<CaseData | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("solar_journey_cases" as never)
    .select("*")
    .eq("session_token", sessionToken)
    .single();
  if (error || !data) return null;
  return data as unknown as CaseData;
}

export async function createChat(chatData: Record<string, unknown>): Promise<ChatData | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("solar_journey_chats" as never)
    .insert(chatData as never)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as unknown as ChatData;
}

export async function getChatsByCase(caseId: string): Promise<ChatData[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("solar_journey_chats" as never)
    .select("*")
    .eq("case_id", caseId)
    .order("created_at");
  if (error || !data) return [];
  return data as unknown as ChatData[];
}

export async function createMessage(messageData: Record<string, unknown>): Promise<MessageData | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("solar_journey_messages" as never)
    .insert(messageData as never)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as unknown as MessageData;
}

export async function getMessagesByChat(chatId: string): Promise<MessageData[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("solar_journey_messages" as never)
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at");
  if (error || !data) return [];
  return data as unknown as MessageData[];
}
