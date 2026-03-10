import { auth } from "@/lib/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/lib/db";
import { cats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { catSchema } from "@/lib/validators";

export const runtime = "edge";

async function getCatOrNull(catId: string, userId: string) {
  const { env } = getRequestContext();
  const db = getDb(env);
  return db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, userId)),
  });
}

export async function GET(_req: Request, { params }: { params: { catId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await getCatOrNull(params.catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  return Response.json(cat);
}

export async function PUT(req: Request, { params }: { params: { catId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await getCatOrNull(params.catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();
  const parsed = catSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { env } = getRequestContext();
  const db = getDb(env);

  const updated = await db
    .update(cats)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(and(eq(cats.id, params.catId), eq(cats.userId, session.user.id)))
    .returning();

  return Response.json(updated[0]);
}

export async function DELETE(_req: Request, { params }: { params: { catId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const cat = await getCatOrNull(params.catId, session.user.id);
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const { env } = getRequestContext();
  const db = getDb(env);

  await db.delete(cats).where(and(eq(cats.id, params.catId), eq(cats.userId, session.user.id)));

  return Response.json({ ok: true });
}
