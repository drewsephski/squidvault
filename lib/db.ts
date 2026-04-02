import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { join } from "path";

const client = createClient({
  url: `file:${join(process.cwd(), "sqlite.db")}`,
});
export const db = drizzle(client);
