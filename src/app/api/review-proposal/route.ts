import { NextRequest, NextResponse } from "next/server";
import { geocodePostalCode, geocodeFallback } from "@/lib/geocode";
import { getReferencePricing, getLoanProducts, getSubsidyPrograms } from "@/lib/data";
import { getServerSupabase } from "@/lib/supabase-server";
import { estimatePrice, roundToStandardSize } from "@/lib/pricing";
import { getDictionary, translate, type Locale, LOCALES, DEFAULT_LOCALE, COOKIE_NAME } from "@/i18n";

function getLocaleFromRequest(req: NextRequest): Locale {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  return raw && LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

function parseSubsidyAmount(amount: string | null, kwp: number, cost: number): number {
  if (!amount) return 0;
  const perKwp = amount.match(/(\d+(?:[.,]\d+)?)\s*€\/kWp/i);
  const flat = amount.match(/^(\d+(?:[.,]\d+)?)\s*€$/);
  const pct = amount.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (perKwp) return Math.round(parseFloat(perKwp[1].replace(",", ".")) * kwp);
  if (flat) return Math.round(parseFloat(flat[1].replace(",", ".")));
  if (pct) return Math.round(cost * (parseFloat(pct[1].replace(",", ".")) / 100));
  return 0;
}

export async function POST(req: NextRequest) {
  const locale = getLocaleFromRequest(req);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  try {
    const body = await req.json();
    const {
      postalCode,
      quotedPrice,
      systemSizeKwp,
      panelCount,
      panelBrand,
      inverterBrand,
      includeBattery = false,
      batteryKwh,
      subsidyIncluded,
      financingMonthly,
      financingTermMonths,
      financingTae,
      fileUrls,
    } = body;

    if (!postalCode || !quotedPrice || !systemSizeKwp) {
      return NextResponse.json(
        { error: t("api.reviewRequired") },
        { status: 400 }
      );
    }

    // Geocode
    let geo = await geocodePostalCode(postalCode);
    if (!geo) geo = geocodeFallback(postalCode);
    if (!geo) {
      return NextResponse.json({ error: t("api.invalidPostalCode") }, { status: 400 });
    }

    const kwp = roundToStandardSize(systemSizeKwp);
    const euroPerKwp = Math.round(quotedPrice / kwp);

    // Reference pricing
    const referencePricing = await getReferencePricing(includeBattery);
    const refPrice = estimatePrice(kwp, referencePricing, includeBattery);

    // Price score
    let priceScore: "excellent" | "good" | "fair" | "high";
    if (euroPerKwp <= refPrice.min / kwp) priceScore = "excellent";
    else if (euroPerKwp <= refPrice.avg / kwp) priceScore = "good";
    else if (euroPerKwp <= refPrice.max / kwp) priceScore = "fair";
    else priceScore = "high";

    // Subsidies
    const subsidies = await getSubsidyPrograms(geo.region);
    const solarSubsidies = subsidies.filter(
      (s) => s.vertical === "solar" || s.vertical === null
    );
    let bestSubsidyAmount = 0;
    for (const s of solarSubsidies) {
      const amt = parseSubsidyAmount(s.amount, kwp, quotedPrice);
      if (amt > bestSubsidyAmount) bestSubsidyAmount = amt;
    }

    // Financing comparison
    const loanProducts = await getLoanProducts();
    const bestLoan = loanProducts[0];
    let financingScore: "excellent" | "good" | "fair" | "high" | null = null;
    if (financingTae && bestLoan?.tae_min) {
      if (financingTae <= bestLoan.tae_min) financingScore = "excellent";
      else if (financingTae <= bestLoan.tae_min * 1.3) financingScore = "good";
      else if (financingTae <= bestLoan.tae_min * 1.8) financingScore = "fair";
      else financingScore = "high";
    }

    // Equipment recognition
    const knownPanelBrands = [
      "SunPower", "LG", "Panasonic", "Canadian Solar", "JA Solar",
      "Jinko Solar", "Trina Solar", "LONGi", "REC", "Q CELLS",
      "Risen", "Yingli", "Astronergy", "Hyundai", "Sharp",
    ];
    const knownInverterBrands = [
      "SMA", "Fronius", "Huawei", "Enphase", "SolarEdge",
      "GoodWe", "Growatt", "Sungrow", "ABB", "Victron",
    ];

    const panelRecognized = panelBrand
      ? knownPanelBrands.some((b) => b.toLowerCase() === panelBrand.toLowerCase())
      : null;
    const inverterRecognized = inverterBrand
      ? knownInverterBrands.some((b) => b.toLowerCase() === inverterBrand.toLowerCase())
      : null;

    // Overall rating
    const scores: number[] = [];
    if (priceScore === "excellent") scores.push(4);
    else if (priceScore === "good") scores.push(3);
    else if (priceScore === "fair") scores.push(2);
    else scores.push(1);

    if (financingScore === "excellent") scores.push(4);
    else if (financingScore === "good") scores.push(3);
    else if (financingScore === "fair") scores.push(2);
    else if (financingScore === "high") scores.push(1);

    if (panelRecognized === true) scores.push(3);
    else if (panelRecognized === false) scores.push(1);
    if (inverterRecognized === true) scores.push(3);
    else if (inverterRecognized === false) scores.push(1);

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    let overallRating: "excellent" | "good" | "fair" | "review_recommended";
    if (avgScore >= 3.5) overallRating = "excellent";
    else if (avgScore >= 2.5) overallRating = "good";
    else if (avgScore >= 1.5) overallRating = "fair";
    else overallRating = "review_recommended";

    // Store proposal for market intelligence (fire-and-forget)
    const supabase = getServerSupabase();
    if (supabase) {
      supabase
        .from("solar_journey_proposals" as never)
        .insert({
          postal_code: postalCode,
          city: geo.city,
          region: geo.region,
          quoted_price: quotedPrice,
          system_size_kwp: systemSizeKwp,
          panel_count: panelCount || null,
          panel_brand: panelBrand || null,
          inverter_brand: inverterBrand || null,
          include_battery: includeBattery,
          battery_kwh: batteryKwh || null,
          subsidy_included: subsidyIncluded || null,
          financing_tae: financingTae || null,
          financing_monthly: financingMonthly || null,
          financing_term_months: financingTermMonths || null,
          price_score: priceScore,
          financing_score: financingScore,
          overall_rating: overallRating,
          market_avg: refPrice.avg,
          market_min: refPrice.min,
          market_max: refPrice.max,
          best_subsidy_amount: bestSubsidyAmount,
          file_urls: fileUrls && fileUrls.length ? fileUrls : null,
        } as never)
        .then(({ error }) => {
          if (error) console.error("Failed to store proposal:", error.message);
        });
    }

    return NextResponse.json({
      location: {
        city: geo.city,
        region: geo.region,
        province: geo.province,
      },
      priceAnalysis: {
        quotedPrice,
        quotedEuroPerKwp: euroPerKwp,
        marketAvg: refPrice.avg,
        marketMin: refPrice.min,
        marketMax: refPrice.max,
        marketEuroPerKwp: Math.round(refPrice.avg / kwp),
        score: priceScore,
      },
      subsidyAnalysis: {
        available: solarSubsidies.map((s) => ({
          name: s.name,
          amount: s.amount,
          estimatedValue: parseSubsidyAmount(s.amount, kwp, quotedPrice),
          url: s.url,
          status: s.status,
        })),
        bestAmount: bestSubsidyAmount,
        subsidyIncluded,
        potentialSavings: subsidyIncluded === "no" ? bestSubsidyAmount : 0,
      },
      financingAnalysis: financingTae
        ? {
            offeredTae: financingTae,
            offeredMonthly: financingMonthly,
            offeredTermMonths: financingTermMonths,
            bestAvailableTae: bestLoan?.tae_min || null,
            bestAvailableProvider: bestLoan
              ? (bestLoan as unknown as { provider: { name: string } }).provider?.name
              : null,
            score: financingScore,
          }
        : null,
      equipmentAnalysis: {
        panelBrand: panelBrand || null,
        panelRecognized,
        inverterBrand: inverterBrand || null,
        inverterRecognized,
      },
      overallRating,
    });
  } catch (err) {
    console.error("Review proposal error:", err);
    return NextResponse.json(
      { error: t("api.reviewError") },
      { status: 500 }
    );
  }
}
