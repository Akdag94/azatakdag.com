"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Eye, LogOut, BarChart2, Smartphone,
  Monitor, Activity, RefreshCw,
} from "lucide-react";

// Tüm veriler /api/admin/analytics üzerinden nginx access.log'dan gelir.
// Temsili/mock veri kullanılmaz: log'dan türetilemeyen metrikler gösterilmez.

interface AnalyticsData {
  overview: { totalVisitors: number; totalPageViews: number; totalRequests: number };
  daily: { day: string; date: string; visitors: number; pageviews: number }[];
  monthly: { day: string; date: string; visitors: number; pageviews: number }[];
  topPages: { path: string; title: string; views: number }[];
  browsers: { browser: string; value: number; color: string }[];
  devices: { device: string; value: number; color: string }[];
  hourly: { hour: string; visitors: number }[];
  topCountries: { country: string; visitors: number; percent: number }[];
}

const iconMap: Record<string, React.ElementType> = {
  Users, Eye, RefreshCw, Activity,
};

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const Icon = iconMap[icon] ?? Activity;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/8 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-neutral-500">son 30 gün</p>
    </div>
  );
}

function DonutChart({ data }: { data: { device?: string; browser?: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return <EmptyState />;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const segments = data.reduce<{ dash: number; offset: number; color: string }[]>((acc, d) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    acc.push({ dash: (d.value / total) * circ, offset, color: d.color });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="80" cy="80" r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
            className="transition-all duration-700"
          />
        ))}
      </svg>
      <ul className="flex flex-col gap-2 flex-1">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-neutral-300 flex-1 truncate">{d.device ?? d.browser}</span>
            <span className="text-white font-semibold">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChartSimple({ data, keys }: {
  data: { day?: string; hour?: string; visitors?: number; pageviews?: number }[];
  keys: { key: string; color: string; label: string }[];
}) {
  if (!data.length) return <EmptyState />;
  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => keys.map((k) => (d as Record<string, number>)[k.key] ?? 0))
  );
  const labelKey = data[0]?.day !== undefined ? "day" : "hour";

  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
          <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "120px" }}>
            {keys.map((k) => {
              const val = (d as Record<string, number>)[k.key] ?? 0;
              const h = (val / maxVal) * 100;
              return (
                <div key={k.key} className="relative flex-1 rounded-t-sm transition-all duration-500 cursor-pointer"
                  style={{ height: `${h}%`, backgroundColor: k.color, opacity: 0.8 }}
                  title={`${k.label}: ${val}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-neutral-500 truncate max-w-full text-center">
            {(d as Record<string, string>)[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="text-xs text-neutral-500 py-8 text-center">
      Henüz yeterli veri yok — nginx access.log dolmaya başladığında burada görünecek.
    </p>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "traffic">("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const todayViews =
    analytics?.daily?.length ? analytics.daily[analytics.daily.length - 1].pageviews : 0;

  const overviewStats = analytics?.overview ? [
    { label: "Toplam Ziyaretçi",  value: analytics.overview.totalVisitors.toLocaleString("tr-TR"),  icon: "Users" },
    { label: "Sayfa Görüntüleme", value: analytics.overview.totalPageViews.toLocaleString("tr-TR"), icon: "Eye" },
    { label: "Toplam İstek",      value: analytics.overview.totalRequests.toLocaleString("tr-TR"),  icon: "Activity" },
    { label: "Bugünkü Görüntüleme", value: todayViews.toLocaleString("tr-TR"),                      icon: "RefreshCw" },
  ] : [];

  const dailyVisitors = analytics?.daily ?? [];
  const monthlyVisitors = analytics?.monthly ?? [];
  const topPages = analytics?.topPages ?? [];
  const deviceStats = analytics?.devices ?? [];
  const browserStats = analytics?.browsers ?? [];
  const hourly = analytics?.hourly ?? [];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Admin Dashboard</h1>
            <p className="text-xs text-neutral-500">azatakdag.com · nginx log verisi</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
        >
          <LogOut className="w-3.5 h-3.5" /> Çıkış
        </button>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-6 flex gap-2 flex-wrap">
        {(["overview", "traffic"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}
          >
            {{ overview: "Genel Bakış", traffic: "Trafik" }[tab]}
          </button>
        ))}
      </div>

      <main className="p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* ── GENEL BAKIŞ ── */}
        {activeTab === "overview" && (
          <>
            {loading ? (
              <div className="text-center text-neutral-500 py-8">Veriler yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {overviewStats.map((s) => <StatCard key={s.label} {...s} />)}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Haftalık Trafik</h2>
                <p className="text-xs text-neutral-500 mb-4">Son 7 gün — ziyaretçi ve sayfa görüntüleme</p>
                <BarChartSimple
                  data={dailyVisitors}
                  keys={[
                    { key: "visitors",  color: "#6366f1", label: "Ziyaretçi" },
                    { key: "pageviews", color: "#a855f7", label: "Görüntüleme" },
                  ]}
                />
                <div className="flex gap-4 mt-3">
                  {[{ color: "#6366f1", label: "Ziyaretçi" }, { color: "#a855f7", label: "Sayfa Görüntüleme" }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" /> Cihaz Dağılımı
                </h2>
                <DonutChart data={deviceStats} />
              </div>
            </div>

            {/* En çok ziyaret edilen sayfalar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">En Çok Ziyaret Edilen Sayfalar</h2>
              {topPages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-white/10">
                        <th className="text-xs text-neutral-400 font-medium pb-3">Sayfa</th>
                        <th className="text-xs text-neutral-400 font-medium pb-3 text-right">Görüntüleme (30 gün)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {topPages.map((p) => (
                        <tr key={p.path} className="hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <p className="text-white font-medium text-xs">{p.title}</p>
                            <p className="text-neutral-500 text-xs">{p.path}</p>
                          </td>
                          <td className="py-3 text-right text-white text-xs">{p.views.toLocaleString("tr-TR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TRAFİK ── */}
        {activeTab === "traffic" && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Aylık Trafik Trendi</h2>
              <p className="text-xs text-neutral-500 mb-4">Son 30 gün — günlük ziyaretçi</p>
              <BarChartSimple
                data={monthlyVisitors}
                keys={[{ key: "visitors", color: "#6366f1", label: "Ziyaretçi" }]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-400" /> Tarayıcı Dağılımı
                </h2>
                <DonutChart data={browserStats} />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Saatlik Trafik Dağılımı</h2>
                <p className="text-xs text-neutral-500 mb-4">Son 7 günün saatlere göre yoğunluğu</p>
                <BarChartSimple
                  data={hourly}
                  keys={[{ key: "visitors", color: "#8b5cf6", label: "Ziyaretçi" }]}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
