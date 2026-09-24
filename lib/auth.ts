import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ACCOUNT_PASSWORD_SHA256 } from "./accounts";

const COOKIE_NAME = "tokoclip_session";
const SESSION_SECONDS = 60 * 60 * 12; // 12 hours

type SessionPayload = {
  username: string;
  exp: number;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET wajib diisi minimal 32 karakter.");
  }
  return secret;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(encodedPayload: string) {
  return createHmac("sha256", authSecret()).update(encodedPayload).digest("base64url");
}

function constantTimeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export function verifyCredentials(usernameRaw: string, password: string) {
  const username = usernameRaw.trim().toLowerCase();
  const expected = ACCOUNT_PASSWORD_SHA256[username];
  if (!expected || !password) return false;

  const actual = createHash("sha256").update(password).digest("hex");
  return constantTimeEqual(actual, expected);
}

export async function createSession(usernameRaw: string) {
  const username = usernameRaw.trim().toLowerCase();
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  };
  const encoded = encodePayload(payload);
  const token = `${encoded}.${sign(encoded)}`;
  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    const expectedSignature = sign(encoded);
    if (!constantTimeEqual(signature, expectedSignature)) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.username || !payload?.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!(payload.username in ACCOUNT_PASSWORD_SHA256)) return null;

    return payload;
  } catch {
    return null;
  }
}
