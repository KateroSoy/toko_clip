import { NextResponse } from "next/server";
import { createSession, verifyCredentials } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body?.username || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    }

    if (!verifyCredentials(username, password)) {
      // Deliberately generic so callers cannot enumerate valid usernames.
      return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
    }

    await createSession(username);
    return NextResponse.json({ ok: true, username });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login gagal." },
      { status: 500 }
    );
  }
}
