import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { catSchema } from "@/lib/validators";
import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

// GET /api/cats — lista tutti i gatti dell'utente
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const userCats = await db.query.cats.findMany({
    where: eq(cats.userId, session.user.id),
    orderBy: (c, { asc }) => [asc(c.createdAt)],
  });

  return Response.json(userCats);
}

// POST /api/cats — crea nuovo gatto
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json();
  const parsed = catSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const cat = await db.insert(cats).values({
    id: nanoid(),
    userId: session.user.id,
    ...parsed.data,
  }).returning();

  return Response.json(cat[0], { status: 201 });
}
