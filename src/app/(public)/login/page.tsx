"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <span className="text-5xl mb-4 animate-pulse block">🐾</span>
            <p className="text-gray-600">Caricamento pagina di login...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") {
          setError("Email non verificata. Controlla la tua casella di posta.");
        } else {
          setError("Email o password non corretti.");
        }
      } else {
        router.push(callbackUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐾</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Bentornato</h1>
          <p className="text-sm text-gray-500 mt-1">Accedi al tuo account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}
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
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Non hai un account?{" "}
            <Link href="/register" className="text-amber-600 font-semibold hover:underline">
              Registrati gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
