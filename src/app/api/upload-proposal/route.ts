import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

const BUCKET = "proposal-uploads";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (matches bucket policy)
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

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

    // Validate all files up-front so we fail fast with a clear message.
    for (const file of files) {
      if (!file || file.size === 0) continue;
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `El archivo "${file.name}" supera el tamano maximo de 10 MB.` },
          { status: 413 }
        );
      }
      if (file.type && !ALLOWED_MIMES.has(file.type)) {
        return NextResponse.json(
          { error: `Formato no permitido para "${file.name}". Solo PDF, PNG, JPG o WebP.` },
          { status: 415 }
        );
      }
    }

    const urls: string[] = [];
    const failures: string[] = [];
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
        failures.push(file.name);
        continue;
      }

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(publicData.publicUrl);
    }

    // If every file failed, tell the client — don't return an empty success.
    if (urls.length === 0 && failures.length > 0) {
      return NextResponse.json(
        { error: "No pudimos subir ningun archivo. Intentalo de nuevo.", failed: failures },
        { status: 502 }
      );
    }

    return NextResponse.json({ urls, failed: failures });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;
