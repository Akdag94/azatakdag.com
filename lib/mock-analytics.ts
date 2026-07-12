export const overviewStats = [
  { label: "Toplam Ziyaretçi",  value: "24,831", change: "+12.4%", up: true,  icon: "Users" },
  { label: "Sayfa Görüntüleme", value: "87,402", change: "+8.7%",  up: true,  icon: "Eye" },
  { label: "Ort. Oturum Süresi",value: "2m 47s", change: "+5.2%",  up: true,  icon: "Clock" },
  { label: "Hemen Çıkma Oranı", value: "38.2%",  change: "-3.1%",  up: true,  icon: "LogOut" },
  { label: "Geri Dönen Kullanıcı", value: "9,204", change: "+14.1%", up: true, icon: "RefreshCw" },
  { label: "Yeni Kullanıcı",    value: "15,627", change: "+10.8%", up: true,  icon: "UserPlus" },
  { label: "Toplam Tıklama",   value: "142,300", change: "+6.3%",  up: true,  icon: "MousePointer" },
  { label: "İletişim Formu",   value: "318",     change: "+22.5%", up: true,  icon: "Mail" },
];

export const dailyVisitors = [
  { day: "Pzt", visitors: 1240, pageviews: 3120 },
  { day: "Sal", visitors: 980,  pageviews: 2540 },
  { day: "Çar", visitors: 1540, pageviews: 4210 },
  { day: "Per", visitors: 1380, pageviews: 3890 },
  { day: "Cum", visitors: 1820, pageviews: 5340 },
  { day: "Cmt", visitors: 2100, pageviews: 6120 },
  { day: "Paz", visitors: 1760, pageviews: 4980 },
];

export const monthlyVisitors = [
  { month: "Oca", visitors: 12400 },
  { month: "Şub", visitors: 14800 },
  { month: "Mar", visitors: 17200 },
  { month: "Nis", visitors: 15600 },
  { month: "May", visitors: 21300 },
  { month: "Haz", visitors: 19800 },
  { month: "Tem", visitors: 23400 },
  { month: "Ağu", visitors: 22100 },
  { month: "Eyl", visitors: 24800 },
  { month: "Eki", visitors: 26300 },
  { month: "Kas", visitors: 24100 },
  { month: "Ara", visitors: 28700 },
];

export const topPages = [
  { path: "/",             title: "Ana Sayfa",        views: 34210, bounce: "32%", avgTime: "3m 12s" },
  { path: "#projects",     title: "Projeler",          views: 18430, bounce: "41%", avgTime: "2m 48s" },
  { path: "#about",        title: "Hakkımda",          views: 14820, bounce: "38%", avgTime: "2m 05s" },
  { path: "#contact",      title: "İletişim",          views: 9340,  bounce: "28%", avgTime: "1m 54s" },
  { path: "#timeline",     title: "Yolculuk",          views: 7120,  bounce: "45%", avgTime: "3m 30s" },
  { path: "#interests",    title: "İlgi Alanları",     views: 5680,  bounce: "50%", avgTime: "1m 22s" },
];

export const trafficSources = [
  { source: "Organik Arama",  value: 38, color: "#6366f1" },
  { source: "Direkt",         value: 24, color: "#8b5cf6" },
  { source: "Sosyal Medya",   value: 18, color: "#a855f7" },
  { source: "Yönlendirme",    value: 12, color: "#06b6d4" },
  { source: "E-posta",        value: 5,  color: "#10b981" },
  { source: "Diğer",          value: 3,  color: "#f59e0b" },
];

export const deviceStats = [
  { device: "Mobil",  value: 58, color: "#6366f1" },
  { device: "Masaüstü", value: 34, color: "#8b5cf6" },
  { device: "Tablet", value: 8,  color: "#a855f7" },
];

export const topCountries = [
  { country: "Türkiye",       flag: "🇹🇷", visitors: 14230, percent: 57.3 },
  { country: "Almanya",       flag: "🇩🇪", visitors: 3120,  percent: 12.6 },
  { country: "Amerika",       flag: "🇺🇸", visitors: 2840,  percent: 11.4 },
  { country: "Hollanda",      flag: "🇳🇱", visitors: 1480,  percent: 5.9  },
  { country: "İngiltere",     flag: "🇬🇧", visitors: 980,   percent: 3.9  },
  { country: "Fransa",        flag: "🇫🇷", visitors: 720,   percent: 2.9  },
  { country: "Diğer",         flag: "🌍", visitors: 1461,  percent: 5.9  },
];

export const recentActivity = [
  { time: "2 dk önce",  event: "Yeni ziyaretçi",     detail: "İstanbul, TR",  icon: "UserPlus",    color: "text-green-400" },
  { time: "5 dk önce",  event: "İletişim formu",      detail: "info@ornek.com", icon: "Mail",        color: "text-blue-400" },
  { time: "12 dk önce", event: "Proje linki tıklandı",detail: "azap.online",   icon: "ExternalLink",color: "text-purple-400" },
  { time: "18 dk önce", event: "Yeni ziyaretçi",     detail: "Berlin, DE",    icon: "UserPlus",    color: "text-green-400" },
  { time: "24 dk önce", event: "CV indirildi",        detail: "LinkedIn yönl.", icon: "Download",    color: "text-yellow-400" },
  { time: "31 dk önce", event: "İletişim formu",      detail: "test@test.com", icon: "Mail",        color: "text-blue-400" },
  { time: "45 dk önce", event: "Proje linki tıklandı",detail: "greennovatarim.com", icon: "ExternalLink", color: "text-purple-400" },
  { time: "1 sa önce",  event: "Yeni ziyaretçi",     detail: "Amsterdam, NL", icon: "UserPlus",    color: "text-green-400" },
];

export const performanceMetrics = [
  { metric: "Lighthouse Skor",      value: 98,   unit: "/100",  status: "excellent" },
  { metric: "Core Web Vitals LCP",  value: 0.8,  unit: "s",     status: "excellent" },
  { metric: "Core Web Vitals FID",  value: 12,   unit: "ms",    status: "excellent" },
  { metric: "Core Web Vitals CLS",  value: 0.02, unit: "",      status: "excellent" },
  { metric: "Sayfa Yükleme Süresi", value: 1.2,  unit: "s",     status: "good" },
  { metric: "TTFB",                 value: 180,  unit: "ms",    status: "good" },
  { metric: "SEO Skoru",            value: 96,   unit: "/100",  status: "excellent" },
  { metric: "Erişilebilirlik",      value: 92,   unit: "/100",  status: "good" },
];

export const browserStats = [
  { browser: "Chrome",  value: 62, color: "#6366f1" },
  { browser: "Safari",  value: 18, color: "#8b5cf6" },
  { browser: "Firefox", value: 9,  color: "#a855f7" },
  { browser: "Edge",    value: 7,  color: "#06b6d4" },
  { browser: "Diğer",   value: 4,  color: "#64748b" },
];

export const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  visitors: Math.floor(
    80 + Math.sin((i - 6) * (Math.PI / 12)) * 60 + Math.random() * 30
  ),
}));

export const projectClicks = [
  { project: "Greennovatarım", clicks: 4820, color: "#10b981" },
  { project: "ERP Sistemi",    clicks: 3140, color: "#6366f1" },
  { project: "Azap Online",    clicks: 5630, color: "#8b5cf6" },
];
