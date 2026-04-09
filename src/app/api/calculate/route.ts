import { NextRequest, NextResponse } from "next/server";
import { geocodePostalCode, geocodeFallback } from "@/lib/geocode";
import { getPVGISData, getFallbackAnnualKwh } from "@/lib/pvgis";
import {
  roundToStandardSize,
  calculatePanelCount,
  estimatePrice,
  calculateSavings,
  calculatePayback,
  calculateMonthlyLoanPayment,
  monthlyBillToAnnualKwh,
} from "@/lib/pricing";
import { getReferencePricing, getLoanProducts, getSubsidyPrograms } from "@/lib/data";
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
    const { postalCode, monthlyBill, annualKwh, includeBattery = false } = body;

    if (!postalCode) {
      return NextResponse.json({ error: t("api.postalCodeRequired") }, { status: 400 });
    }
    if (!monthlyBill && !annualKwh) {
      return NextResponse.json(
        { error: t("api.billRequired") },
        { status: 400 }
      );
    }

    // 1. Geocode
    let geo = await geocodePostalCode(postalCode);
    if (!geo) geo = geocodeFallback(postalCode);
    if (!geo) {
      return NextResponse.json({ error: t("api.invalidPostalCode") }, { status: 400 });
    }

    // 2. Solar irradiance
    const pvgis = await getPVGISData(geo.lat, geo.lon);
    const annualKwhPer1kWp = pvgis?.annualKwhPer1kWp || getFallbackAnnualKwh(geo.region);

    // 3. System size
    const totalAnnualKwh = annualKwh || monthlyBillToAnnualKwh(monthlyBill);
    const rawKwp = totalAnnualKwh / annualKwhPer1kWp;
    const systemKwp = roundToStandardSize(rawKwp);
    const panelCount = calculatePanelCount(systemKwp);

    // 4. Reference pricing
    const referencePricing = await getReferencePricing(includeBattery);
    const price = estimatePrice(systemKwp, referencePricing, includeBattery);

    // 5. ALL subsidies for region
    const allSubsidies = await getSubsidyPrograms(geo.region);
    const solarSubsidies = allSubsidies.filter(
      (s) => s.vertical === "solar" || s.vertical === null
    );

    // Pick best subsidy (highest value) for net cost
    let subsidyAmount = 0;
    for (const s of solarSubsidies) {
      const amt = parseSubsidyAmount(s.amount, systemKwp, price.avg);
      if (amt > subsidyAmount) subsidyAmount = amt;
    }

    const netCost = Math.max(0, price.avg - subsidyAmount);

    // 6. Savings
    const annualProduction = Math.round(systemKwp * annualKwhPer1kWp);
    const savings = calculateSavings(annualProduction, includeBattery);
    const paybackYears = calculatePayback(netCost, savings.annualSaving);

    // 7. Financing
    const loanProducts = await getLoanProducts();
    const matchingLoans = loanProducts.filter(
      (p) =>
        (!p.amount_min || netCost >= p.amount_min) &&
        (!p.amount_max || netCost <= p.amount_max)
    );

    const bestLoan = matchingLoans[0];
    const loanMonthly = bestLoan
      ? calculateMonthlyLoanPayment(netCost, bestLoan.tae_min || 5, bestLoan.term_max_months || 120)
      : null;

    const subscriptionMonthly = Math.round((systemKwp * 45) / 12);
    const currentMonthlyBill = monthlyBill || Math.round((totalAnnualKwh * 0.24) / 12);

    return NextResponse.json({
      location: {
        postalCode,
        city: geo.city,
        region: geo.region,
        province: geo.province,
        lat: geo.lat,
        lon: geo.lon,
      },
      system: {
        kwp: systemKwp,
        panelCount,
        annualProductionKwh: annualProduction,
        annualKwhPer1kWp: Math.round(annualKwhPer1kWp),
        includeBattery,
        pvgisSource: !!pvgis,
      },
      pricing: {
        estimatedCost: price.avg,
        priceMin: price.min,
        priceMax: price.max,
        subsidyAmount,
        netCost,
        euroPerKwp: Math.round(price.avg / systemKwp),
        subsidies: solarSubsidies.map((s) => ({
          id: s.id,
          name: s.name,
          amount: s.amount,
          estimatedValue: parseSubsidyAmount(s.amount, systemKwp, price.avg),
          eligibility: s.eligibility,
          region: s.region,
          url: s.url,
          status: s.status,
          lastVerified: s.last_verified,
        })),
      },
      savings: {
        currentMonthlyBill,
        annualSaving: savings.annualSaving,
        monthlySaving: savings.monthlySaving,
        paybackYears,
        annualConsumptionKwh: totalAnnualKwh,
      },
      financing: {
        cash: { netCost },
        loan: bestLoan
          ? {
              monthly: loanMonthly,
              termMonths: bestLoan.term_max_months,
              tae: bestLoan.tae_min,
              productName: bestLoan.name,
              providerName: (bestLoan as unknown as { provider: { name: string } }).provider?.name || "",
            }
          : null,
        subscription: {
          monthly: subscriptionMonthly,
        },
        allProducts: matchingLoans.map((p) => {
          const prov = p as unknown as { provider: { name: string; short_name: string; website: string } };
          return {
            id: p.id,
            name: p.name,
            productType: p.product_type,
            provider: prov.provider?.short_name || prov.provider?.name || "",
            providerWebsite: prov.provider?.website || null,
            taeMin: p.tae_min,
            taeMax: p.tae_max,
            tinMin: p.tin_min,
            tinMax: p.tin_max,
            termMinMonths: p.term_min_months,
            termMaxMonths: p.term_max_months,
            amountMin: p.amount_min,
            amountMax: p.amount_max,
            openingFeePct: p.opening_fee_pct,
            approvalSpeed: p.approval_speed,
            digital: p.fully_digital,
            subsidyCompatible: p.subsidy_compatible,
            productUrl: p.product_url,
            monthly: calculateMonthlyLoanPayment(netCost, p.tae_min || 5, p.term_max_months || 120),
          };
        }),
      },
    });
  } catch (err) {
    console.error("Calculate error:", err);
    return NextResponse.json({ error: t("api.calcError") }, { status: 500 });
  }
}
