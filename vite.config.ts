import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "node:fs";
import path from "node:path";

const loadDevVars = (rootDir: string) => {
  const devVarsPath = path.join(rootDir, ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return;

  const content = fs.readFileSync(devVarsPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

export default defineConfig(({ command }) => {
  loadDevVars(__dirname);

  const useCloudflareRuntime =
    command === "build" || process.env.CLOUDFLARE_DEV === "1";
  const useLocalCloudflareConfig = process.env.CLOUDFLARE_DEV === "1";

  return {
    plugins: [
      ...(useCloudflareRuntime
        ? [
            cloudflare({
              viteEnvironment: { name: "ssr" },
              ...(useLocalCloudflareConfig
                ? { configPath: "./wrangler.local.jsonc" }
                : {}),
            }),
          ]
        : []),
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
    ],
    resolve: useCloudflareRuntime
      ? undefined
      : {
          alias: {
            "cloudflare:workers": path.resolve(
              __dirname,
              "app/.server/shims/cloudflare-workers.ts"
            ),
          },
        },
    server: {
      host: "0.0.0.0",
      allowedHosts: [
        "prefamiliarly-grippy-hermila.ngrok-free.app",
        ".ngrok-free.app",
      ],
    },
  };
});
