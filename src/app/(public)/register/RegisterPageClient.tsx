"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        if (res.status === 409) {
          setGlobalError("Email già registrata. Prova ad accedere.");
        } else if (typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setGlobalError(data.error ?? "Errore durante la registrazione.");
        }
        return;
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl mb-4 block">🐾</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Quasi fatto!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Abbiamo inviato un&apos;email di verifica a{" "}
            <strong>{form.email}</strong>.<br />
            Clicca il link nell&apos;email per attivare il tuo account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-amber-600 font-semibold hover:underline text-sm"
          >
            Vai al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐾</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Crea un account</h1>
          <p className="text-sm text-gray-500 mt-1">Inizia a monitorare il tuo gatto</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {globalError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                placeholder="Il tuo nome"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                placeholder="micio@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                placeholder="••••••••"
              />
              <p className="text-gray-400 text-xs mt-1">
                Min. 8 caratteri, una maiuscola e un numero.
              </p>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition"
            >
              {loading ? "Registrazione in corso..." : "Registrati"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Hai già un account?{" "}
            <Link href="/login" className="text-amber-600 font-semibold hover:underline">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
