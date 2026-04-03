import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { calcAge } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">I miei gatti</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {userCats.length === 0
              ? "Aggiungi il tuo primo gatto per iniziare"
              : `${userCats.length} gatt${userCats.length === 1 ? "o" : "i"} nel tuo profilo`}
          </p>
        </div>
        <Link
          href="/cats/new"
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm shadow-sm transition"
        >
          + Aggiungi gatto
        </Link>
      </div>

      {userCats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
          <div className="text-6xl mb-4">🐱</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Nessun gatto ancora</h2>
          <p className="text-gray-500 text-sm mb-6">
            Aggiungi il tuo gatto per iniziare a monitorarne salute e benessere.
          </p>
          <Link
            href="/cats/new"
            className="inline-block px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition"
          >
            Aggiungi il primo gatto →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userCats.map((cat) => (
            <Link key={cat.id} href={`/cats/${cat.id}`}>
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {cat.photoUrl ? (
                      <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      "🐱"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                    <div className="flex flex-wrap gap-x-3 text-sm text-gray-500 mt-0.5">
                      <span>🎂 {calcAge(cat.birthDate)}</span>
                      <span>🏠 {cat.lifestyle === "indoor" ? "Indoor" : cat.lifestyle === "outdoor" ? "Outdoor" : "Misto"}</span>
                    </div>
                    {cat.mainFood && (
                      <div className="text-xs text-gray-400 mt-1 truncate">🍽️ {cat.mainFood}</div>
                    )}
                  </div>
                  <span className="text-gray-300 text-xl">→</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Add another cat card */}
          <Link href="/cats/new">
            <div className="bg-white rounded-2xl border border-dashed border-amber-300 p-5 hover:bg-amber-50 transition cursor-pointer flex items-center justify-center gap-3 h-full min-h-[100px]">
              <span className="text-3xl text-amber-300">+</span>
              <span className="text-amber-500 font-medium">Aggiungi un altro gatto</span>
            </div>
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        <strong>⚠️ Nota:</strong> Quest&apos;app è uno strumento di monitoraggio personale e non sostituisce la visita veterinaria.
        I range indicati sono orientativi (WSAVA/AAHA/AAFP). Consulta sempre il tuo veterinario.
      </div>
    </div>
  );
}
