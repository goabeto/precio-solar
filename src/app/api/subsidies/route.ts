import { NextRequest, NextResponse } from "next/server";
import { resolveSubsidiesForAddress } from "@/lib/data";
import { isSubsidiesApiConfigured } from "@/lib/subsidies-api";

export async function POST(req: NextRequest) {
  try {
    if (!isSubsidiesApiConfigured()) {
      return NextResponse.json(
        { error: "Subsidies API not configured", configured: false },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const result = await resolveSubsidiesForAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: "Could not resolve subsidies for this address" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subsidies: result });
  } catch (err) {
    console.error("Subsidies API error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
