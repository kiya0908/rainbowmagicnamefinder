type RuntimeEnv = Record<string, string | undefined>;

interface RuntimeContext {
  cloudflare?: {
    env?: object;
  };
}

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
};

export const getRuntimeEnv = (context?: RuntimeContext): RuntimeEnv => {
  const cloudflareEnv = context?.cloudflare?.env;
  if (cloudflareEnv && typeof cloudflareEnv === "object") {
    return cloudflareEnv as RuntimeEnv;
  }

  if (typeof process !== "undefined") {
    return process.env as RuntimeEnv;
  }

  return {};
};

export const shouldRequireBaseAuthFromEnv = ({
  isProduction,
  bypassBaseAuthInDev,
}: {
  isProduction: boolean;
  bypassBaseAuthInDev?: string | null;
}) => {
  if (isProduction) return true;
  return !parseBooleanEnv(bypassBaseAuthInDev);
};

const isProductionRuntime = () =>
  (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD === true;

export const shouldRequireBaseAuth = (context?: RuntimeContext) => {
  const env = getRuntimeEnv(context);
  return shouldRequireBaseAuthFromEnv({
    isProduction: isProductionRuntime(),
    bypassBaseAuthInDev: env.BYPASS_BASE_AUTH_IN_DEV,
  });
};
