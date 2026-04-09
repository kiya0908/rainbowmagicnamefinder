import { loadEnv } from "vite";
import { defineConfig } from "drizzle-kit";

const env = loadEnv("production", process.cwd(), "");
const PROJECT_D1_DATABASE_ID = "4e83da95-b2db-49e3-8017-6c9c284afa8e";

const credentials = {
  accountId: env.ACCOUNT_ID,
  databaseId: env.DATABASE_ID || PROJECT_D1_DATABASE_ID,
  token: env.ACCOUNT_TOKEN,
};

export default defineConfig({
  schema: "./app/.server/drizzle/schema.ts",
  out: "./app/.server/drizzle/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: credentials,
});
