import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, dailyLogs, prevention } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calcAge, formatDate, daysUntil } from "@/lib/utils";
import { generateAlerts } from "@/lib/alertEngine";
import CatDashboardClient from "@/components/CatDashboardClient";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

interface Props {
  params: Promise<{ catId: string }>;
}

export default async function CatPage({ params }: Props) {
  const { catId } = await params;

  const session = await auth();
  const { env } = getCloudflareContext();
  const db = getDb(env);

  // Ownership check
  const cat = await db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, session!.user!.id!)),
  });
  if (!cat) notFound();

  const logs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.catId, cat.id),
    orderBy: [desc(dailyLogs.date)],
    limit: 90,
  });
  const logsAsc = [...logs].reverse();

  const prevItems = await db.query.prevention.findMany({
    where: eq(prevention.catId, cat.id),
    orderBy: [desc(prevention.createdAt)],
  });

  const alerts = generateAlerts(logsAsc, prevItems.map(p => ({ name: p.name, nextDate: p.nextDate })));

  return (
    <CatDashboardClient
      cat={cat as any}
      logs={logsAsc as any}
      prevention={prevItems as any}
      alerts={alerts}
    />
  );
}
