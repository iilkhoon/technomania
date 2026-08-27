import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog';
    const res = await fetch(`${url}/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const favicon = data?.faviconUrl || data?.erpLogoUrl || data?.logoUrl;

      if (favicon && typeof favicon === 'string') {
        if (favicon.startsWith('data:image/')) {
          const parts = favicon.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const contentType = mimeMatch ? mimeMatch[1] : 'image/png';
          const base64Data = parts[1];
          const buffer = Buffer.from(base64Data, 'base64');

          return new Response(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
        } else if (favicon.startsWith('http://') || favicon.startsWith('https://')) {
          const imageRes = await fetch(favicon, { cache: 'no-store' });
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            const contentType = imageRes.headers.get('content-type') || 'image/png';
            return new Response(Buffer.from(arrayBuffer), {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              },
            });
          }
          return NextResponse.redirect(favicon);
        }
      }
    }
  } catch (e) {}

  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  return new Response(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache',
    },
  });
}
