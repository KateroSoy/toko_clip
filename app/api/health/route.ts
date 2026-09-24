import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    openshortsConfigured: Boolean(process.env.OPENSHORTS_API_KEY),
    authConfigured: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32),
  });
}
