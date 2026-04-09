import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "AI chat not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!res.ok) {
      console.error("ElevenLabs signed URL error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to get chat session" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
