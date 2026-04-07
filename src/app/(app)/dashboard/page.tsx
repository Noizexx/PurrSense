import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { calcAge } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const lifestyleLabel: Record<string, string> = {
  indoor: "🏠 Indoor",
  outdoor: "🌿 Outdoor",
  mixed: "🔀 Misto",
};

const catBgColors = [
  "from-amber-200 to-orange-300",
  "from-rose-200 to-pink-300",
  "from-violet-200 to-purple-300",
  "from-sky-200 to-blue-300",
  "from-emerald-200 to-teal-300",
  "from-yellow-200 to-amber-300",
];

export default async function DashboardPage() {
  const session = await auth();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);

  const userCats = await db.query.cats.findMany({
    where: eq(cats.userId, session!.user!.id!),
    orderBy: (c, { asc }) => [asc(c.createdAt)],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <span>🐱</span> I miei gatti
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {userCats.length === 0
              ? "Aggiungi il tuo primo gatto per iniziare"
              : `${userCats.length} gatt${userCats.length === 1 ? "o" : "i"} nel tuo profilo`}
          </p>
        </div>
        <Link href="/cats/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 active:translate-y-0">
          <span>➕</span> Aggiungi gatto
        </Link>
      </div>

      {userCats.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-50 shadow-md shadow-orange-50">
          <div className="text-7xl mb-4">🐱</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Nessun gatto ancora</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            Aggiungi il tuo gatto per iniziare a monitorarne salute e benessere.
          </p>
          <Link href="/cats/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition hover:-translate-y-0.5">
            <span>🐾</span> Aggiungi il primo gatto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userCats.map((cat, i) => {
            const bg = catBgColors[i % catBgColors.length];
            return (
              <Link key={cat.id} href={`/cats/${cat.id}`}>
                <div className="group bg-white rounded-2xl border border-orange-50 shadow-md shadow-orange-50 p-5 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-sm`}>
                      {cat.photoUrl
                        ? <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                        : "🐱"}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{cat.name}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500 mt-1">
                        <span>🎂 {calcAge(cat.birthDate)}</span>
                        <span>{lifestyleLabel[cat.lifestyle ?? "indoor"] ?? cat.lifestyle}</span>
                        {cat.sterilized === "yes" && <span>✂️ Sterilizzato/a</span>}
                      </div>
                      {cat.mainFood && (
                        <div className="text-xs text-gray-400 mt-1 truncate">🥣 {cat.mainFood}</div>
                      )}
                    </div>
                    {/* Arrow */}
                    <span className="text-orange-200 group-hover:text-orange-400 text-2xl transition-colors">›</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Add cat card */}
          <Link href="/cats/new">
            <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-5 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[108px]">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">➕</div>
              <span className="text-amber-500 font-bold text-sm">Aggiungi un altro gatto</span>
            </div>
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-xs text-sky-700 flex items-start gap-2">
        <span className="text-base flex-shrink-0">🩺</span>
        <span><strong>Nota:</strong> Strumento di monitoraggio personale — non sostituisce la visita veterinaria. Range indicativi (WSAVA/AAHA/AAFP).</span>
      </div>
    </div>
  );
}
