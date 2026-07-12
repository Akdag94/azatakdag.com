"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace("/admin");
      } else {
        setError(data.error ?? "Hata oluştu.");
        setPin("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-80 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <Shield className="w-7 h-7 text-indigo-400" />
        </div>
        <div className="text-center">
          <h1 className="text-white font-bold text-xl">Admin Panel</h1>
          <p className="text-neutral-400 text-sm mt-1">PIN ile giriş yap</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••"
            autoFocus
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-center text-white text-2xl tracking-[0.5em] outline-none transition-colors ${
              error ? "border-red-500/60" : "border-white/10 focus:border-indigo-500/60"
            }`}
          />
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
