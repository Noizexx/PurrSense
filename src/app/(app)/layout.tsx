import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "Utente";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-sm">
              <Image src="/sally-logo.png" alt="Sally" width={32} height={32} />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent hidden sm:block">Sally</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Greeting chip */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-sm text-gray-600">
              <span>👋</span>
              <span className="font-medium">{firstName}</span>
            </div>

            <Link href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-orange-50 rounded-xl transition">
              <span>🏡</span>
              <span className="hidden sm:inline">I miei gatti</span>
            </Link>

            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition">
                <span>🚪</span>
                <span className="hidden sm:inline">Esci</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 flex items-center justify-center gap-1">
        <span>🐾</span> Sally · Strumento personale, non medico · WSAVA/AAHA/AAFP/ESCCAP
      </footer>
    </div>
  );
}
