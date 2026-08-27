import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    Sentry.captureMessage('Sentry test message from Web Storefront API - ' + new Date().toISOString(), 'info');
    throw new Error('Sentry Test Error from Web Storefront /api/sentry-test - ' + new Date().toISOString());
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      success: true,
      message: 'Sentry test event sent successfully! Check your Sentry Dashboard.',
      timestamp: new Date().toISOString(),
    });
  }
}
