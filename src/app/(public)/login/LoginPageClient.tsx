"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
          <div className="text-5xl animate-bounce">🐾</div>
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
        setError(res.error === "EMAIL_NOT_VERIFIED"
          ? "📧 Email non verificata. Controlla la tua casella di posta."
          : "❌ Email o password non corretti.");
      } else {
        router.push(callbackUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-200 opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-200 opacity-20 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 to-orange-400 shadow-xl shadow-amber-200 mb-4">
            <Image src="/sally-logo.png" alt="Sally" width={52} height={52} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Sally</h1>
          <p className="text-sm text-gray-500 mt-1">Bentornato/a! 🐾</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-50 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">📧</span>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputCls} placeholder="micio@example.com" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔒</span>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputCls} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition mt-2">
              {loading ? "⏳ Accesso in corso..." : "Accedi →"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-400">
            Non hai un account?{" "}
            <Link href="/register" className="text-amber-500 font-bold hover:text-orange-500 transition">
              Registrati gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
