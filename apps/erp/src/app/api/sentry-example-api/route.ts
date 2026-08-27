import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export function GET() {
  const err = new Error("Sentry Test Error from ERP API Route");
  Sentry.captureException(err);
  return NextResponse.json({
    status: "ok",
    message: "Sentry test error captured on ERP server route",
    errorCaptured: err.message,
  });
}
