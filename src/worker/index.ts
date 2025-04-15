import { withSentry, setUser } from "@sentry/cloudflare";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import SentryMCP from "../mcp/transports/cloudflare-worker";
import { SCOPES } from "./auth";
import app from "./app";
import type { Env } from "./types";

// required for Durable Objects
export { SentryMCP };

const oAuthProvider = new OAuthProvider({
  apiRoute: "/sse",
  // @ts-ignore
  apiHandler: SentryMCP.mount("/sse"),
  // @ts-ignore
  defaultHandler: app,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
  scopesSupported: SCOPES.split(" "),
});

export default withSentry(
  (env) => ({
    debug: true,
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1,
    sendDefaultPii: true,
    environment: env.NODE_ENV === "production" ? "production" : "development",
  }),
  oAuthProvider,
) satisfies ExportedHandler<Env>;
