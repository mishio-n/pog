import { DB } from "@/generated/kysely";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export const kysely = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    }),
  }),
});
