import { NextRequest, NextResponse } from "next/server";
import { getLoanProducts } from "@/lib/data";
import { calculateMonthlyLoanPayment } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get("amount")) || 8000;
    const termMonths = Number(searchParams.get("termMonths")) || 120;

    // Clamp values
    const clampedAmount = Math.max(1000, Math.min(100000, amount));
    const clampedTerm = Math.max(12, Math.min(240, termMonths));

    const loanProducts = await getLoanProducts();

    // Filter by amount range
    const matching = loanProducts.filter(
      (p) =>
        (!p.amount_min || clampedAmount >= p.amount_min) &&
        (!p.amount_max || clampedAmount <= p.amount_max) &&
        (!p.term_max_months || clampedTerm <= p.term_max_months)
    );

    const products = matching.map((p) => {
      const prov = p as unknown as { provider: { name: string; short_name: string; website: string } };
      const actualTerm = Math.min(clampedTerm, p.term_max_months || clampedTerm);
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
        monthly: calculateMonthlyLoanPayment(clampedAmount, p.tae_min || 5, actualTerm),
      };
    });

    return NextResponse.json({ products, amount: clampedAmount, termMonths: clampedTerm });
  } catch (err) {
    console.error("Financing API error:", err);
    return NextResponse.json({ error: "Error loading financing options" }, { status: 500 });
  }
}
