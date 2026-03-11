import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, dailyLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logSchema } from "@/lib/validators";
import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

async function verifyOwnership(catId: string, userId: string) {
  const { env } = getCloudflareContext();
  const db = getDb(env);
  return db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, userId)),
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 90), 365);

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const logs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.catId, catId),
    orderBy: [desc(dailyLogs.date)],
    limit,
  });

  return Response.json(logs.reverse());
}

export async function POST(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();
  const parsed = logSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  // Upsert by date
  const existing = await db.query.dailyLogs.findFirst({
    where: and(eq(dailyLogs.catId, catId), eq(dailyLogs.date, parsed.data.date)),
  });

  if (existing) {
    const updated = await db.update(dailyLogs)
      .set(parsed.data)
      .where(eq(dailyLogs.id, existing.id))
      .returning();
    return Response.json(updated[0]);
  }

  const log = await db.insert(dailyLogs).values({
    id: nanoid(),
    catId,
    ...parsed.data,
  }).returning();

  return Response.json(log[0], { status: 201 });
}
