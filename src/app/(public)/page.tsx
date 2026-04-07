import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-sm">
              <Image src="/sally-logo.png" alt="Sally" width={32} height={32} />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Sally</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-orange-50 rounded-xl transition">
              Accedi
            </Link>
            <Link href="/register"
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-md shadow-amber-200 transition">
              Inizia gratis ✨
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative">
        {/* decorative blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-amber-200 opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-orange-200 opacity-30 blur-3xl pointer-events-none" />

        <div className="relative mb-6">
          <div className="text-8xl drop-shadow-lg select-none">🐱</div>
          <div className="absolute -top-2 -right-2 text-3xl animate-bounce">✨</div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
          Il benessere del tuo gatto,<br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">sempre sotto controllo</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Monitora peso, alimentazione, salute e prevenzione.<br />
          Log giornalieri, grafici, alert e condivisione col veterinario.
        </p>
        <Link href="/register"
          className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl shadow-xl shadow-amber-200 transition hover:-translate-y-0.5 active:translate-y-0">
          Inizia gratis →
        </Link>
        <p className="mt-4 text-sm text-gray-400">🔒 Nessuna carta di credito richiesta</p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: "📈", bg: "from-blue-100 to-sky-100", title: "Grafici & Trend", desc: "Peso, alimentazione, gioco e shedding negli ultimi 30 giorni." },
          { icon: "🔔", bg: "from-amber-100 to-yellow-100", title: "Alert Automatici", desc: "Notifiche su BCS, variazioni di peso e scadenze vaccini." },
          { icon: "💉", bg: "from-rose-100 to-pink-100", title: "Prevenzione", desc: "Timeline vaccini, antiparassitari e sterilizzazione con promemoria." },
          { icon: "🐈", bg: "from-orange-100 to-amber-100", title: "Più gatti", desc: "Aggiungi tutti i tuoi gatti. Ognuno con il suo profilo completo." },
          { icon: "🔗", bg: "from-violet-100 to-purple-100", title: "Vet-Share", desc: "Genera un link sicuro per condividere i dati con il veterinario." },
          { icon: "📤", bg: "from-emerald-100 to-teal-100", title: "Export CSV/JSON", desc: "Scarica tutti i dati in qualsiasi momento." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-5 shadow-md shadow-orange-50 border border-orange-50 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.bg} flex items-center justify-center text-2xl mb-4 shadow-sm`}>
              {f.icon}
            </div>
            <h3 className="font-bold text-gray-800 mb-1.5">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto w-full px-6 pb-8">
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-700 text-center flex items-center justify-center gap-2">
          <span className="text-base">🩺</span>
          Strumento di monitoraggio personale — non sostituisce la visita veterinaria. Range indicativi (WSAVA/AAHA/AAFP).
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 pb-6 flex items-center justify-center gap-1.5">
        <span>🐾</span> Sally · WSAVA · AAHA/AAFP 2020 · ESCCAP IT · Cornell Feline Health Center
      </footer>
    </main>
  );
}
