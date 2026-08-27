import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  try {
    const resolvedParams = await params;
    const subpath = resolvedParams?.path ? resolvedParams.path.join('/') : '';
    const targetUrl = `${BACKEND_URL}/${subpath}`;

    const reqHeaders: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      'x-erp-api-key': request.headers.get('x-erp-api-key') || process.env.ERP_SECRET_KEY || process.env.NEXT_PUBLIC_ERP_SECRET_KEY || 'technomania_secure_erp_token_2026_98x!',
    };

    if (request.headers.get('authorization')) {
      reqHeaders['authorization'] = request.headers.get('authorization')!;
    }

    const options: RequestInit = {
      method: request.method,
      headers: reqHeaders,
      cache: 'no-store',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyText = await request.text();
      options.body = bodyText;
    }

    const backendRes = await fetch(targetUrl, options);
    const contentType = backendRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }

    const text = await backendRes.text();
    return new NextResponse(text, { status: backendRes.status });
  } catch (error) {
    console.error('Error proxying request to backend:', error);
    return NextResponse.json({ error: 'Failed to connect to backend server' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxyRequest(request, context);
}
