// Nginx access log'larını parse ederek gerçek site istatistiklerini döner.
// Dış servis, token veya API key gerekmez.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFileSync, existsSync } from "fs";

const LOG_FILE = "/var/log/nginx/access.log";

// Combined Log Format: IP - - [date] "METHOD path HTTP" status bytes "referer" "ua"
const LOG_REGEX =
  /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) \d+ "([^"]*)" "([^"]*)"/;

interface LogEntry {
  ip: string;
  date: Date;
  method: string;
  path: string;
  status: number;
  referer: string;
  ua: string;
}

function parseLog(): LogEntry[] {
  if (!existsSync(LOG_FILE)) return [];
  const lines = readFileSync(LOG_FILE, "utf8").split("\n");
  const entries: LogEntry[] = [];
  for (const line of lines) {
    const m = line.match(LOG_REGEX);
    if (!m) continue;
    const [, ip, dateStr, method, path, status, referer, ua] = m;
    const date = new Date(dateStr.replace(":", " ").replace(/(\+\d{4})/, " $1"));
    if (isNaN(date.getTime())) continue;
    entries.push({ ip, date, method, path, status: +status, referer, ua });
  }
  return entries;
}

function getDevice(ua: string): string {
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return "Mobil";
  if (/Tablet/i.test(ua)) return "Tablet";
  return "Masaüstü";
}

function getBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  return "Diğer";
}

// Very rough country detection from Cloudflare IPs — just show "Bilinmiyor" since
// we don't have GeoIP. Real IPs are Cloudflare edge IPs (172.x), so we'll track
// unique IPs and show top paths instead.

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!session || !secret || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const all = parseLog();
    const now = Date.now();
    const DAY = 86400000;

    // Only HTML page requests (exclude static assets)
    const pageReqs = all.filter(
      (e) =>
        e.status < 400 &&
        !e.path.startsWith("/_next") &&
        !e.path.match(/\.(js|css|png|jpg|ico|svg|woff|woff2|map|json)(\?|$)/i)
    );

    const last30 = pageReqs.filter((e) => now - e.date.getTime() < 30 * DAY);
    const last7  = pageReqs.filter((e) => now - e.date.getTime() < 7 * DAY);

    // Daily chart (last 30 days)
    const dailyMap: Record<string, { visitors: Set<string>; pageviews: number }> = {};
    for (const e of last30) {
      const key = e.date.toISOString().split("T")[0];
      if (!dailyMap[key]) dailyMap[key] = { visitors: new Set(), pageviews: 0 };
      dailyMap[key].visitors.add(e.ip);
      dailyMap[key].pageviews++;
    }
    const monthly = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        day: new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        date,
        visitors: d.visitors.size,
        pageviews: d.pageviews,
      }));
    const daily = monthly.slice(-7);

    // Totals
    const uniqueIPs30 = new Set(last30.map((e) => e.ip)).size;
    const totalPageViews30 = last30.length;
    const totalRequests30 = all.filter((e) => now - e.date.getTime() < 30 * DAY).length;

    // Top pages
    const pathMap: Record<string, number> = {};
    for (const e of last30) {
      const p = e.path.split("?")[0];
      pathMap[p] = (pathMap[p] ?? 0) + 1;
    }
    const topPages = Object.entries(pathMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([path, views]) => ({ path, title: path === "/" ? "Ana Sayfa" : path, views }));

    // Browsers
    const browserMap: Record<string, number> = {};
    for (const e of last30) {
      const b = getBrowser(e.ua);
      browserMap[b] = (browserMap[b] ?? 0) + 1;
    }
    const browserColors = ["#6366f1", "#8b5cf6", "#a855f7", "#06b6d4", "#64748b"];
    const browsers = Object.entries(browserMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([browser, count], i) => ({
        browser,
        value: totalRequests30 > 0 ? Math.round((count / totalRequests30) * 100) : 0,
        color: browserColors[i] ?? "#64748b",
      }));

    // Devices
    const deviceMap: Record<string, number> = {};
    for (const e of last30) {
      const d = getDevice(e.ua);
      deviceMap[d] = (deviceMap[d] ?? 0) + 1;
    }
    const deviceColors = ["#6366f1", "#8b5cf6", "#a855f7"];
    const devices = Object.entries(deviceMap)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count], i) => ({
        device,
        value: totalRequests30 > 0 ? Math.round((count / totalRequests30) * 100) : 0,
        color: deviceColors[i] ?? "#64748b",
      }));

    // Hourly (last 7 days)
    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    for (const e of last7) hourMap[e.date.getHours()]++;
    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, "0")}:00`,
      visitors: hourMap[h],
    }));

    return NextResponse.json({
      overview: {
        totalVisitors: uniqueIPs30,
        totalPageViews: totalPageViews30,
        totalRequests: totalRequests30,
      },
      daily,
      monthly,
      topPages,
      browsers,
      devices,
      hourly,
      topCountries: [],
    });
  } catch (err) {
    console.error("Analytics parse error:", err);
    return NextResponse.json({ error: "Log parse hatası", detail: String(err) }, { status: 500 });
  }
}
