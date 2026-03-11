
import { getDb } from "@/lib/db";
import { shareTokens, cats, dailyLogs, prevention } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { calcAge, formatDate } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

interface Props { params: Promise<{ token: string }> }

export default async function SharePage({ params }: Props) {
  const { token } = await params;

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const share = await db.query.shareTokens.findFirst({
    where: eq(shareTokens.token, token),
  });

  if (!share || new Date(share.expiresAt) < new Date()) notFound();

  const cat = await db.query.cats.findFirst({ where: eq(cats.id, share.catId) });
  if (!cat) notFound();

  const logs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.catId, cat.id),
    orderBy: (l, { desc }) => [desc(l.date)],
    limit: 30,
  });
  const logsAsc = [...logs].reverse();

  const prevItems = await db.query.prevention.findMany({
    where: eq(prevention.catId, cat.id),
  });

  const lastLog = logsAsc[logsAsc.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐾</span>
          <div>
            <h1 className="font-bold text-xl text-gray-800">Dashboard Gatto — Vet Share</h1>
            <p className="text-sm text-gray-500">Accesso read-only · Scade il {formatDate(share.expiresAt)}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          ⚠️ Questi dati sono stati condivisi dal proprietario come strumento di monitoraggio personale.
          Non costituiscono referto medico veterinario.
        </div>

        {/* Cat profile */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 text-lg mb-3">Profilo: {cat.name}</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Età:</span> <span className="font-medium">{calcAge(cat.birthDate)}</span></div>
            <div><span className="text-gray-400">Sesso:</span> <span className="font-medium capitalize">{cat.sex}</span></div>
            <div><span className="text-gray-400">Razza:</span> <span className="font-medium capitalize">{cat.breed}</span></div>
            <div><span className="text-gray-400">Stile vita:</span> <span className="font-medium capitalize">{cat.lifestyle}</span></div>
            <div><span className="text-gray-400">Sterilizzato/a:</span> <span className="font-medium capitalize">{cat.sterilized}</span></div>
            {cat.microchip && <div><span className="text-gray-400">Microchip:</span> <span className="font-medium">{cat.microchip}</span></div>}
            {cat.mainFood && <div className="col-span-2"><span className="text-gray-400">Alimento:</span> <span className="font-medium">{cat.mainFood}</span></div>}
          </div>
          {lastLog && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
              <div><div className="text-amber-500 font-bold text-xl">{lastLog.weight ?? "—"}</div><div className="text-xs text-gray-400">Peso kg</div></div>
              <div><div className="text-emerald-500 font-bold text-xl">{lastLog.bcs ?? "—"}/9</div><div className="text-xs text-gray-400">BCS</div></div>
              <div><div className="text-sky-500 font-bold text-xl capitalize">{lastLog.mcs ?? "—"}</div><div className="text-xs text-gray-400">MCS pelo</div></div>
            </div>
          )}
        </div>

        {/* Last 30 logs table */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 overflow-x-auto">
          <h2 className="font-bold text-gray-800 mb-3">Log ultimi 30 giorni</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 pr-3">Data</th>
                <th className="text-right pb-2 pr-3">Peso</th>
                <th className="text-right pb-2 pr-3">BCS</th>
                <th className="text-right pb-2 pr-3">Secco g</th>
                <th className="text-right pb-2 pr-3">Gioco</th>
                <th className="text-right pb-2">V/D</th>
              </tr>
            </thead>
            <tbody>
              {logsAsc.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 pr-3">{formatDate(l.date)}</td>
                  <td className="text-right pr-3">{l.weight ?? "—"}</td>
                  <td className="text-right pr-3">{l.bcs ?? "—"}</td>
                  <td className="text-right pr-3">{l.dryGrams ?? "—"}</td>
                  <td className="text-right pr-3">{l.playMinutes ? `${l.playMinutes}m` : "—"}</td>
                  <td className="text-right">{l.vomiting || l.diarrhea ? "⚠️" : "✓"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prevention */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Calendario prevenzione</h2>
          <div className="space-y-2">
            {prevItems.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <div className="text-right text-gray-400 text-xs">
                  {p.date && <div>Fatto: {formatDate(p.date)}</div>}
                  {p.nextDate && <div>Prossimo: {formatDate(p.nextDate)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">
          Dashboard Gatto · Dati condivisi dal proprietario · Non costituisce referto veterinario
        </p>
      </div>
    </div>
  );
}
