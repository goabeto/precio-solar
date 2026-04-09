import { NextRequest, NextResponse } from "next/server";
import { getInstallersWithDetails } from "@/lib/data";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "";
  const city = searchParams.get("city") || "";

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({
      installers: [],
      error: "database_unavailable",
    });
  }

  const installers = await getInstallersWithDetails(city, region, 6);

  return NextResponse.json({
    installers: installers.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      city: i.city,
      region: i.region,
      description: i.description,
      google_rating: i.google_rating,
      google_review_count: i.google_review_count,
      verticals_served: i.verticals_served,
      phone: i.phone,
      website: i.website,
      year_established: i.year_established,
      employee_count: i.employee_count,
      certifications: (i.certifications || []).map((c) => ({
        id: c.id,
        name: c.cert_name,
        body: c.cert_body,
        verified: c.verified,
      })),
      equipment_brands: (i.equipment_brands || []).map((b) => ({
        id: b.id,
        name: b.brand_name,
        category: b.brand_category,
        verified: b.verified,
      })),
      pricing: (i.pricing || []).map((p) => ({
        id: p.id,
        configType: p.config_type,
        priceMin: p.price_min,
        priceMax: p.price_max,
        systemSize: p.system_size,
        verified: p.verified,
      })),
      services: (i.services || [])
        .filter((s) => s.available)
        .map((s) => ({
          id: s.id,
          name: s.service_name,
          category: s.service_category,
        })),
    })),
  });
}
