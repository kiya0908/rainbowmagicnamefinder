interface KVNamespaceListResult<Key = { name: string }> {
  keys: Key[];
  list_complete: boolean;
  cursor: string;
}

interface KVNamespaceGetWithMetadataResult<T, M = Record<string, unknown>> {
  value: T | null;
  metadata: M | null;
}

interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  get(key: string, type: "stream"): Promise<ReadableStream | null>;
  getWithMetadata<M = Record<string, unknown>>(
    key: string,
    type?: "text"
  ): Promise<KVNamespaceGetWithMetadataResult<string, M>>;
  getWithMetadata<T = unknown, M = Record<string, unknown>>(
    key: string,
    type: "json"
  ): Promise<KVNamespaceGetWithMetadataResult<T, M>>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: {
      expiration?: number;
      expirationTtl?: number;
      metadata?: Record<string, unknown> | null;
    }
  ): Promise<void>;
  delete(key: string | string[]): Promise<void>;
  list(options?: {
    prefix?: string;
    cursor?: string;
    limit?: number;
  }): Promise<KVNamespaceListResult>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
  dump(): Promise<ArrayBuffer>;
}

interface R2Object {
  key: string;
}

interface R2ObjectBody extends R2Object {
  blob(): Promise<Blob>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2MultipartUpload {
  uploadId: string;
}

interface R2Bucket {
  put(
    key: string,
    value: string | Blob | ArrayBuffer | ArrayBufferView | ReadableStream
  ): Promise<R2Object | null>;
  get(key: string): Promise<R2ObjectBody | null>;
  head(key: string): Promise<R2Object | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string }): Promise<{
    objects: R2Object[];
    truncated: boolean;
  }>;
  createMultipartUpload(
    key: string,
    options?: Record<string, unknown>
  ): Promise<R2MultipartUpload>;
  resumeMultipartUpload(
    key: string,
    uploadId: string
  ): R2MultipartUpload;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<TEnv = unknown> {
  fetch?: (
    request: Request,
    env: TEnv,
    ctx: ExecutionContext
  ) => Response | Promise<Response>;
}

interface Env {
  ACCOUNT_ID?: string;
  ACCOUNT_TOKEN?: string;
  CDN_URL?: string;
  CREEM_KEY?: string;
  CREEM_STORE_ID?: string;
  CREEM_TEST_KEY?: string;
  CREEM_WEBHOOK_SECRET?: string;
  DATABASE_ID?: string;
  DB: D1Database;
  DOMAIN?: string;
  GOOGLE_ADS_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;
  GOOGLE_CLIENT_ID?: string;
  INITLIZE_CREDITS?: number | string;
  KIEAI_APIKEY?: string;
  KIEAI_BASE_URL?: string;
  KV: KVNamespace;
  LINKEDIN_TRANSLATOR_EXPIRED_DAILY_LIMIT?: number | string;
  LINKEDIN_TRANSLATOR_FREE_DAILY_LIMIT?: number | string;
  LINKEDIN_TRANSLATOR_TRIAL_DAILY_LIMIT?: number | string;
  R2: R2Bucket;
  R2_ACCESS_KEY_ID?: string;
  R2_ACCOUNT_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  SESSION_SECRET?: string;
}

declare module "cloudflare:workers" {
  export const env: Env;
}
