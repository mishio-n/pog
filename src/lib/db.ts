import { DB } from "@/generated/kysely";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: true,
    }),
  }),
});
