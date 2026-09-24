import { NextResponse } from "next/server";
import { buildOpenShortsProcessPayload, parseOpenShortsResponse } from "../../../lib/openshorts.mjs";
import { getSession } from "../../../lib/auth";

const API_URL = process.env.OPENSHORTS_API_URL || "https://api.openshorts.app";

export async function POST(request: Request) {
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

    const body = await request.json();
    const url = String(body?.url || "").trim();
    const acknowledged = Boolean(body?.acknowledged);

    if (!url) {
      return NextResponse.json({ error: "URL video wajib diisi." }, { status: 400 });
    }

    if (!acknowledged) {
      return NextResponse.json(
        { error: "Konfirmasi hak penggunaan video diperlukan." },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Format URL tidak valid." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "URL harus menggunakan http/https." }, { status: 400 });
    }

    const upstream = await fetch(`${API_URL}/api/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildOpenShortsProcessPayload(url)),
      cache: "no-store",
    });

    const text = await upstream.text();
    const data: unknown = parseOpenShortsResponse(text);

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memulai proses." },
      { status: 500 }
    );
  }
}
