"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4 animate-pulse">🔄</div>
            <p className="text-gray-600">Verifica in corso...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStatus("ok");
          setTimeout(() => router.push("/login"), 2000);
        } else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <div className="text-5xl mb-4 animate-pulse">🔄</div>
            <p className="text-gray-600">Verifica in corso...</p>
          </>
        )}
        {status === "ok" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email verificata!</h2>
            <p className="text-gray-500 text-sm">Reindirizzamento al login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link non valido o scaduto</h2>
            <p className="text-gray-500 text-sm mb-4">Registrati di nuovo o contatta il supporto.</p>
            <Link href="/register" className="text-amber-600 font-semibold hover:underline text-sm">
              Torna alla registrazione →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
