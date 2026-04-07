"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPageClient() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setGlobalError("📧 Email già registrata. Prova ad accedere.");
        else if (typeof data.error === "object") setErrors(data.error);
        else setGlobalError(data.error ?? "Errore durante la registrazione.");
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition bg-gray-50 focus:bg-white";

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-50 p-10">
          <div className="text-6xl mb-4 block">🎉</div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-3">Quasi fatto!</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Abbiamo inviato un&apos;email di verifica a{" "}
            <strong className="text-amber-600">{form.email}</strong>.<br />
            Clicca il link nell&apos;email per attivare il tuo account.
          </p>
          <Link href="/login"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition text-sm">
            Vai al login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-200 opacity-20 blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-orange-200 opacity-20 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 to-orange-400 shadow-xl shadow-amber-200 mb-4">
            <Image src="/sally-logo.png" alt="Sally" width={52} height={52} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Sally</h1>
          <p className="text-sm text-gray-500 mt-1">Crea il tuo account gratuito 🐾</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-50 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 text-center">
                {globalError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Il tuo nome</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">😸</span>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls} placeholder="Mario Rossi" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 pl-1">⚠️ {errors.name[0]}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">📧</span>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputCls} placeholder="micio@example.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">⚠️ {errors.email[0]}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔒</span>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputCls} placeholder="••••••••" />
              </div>
              <p className="text-gray-400 text-xs mt-1.5 pl-1">Min. 8 caratteri, una maiuscola e un numero.</p>
              {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">⚠️ {errors.password[0]}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition mt-2">
              {loading ? "⏳ Registrazione in corso..." : "Registrati gratis ✨"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-400">
            Hai già un account?{" "}
            <Link href="/login" className="text-amber-500 font-bold hover:text-orange-500 transition">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
