import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, prevention } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { preventionSchema } from "@/lib/validators";
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

export async function GET(_req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const items = await db.query.prevention.findMany({
    where: eq(prevention.catId, catId),
    orderBy: (p, { asc }) => [asc(p.nextDate)],
  });

  return Response.json(items);
}

export async function POST(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();
  const parsed = preventionSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const item = await db.insert(prevention).values({
    id: nanoid(),
    catId,
    ...parsed.data,
  }).returning();

  return Response.json(item[0], { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await verifyOwnership(catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const url = new URL(req.url);
  const prevId = url.searchParams.get("id");
  if (!prevId) return Response.json({ error: "ID mancante" }, { status: 400 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  await db.delete(prevention)
    .where(and(eq(prevention.id, prevId), eq(prevention.catId, catId)));

  return Response.json({ ok: true });
}
