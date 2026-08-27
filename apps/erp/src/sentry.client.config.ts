import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://05004b59dc9c120d31ba5da41b70c116@o4511901819928576.ingest.de.sentry.io/4511901824581712",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
