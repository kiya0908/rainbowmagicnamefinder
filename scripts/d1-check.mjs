import { execSync } from "node:child_process";

const targetArg = process.argv.includes("--remote") ? "--remote" : "--local";
const targetLabel = targetArg === "--remote" ? "remote" : "local";

const sql = [
  "SELECT COUNT(*) AS users FROM users;",
  "SELECT COUNT(*) AS orders FROM orders;",
  "SELECT COUNT(*) AS credit_records FROM credit_records;",
  "SELECT COUNT(*) AS d1_migrations FROM d1_migrations;",
].join(" ");

const command = `pnpm exec wrangler d1 execute DB ${targetArg} --command "${sql}"`;

console.log(`[d1-check] Running ${targetLabel} D1 check...`);

try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[d1-check] Failed to execute wrangler: ${message}`);
  process.exit(1);
}
