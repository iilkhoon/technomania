import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    Sentry.captureMessage('Sentry test message from ERP Backend API - ' + new Date().toISOString(), 'info');
    throw new Error('Sentry Test Error from ERP /api/sentry-test - ' + new Date().toISOString());
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      success: true,
      message: 'Sentry test event sent successfully! Check your Sentry Dashboard.',
      timestamp: new Date().toISOString(),
    });
  }
}
