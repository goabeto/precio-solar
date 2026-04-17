import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

const BUCKET = "proposal-uploads";

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Storage not available" }, { status: 503 });
    }

    const formData = await req.formData();
    const postalCode = (formData.get("postalCode") as string) || "unknown";
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls: string[] = [];
    const ts = Date.now();

    for (const file of files) {
      if (!file || file.size === 0) continue;

      // Sanitize filename
      const ext = file.name.split(".").pop() || "bin";
      const safeName = `${postalCode}-${ts}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const path = `proposals/${safeName}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, arrayBuffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        console.error("Upload failed:", error.message);
        continue;
      }

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(publicData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;
