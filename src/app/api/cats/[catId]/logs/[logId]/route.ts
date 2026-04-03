import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, dailyLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logSchema } from "@/lib/validators";
import { getCloudflareContext } from "@opennextjs/cloudflare";


async function verifyOwnership(catId: string, userId: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);
  return db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, userId)),
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ catId: string; logId: string }> }
) {
  const { catId, logId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();
  const parsed = logSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);

  const updated = await db.update(dailyLogs)
    .set(parsed.data)
    .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.catId, catId)))
    .returning();

  if (!updated.length) return Response.json({ error: "Non trovato" }, { status: 404 });
  return Response.json(updated[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ catId: string; logId: string }> }
) {
  const { catId, logId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);

  await db.delete(dailyLogs)
    .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.catId, catId)));

  return Response.json({ ok: true });
}
