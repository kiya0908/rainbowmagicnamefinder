import { env } from "cloudflare:workers";

import { createCookie } from "react-router";
import { createWorkersKVSessionStorage } from "@react-router/cloudflare";

import type { User } from "~/.server/libs/db";

type SessionData = {
  user: User;
};

const sessionSecret = env.SESSION_SECRET ?? "local-dev-session-secret";

export function cookieWrapper() {
  return createCookie("__session", {
    secrets: [sessionSecret],
    path: "/",
    sameSite: "strict",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function sessionWrapper() {
  const sessionCookie = cookieWrapper();
  const sessionStorage = createWorkersKVSessionStorage<SessionData>({
    kv: env.KV,
    cookie: sessionCookie,
  });

  return sessionStorage;
}

export const getSessionHandler = async (request: Request) => {
  const action = sessionWrapper();
  let session;
  try {
    session = await action.getSession(request.headers.get("Cookie"));
  } catch (err) {
    session = await action.getSession("");
  }

  return [session, action] as const;
};
