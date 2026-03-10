import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-gray-800 hidden sm:block">Dashboard Gatto</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Ciao, {session.user.name?.split(" ")[0] ?? "Utente"} 👋
            </span>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-amber-50 rounded-lg transition"
            >
              🏠 I miei gatti
            </Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              >
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Dashboard Gatto · Strumento personale, non medico · WSAVA/AAHA/AAFP/ESCCAP
      </footer>
    </div>
  );
}
