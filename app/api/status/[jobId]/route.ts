import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";

const API_URL = process.env.OPENSHORTS_API_URL || "https://api.openshorts.app";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const apiKey = process.env.OPENSHORTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENSHORTS_API_KEY belum diatur di server." },
        { status: 500 }
      );
    }

    const { jobId } = await context.params;
    if (!jobId || !/^[A-Za-z0-9._-]+$/.test(jobId)) {
      return NextResponse.json({ error: "Job ID tidak valid." }, { status: 400 });
    }

    const upstream = await fetch(`${API_URL}/api/status/${encodeURIComponent(jobId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Respons status tidak valid." };
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membaca status." },
      { status: 500 }
    );
  }
}
