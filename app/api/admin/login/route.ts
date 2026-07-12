import { NextRequest, NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 dakika

const attempts = new Map<string, { count: number; firstAt: number }>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const now = Date.now();

  const record = attempts.get(ip);
  if (record) {
    if (now - record.firstAt < LOCKOUT_MS && record.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (now - record.firstAt)) / 60000);
      return NextResponse.json(
        { error: `Çok fazla hatalı deneme. ${remaining} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }
    if (now - record.firstAt >= LOCKOUT_MS) {
      attempts.delete(ip);
    }
  }

  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const correctPin = process.env.ADMIN_PIN;

  if (!correctPin) {
    console.error("ADMIN_PIN environment variable is not set.");
    return NextResponse.json({ error: "Sunucu yapılandırma hatası." }, { status: 500 });
  }

  if (!body.pin || body.pin !== correctPin) {
    const existing = attempts.get(ip) ?? { count: 0, firstAt: now };
    attempts.set(ip, { count: existing.count + 1, firstAt: existing.firstAt });
    return NextResponse.json({ error: "Yanlış PIN." }, { status: 401 });
  }

  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", process.env.ADMIN_SESSION_SECRET ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 saat
  });

  return res;
}
