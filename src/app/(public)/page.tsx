import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐾</span>
          <span className="font-bold text-xl text-gray-800">Dashboard Gatto</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-white rounded-xl shadow-sm transition"
          >
            Registrati gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="text-7xl mb-6">🐱</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          Il benessere del tuo gatto,<br />
          <span className="text-amber-500">sempre sotto controllo</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-8">
          Monitora peso, alimentazione, salute e prevenzione del tuo gatto.
          Log giornalieri, grafici, alert automatici e condivisione con il veterinario.
        </p>
        <Link
          href="/register"
          className="px-8 py-4 text-lg font-semibold bg-amber-400 hover:bg-amber-500 text-white rounded-2xl shadow-md transition"
        >
          Inizia gratis →
        </Link>
        <p className="mt-4 text-sm text-gray-400">Nessuna carta di credito richiesta</p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: "📊", title: "Grafici & Trend", desc: "Peso, alimentazione, gioco e shedding negli ultimi 30 giorni." },
          { icon: "🔔", title: "Alert Automatici", desc: "Notifiche su BCS, variazioni di peso e scadenze vaccini/antiparassitari." },
          { icon: "💉", title: "Prevenzione", desc: "Timeline vaccini, antiparassitari e sterilizzazione con promemoria." },
          { icon: "🐈", title: "Più gatti", desc: "Aggiungi tutti i tuoi gatti. Ognuno con il suo profilo completo." },
          { icon: "🔗", title: "Vet-Share", desc: "Genera un link sicuro per condividere i dati con il veterinario." },
          { icon: "📤", title: "Export CSV/JSON", desc: "Scarica tutti i dati in qualsiasi momento." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto w-full px-6 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 text-center">
          ⚠️ Strumento di monitoraggio personale — non sostituisce la visita veterinaria.
          I range indicati sono orientativi (WSAVA/AAHA/AAFP). Consulta sempre il tuo veterinario.
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 pb-6">
        Dashboard Gatto · Fonti: WSAVA, AAHA/AAFP 2020, ESCCAP IT, Cornell Feline Health Center
      </footer>
    </main>
  );
}
