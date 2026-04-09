import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const migrationsDir = path.resolve("app/.server/drizzle/migrations");
const requiredTables = ["users", "orders", "credit_records", "d1_migrations"];

function parseWranglerJson(output) {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Failed to parse Wrangler JSON output.");
  }

  return JSON.parse(output.slice(start, end + 1));
}

function runRemoteQuery(sql) {
  const command = `pnpm exec wrangler d1 execute DB --remote --command "${sql.replace(
    /"/g,
    '\\"'
  )}"`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const stdout = execSync(command, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return parseWranglerJson(stdout ?? "");
    } catch (error) {
      const stdout =
        error &&
        typeof error === "object" &&
        "stdout" in error &&
        (typeof error.stdout === "string" || Buffer.isBuffer(error.stdout))
          ? String(error.stdout).trim()
          : "";
      const stderr =
        error &&
        typeof error === "object" &&
        "stderr" in error &&
        (typeof error.stderr === "string" || Buffer.isBuffer(error.stderr))
          ? String(error.stderr).trim()
          : "";

      const message = `Wrangler command failed.\n${stdout}\n${stderr}`.trim();
      const retryable = /fetch failed|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(
        message
      );

      if (!retryable || attempt === maxAttempts) {
        throw new Error(message);
      }

      console.warn(
        `[d1-gate:remote] Remote query failed (attempt ${attempt}/${maxAttempts}). Retrying...`
      );
    }
  }

  throw new Error("Wrangler command failed unexpectedly.");
}

function countLocalMigrationFiles() {
  const files = fs.readdirSync(migrationsDir, { withFileTypes: true });
  return files.filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .length;
}

function failWith(message) {
  console.error(`[d1-gate:remote] ${message}`);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    failWith(`Migrations directory not found: ${migrationsDir}`);
  }

  const localMigrationCount = countLocalMigrationFiles();

  const tableRows = runRemoteQuery(
    `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${requiredTables
      .map((name) => `'${name}'`)
      .join(",")}) ORDER BY name;`
  );
  const availableTables = new Set(
    (tableRows[0]?.results ?? []).map((row) => String(row.name))
  );
  const missingTables = requiredTables.filter((name) => !availableTables.has(name));

  if (missingTables.length > 0) {
    failWith(
      `Missing required remote tables: ${missingTables.join(", ")}`
    );
  }

  const migrationRows = runRemoteQuery(
    "SELECT COUNT(*) AS applied_migrations FROM d1_migrations;"
  );
  const remoteMigrationCount = Number(
    migrationRows[0]?.results?.[0]?.applied_migrations ?? 0
  );

  if (remoteMigrationCount !== localMigrationCount) {
    failWith(
      `Migration mismatch. local_files=${localMigrationCount}, remote_applied=${remoteMigrationCount}. Run pnpm run db:migrate:remote before release.`
    );
  }

  const countRows = runRemoteQuery(
    "SELECT COUNT(*) AS users FROM users; SELECT COUNT(*) AS orders FROM orders; SELECT COUNT(*) AS credit_records FROM credit_records;"
  );
  const users = Number(countRows[0]?.results?.[0]?.users ?? 0);
  const orders = Number(countRows[1]?.results?.[0]?.orders ?? 0);
  const creditRecords = Number(countRows[2]?.results?.[0]?.credit_records ?? 0);

  console.log("[d1-gate:remote] PASS");
  console.log(
    `[d1-gate:remote] Required tables present: ${requiredTables.join(", ")}`
  );
  console.log(
    `[d1-gate:remote] Migrations synced: ${remoteMigrationCount}/${localMigrationCount}`
  );
  console.log(
    `[d1-gate:remote] Remote row counts -> users=${users}, orders=${orders}, credit_records=${creditRecords}`
  );
}

try {
  main();
} catch (error) {
  failWith((error instanceof Error ? error.message : String(error)).trim());
}
