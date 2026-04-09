type KVRecord = {
  value: string;
  expiration?: number;
  metadata?: Record<string, unknown> | null;
};

const kvRecords = new Map<string, KVRecord>();

const nowSeconds = () => Math.floor(Date.now() / 1000);

const getRecord = (key: string) => {
  const record = kvRecords.get(key);
  if (!record) return null;

  if (record.expiration && record.expiration <= nowSeconds()) {
    kvRecords.delete(key);
    return null;
  }

  return record;
};

const localKV = {
  async get(
    key: string,
    type?: "text" | "json" | "arrayBuffer" | "stream"
  ) {
    const record = getRecord(key);
    if (!record) return null;

    if (type === "json") return JSON.parse(record.value);
    if (type === "arrayBuffer") return new TextEncoder().encode(record.value).buffer;
    if (type === "stream") {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(record.value));
          controller.close();
        },
      });
    }

    return record.value;
  },
  async getWithMetadata(
    key: string,
    type?: "text" | "json" | "arrayBuffer" | "stream"
  ) {
    const value =
      type === "json"
        ? await localKV.get(key, "json")
        : type === "arrayBuffer"
          ? await localKV.get(key, "arrayBuffer")
          : type === "stream"
            ? await localKV.get(key, "stream")
            : await localKV.get(key);
    const record = getRecord(key);

    return {
      value,
      metadata: record?.metadata ?? null,
    };
  },
  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { expiration?: number; expirationTtl?: number; metadata?: Record<string, unknown> }
  ) {
    let stringValue: string;

    if (typeof value === "string") {
      stringValue = value;
    } else if (value instanceof ReadableStream) {
      const reader = value.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        chunks.push(chunk);
      }
      const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      stringValue = new TextDecoder().decode(merged);
    } else if (value instanceof ArrayBuffer) {
      stringValue = new TextDecoder().decode(new Uint8Array(value));
    } else {
      stringValue = new TextDecoder().decode(
        new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      );
    }

    const expiration =
      options?.expiration ??
      (options?.expirationTtl ? nowSeconds() + options.expirationTtl : undefined);

    kvRecords.set(key, {
      value: stringValue,
      expiration,
      metadata: options?.metadata ?? null,
    });
  },
  async delete(key: string) {
    kvRecords.delete(key);
  },
  async list(options?: { prefix?: string }) {
    const prefix = options?.prefix ?? "";
    const keys = Array.from(kvRecords.keys())
      .filter((key) => key.startsWith(prefix))
      .map((name) => ({ name }));

    return {
      keys,
      list_complete: true,
      cursor: "",
    };
  },
} as unknown as KVNamespace;

const createD1Stub = () =>
  ({
    prepare() {
      throw new Error(
        "D1 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need database-backed routes."
      );
    },
    batch() {
      throw new Error(
        "D1 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need database-backed routes."
      );
    },
    exec() {
      throw new Error(
        "D1 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need database-backed routes."
      );
    },
    dump() {
      throw new Error(
        "D1 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need database-backed routes."
      );
    },
  } as unknown as D1Database);

const createR2Stub = () =>
  ({
    async put() {
      throw new Error(
        "R2 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need storage-backed routes."
      );
    },
    async get() {
      return null;
    },
    async head() {
      return null;
    },
    async delete() {
      return;
    },
    async list() {
      return {
        objects: [],
        truncated: false,
      };
    },
    createMultipartUpload() {
      throw new Error(
        "R2 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need storage-backed routes."
      );
    },
    resumeMultipartUpload() {
      throw new Error(
        "R2 is unavailable in local dev without Cloudflare runtime. Use `pnpm run dev:cf` if you need storage-backed routes."
      );
    },
  } as unknown as R2Bucket);

const localProcessEnv =
  typeof process !== "undefined"
    ? (process.env as Record<string, string | undefined>)
    : {};

export const env = {
  SESSION_SECRET:
    localProcessEnv.SESSION_SECRET ?? "local-dev-session-secret",
  DOMAIN: localProcessEnv.DOMAIN ?? "http://localhost:5173",
  CDN_URL: localProcessEnv.CDN_URL ?? "http://localhost:5173",
  GOOGLE_ANALYTICS_ID: localProcessEnv.GOOGLE_ANALYTICS_ID ?? "",
  GOOGLE_ADS_ID: localProcessEnv.GOOGLE_ADS_ID ?? "",
  GOOGLE_CLIENT_ID: localProcessEnv.GOOGLE_CLIENT_ID ?? "",
  INITLIZE_CREDITS: localProcessEnv.INITLIZE_CREDITS ?? 5,
  KIEAI_APIKEY: localProcessEnv.KIEAI_APIKEY ?? "",
  CREEM_KEY: localProcessEnv.CREEM_KEY ?? "",
  CREEM_TEST_KEY: localProcessEnv.CREEM_TEST_KEY ?? "",
  CREEM_WEBHOOK_SECRET: localProcessEnv.CREEM_WEBHOOK_SECRET ?? "",
  CREEM_STORE_ID: localProcessEnv.CREEM_STORE_ID ?? "",
  R2_ACCOUNT_ID: localProcessEnv.R2_ACCOUNT_ID ?? "",
  R2_ACCESS_KEY_ID: localProcessEnv.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: localProcessEnv.R2_SECRET_ACCESS_KEY ?? "",
  DB: createD1Stub(),
  R2: createR2Stub(),
  KV: localKV,
} as unknown as Env;
