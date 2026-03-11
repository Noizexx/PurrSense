import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, dailyLogs, prevention } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function GET(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const cat = await db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, session.user.id)),
  });
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const logs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.catId, catId),
    orderBy: (l, { asc }) => [asc(l.date)],
  });

  const prevItems = await db.query.prevention.findMany({
    where: eq(prevention.catId, catId),
  });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";

  if (format === "csv") {
    const headers = [
      "data","peso_kg","bcs","mcs","secco_g","umido_g","pasti",
      "snack_kcal","acqua_ml","gioco_min","grooming","shedding",
      "vomito","diarrea","note_feci","note_comportamento"
    ];
    const rows = logs.map((l) => [
      l.date, l.weight ?? "", l.bcs ?? "", l.mcs ?? "",
      l.dryGrams ?? "", l.wetGrams ?? "", l.meals ?? "",
      l.snackKcal ?? "", l.waterMl ?? "", l.playMinutes ?? "",
      l.groomingSessions ?? "", l.shedding ?? "",
      l.vomiting ? 1 : 0, l.diarrhea ? 1 : 0,
      `"${(l.fecesNotes ?? "").replace(/"/g, '""')}"`,
      `"${(l.behaviorNotes ?? "").replace(/"/g, '""')}"`,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${cat.name}-logs.csv"`,
      },
    });
  }

  // JSON default
  const data = {
    exportedAt: new Date().toISOString(),
    cat,
    logs,
    prevention: prevItems,
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${cat.name}-export.json"`,
    },
  });
}
