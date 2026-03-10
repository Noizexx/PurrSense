import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export function getDb(env: CloudflareEnv) {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
