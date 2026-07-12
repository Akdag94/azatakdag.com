"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Eye, LogOut, BarChart2, Globe, Smartphone,
  Monitor, Zap, Activity, ChevronUp, TrendingDown, RefreshCw, Mail,
} from "lucide-react";
import {
  topPages, recentActivity, performanceMetrics,
  trafficSources, hourlyTraffic, projectClicks,
} from "@/lib/mock-analytics";

interface AnalyticsData {
  overview: { totalVisitors: number; totalPageViews: number; totalRequests: number };
  daily: { day: string; date: string; visitors: number; pageviews: number }[];
  monthly: { day: string; date: string; visitors: number; pageviews: number }[];
  topCountries: { country: string; visitors: number; percent: number }[];
  browsers: { browser: string; value: number; color: string }[];
  devices: { device: string; value: number; color: string }[];
}

const iconMap: Record<string, React.ElementType> = {
  Users, Eye, LogOut, RefreshCw, Mail, Activity,
};


function StatCard({ label, value, change, up, icon }: {
  label: string; value: string; change: string; up: boolean; icon: string;
}) {
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
      <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
        {up ? <ChevronUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change} <span className="text-neutral-500 font-normal ml-1">geçen aya göre</span>
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

function DonutChart({ data }: { data: { source?: string; device?: string; browser?: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
        {data.map((d, i) => {
          const dash = (d.value / total) * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx="80" cy="80" r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="flex flex-col gap-2 flex-1">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-neutral-300 flex-1 truncate">{d.source ?? d.device ?? d.browser}</span>
            <span className="text-white font-semibold">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChartSimple({ data, keys }: {
  data: { day?: string; month?: string; hour?: string; visitors?: number; pageviews?: number }[];
  keys: { key: string; color: string; label: string }[];
}) {
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => (d as Record<string, number>)[k.key] ?? 0)));
  const labelKey = data[0]?.day ? "day" : data[0]?.month ? "month" : "hour";

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "performance" | "realtime">("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const overviewStats = analytics?.overview ? [
    { label: "Toplam Ziyaretçi",  value: analytics.overview.totalVisitors.toLocaleString(),  change: "", up: true, icon: "Users" },
    { label: "Sayfa Görüntüleme", value: analytics.overview.totalPageViews.toLocaleString(), change: "", up: true, icon: "Eye" },
    { label: "Toplam İstek",      value: analytics.overview.totalRequests.toLocaleString(),  change: "", up: true, icon: "Activity" },
    { label: "Aktif Kullanıcı",   value: "Canlı",                                            change: "", up: true, icon: "RefreshCw" },
  ] : [];

  const dailyVisitors = analytics?.daily ?? [];
  const monthlyVisitors = analytics?.monthly ?? [];
  const topCountries = analytics?.topCountries ?? [];
  const deviceStats = analytics?.devices ?? [];
  const browserStats = analytics?.browsers ?? [];

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
            <p className="text-xs text-neutral-500">azatakdag.com</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-neutral-400">Canlı</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            <LogOut className="w-3.5 h-3.5" /> Çıkış
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-6 flex gap-2 flex-wrap">
        {(["overview", "traffic", "performance", "realtime"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}
          >
            {{ overview: "Genel Bakış", traffic: "Trafik", performance: "Performans", realtime: "Gerçek Zamanlı" }[tab]}
          </button>
        ))}
      </div>

      <main className="p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* Stat cards */}
            {loading ? (
              <div className="text-center text-neutral-500 py-8">Veriler yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {overviewStats.map((s) => <StatCard key={s.label} {...s} />)}
              </div>
            )}

            {/* Daily Bar + Donut row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Haftalık Trafik</h2>
                <p className="text-xs text-neutral-500 mb-4">Ziyaretçi ve sayfa görüntüleme karşılaştırması</p>
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
                <h2 className="text-sm font-semibold text-white mb-1">Trafik Kaynakları</h2>
                <p className="text-xs text-neutral-500 mb-4">Bu ay</p>
                <DonutChart data={trafficSources} />
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">En Çok Ziyaret Edilen Sayfalar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-white/10">
                      <th className="text-xs text-neutral-400 font-medium pb-3">Sayfa</th>
                      <th className="text-xs text-neutral-400 font-medium pb-3 text-right">Görüntüleme</th>
                      <th className="text-xs text-neutral-400 font-medium pb-3 text-right">Hemen Çıkma</th>
                      <th className="text-xs text-neutral-400 font-medium pb-3 text-right">Ort. Süre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topPages.map((p) => (
                      <tr key={p.path} className="hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div>
                            <p className="text-white font-medium text-xs">{p.title}</p>
                            <p className="text-neutral-500 text-xs">{p.path}</p>
                          </div>
                        </td>
                        <td className="py-3 text-right text-white text-xs">{p.views.toLocaleString()}</td>
                        <td className="py-3 text-right text-xs text-neutral-300">{p.bounce}</td>
                        <td className="py-3 text-right text-xs text-neutral-300">{p.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Countries + Project clicks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" /> Ülkelere Göre Ziyaretçi
                </h2>
                <div className="space-y-3">
                  {topCountries.map((c) => (
                    <div key={c.country}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-300 flex items-center gap-1.5">{c.country}</span>
                        <span className="text-xs text-white font-medium">{c.visitors.toLocaleString()} <span className="text-neutral-500">({c.percent}%)</span></span>
                      </div>
                      <MiniBar value={c.percent} max={100} color="#6366f1" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Proje Tıklamaları</h2>
                <div className="space-y-4">
                  {projectClicks.map((p) => (
                    <div key={p.project}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-300">{p.project}</span>
                        <span className="text-xs text-white font-semibold">{p.clicks.toLocaleString()}</span>
                      </div>
                      <MiniBar value={p.clicks} max={6000} color={p.color} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" /> Cihaz Dağılımı
                  </h3>
                  <DonutChart data={deviceStats} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TRAFFIC TAB ── */}
        {activeTab === "traffic" && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Aylık Trafik Trendi</h2>
              <p className="text-xs text-neutral-500 mb-4">12 aylık ziyaretçi dağılımı</p>
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
                <h2 className="text-sm font-semibold text-white mb-4">Trafik Kaynakları Detay</h2>
                <div className="space-y-3">
                  {trafficSources.map((s) => (
                    <div key={s.source}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-neutral-300">{s.source}</span>
                        <span className="text-xs text-white font-semibold">{s.value}%</span>
                      </div>
                      <MiniBar value={s.value} max={100} color={s.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Saatlik Trafik Dağılımı</h2>
              <p className="text-xs text-neutral-500 mb-4">Gün içindeki yoğunluk profili</p>
              <BarChartSimple
                data={hourlyTraffic}
                keys={[{ key: "visitors", color: "#8b5cf6", label: "Ziyaretçi" }]}
              />
            </div>
          </>
        )}

        {/* ── PERFORMANCE TAB ── */}
        {activeTab === "performance" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {performanceMetrics.map((m) => (
                <div key={m.metric} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-neutral-400 mb-2">{m.metric}</p>
                  <p className="text-2xl font-bold text-white">{m.value}<span className="text-sm text-neutral-500">{m.unit}</span></p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${m.status === "excellent" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {m.status === "excellent" ? "Mükemmel" : "İyi"}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Core Web Vitals
                </h2>
                <div className="space-y-4">
                  {[
                    { name: "LCP (Largest Contentful Paint)", value: 0.8, max: 4.0, good: 2.5, color: "#10b981" },
                    { name: "FID (First Input Delay)",        value: 12,  max: 300, good: 100, color: "#10b981" },
                    { name: "CLS (Cumulative Layout Shift)",  value: 0.02,max: 0.25,good: 0.1, color: "#10b981" },
                    { name: "TTFB (Time to First Byte)",      value: 180, max: 800, good: 600, color: "#6366f1" },
                  ].map((v) => (
                    <div key={v.name}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-neutral-300">{v.name}</span>
                        <span className="text-xs text-white font-semibold">{v.value}</span>
                      </div>
                      <MiniBar value={v.value} max={v.max} color={v.color} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Lighthouse Skorları</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Performans",    score: 98, color: "#10b981" },
                    { name: "Erişilebilirlik", score: 92, color: "#6366f1" },
                    { name: "SEO",           score: 96, color: "#8b5cf6" },
                    { name: "Best Practices", score: 100, color: "#f59e0b" },
                  ].map((s) => (
                    <div key={s.name} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={s.color} strokeWidth="3"
                            strokeDasharray={`${s.score} ${100 - s.score}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{s.score}</span>
                      </div>
                      <p className="text-xs text-neutral-400">{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── REALTIME TAB ── */}
        {activeTab === "realtime" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Şu An Aktif",      value: "47",    icon: <Activity className="w-4 h-4 text-green-400" />,  color: "text-green-400" },
                { label: "Bu Saat Ziyaret",  value: "284",   icon: <Users className="w-4 h-4 text-blue-400" />,     color: "text-blue-400" },
                { label: "Bugünkü Formlar",  value: "12",    icon: <Mail className="w-4 h-4 text-purple-400" />,    color: "text-purple-400" },
                { label: "Aktif Oturumlar",  value: "52",    icon: <Eye className="w-4 h-4 text-indigo-400" />,     color: "text-indigo-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-neutral-400">{s.label}</span>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Son Aktiviteler
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </h2>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => {
                    const Icon = iconMap[a.icon] ?? Activity;
                    return (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-3.5 h-3.5 ${a.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white">{a.event}</p>
                          <p className="text-xs text-neutral-500 truncate">{a.detail}</p>
                        </div>
                        <span className="text-[10px] text-neutral-600 shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Saatlik Trafik (Bugün)</h2>
                <BarChartSimple
                  data={hourlyTraffic.slice(6, 24)}
                  keys={[{ key: "visitors", color: "#10b981", label: "Ziyaretçi" }]}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
