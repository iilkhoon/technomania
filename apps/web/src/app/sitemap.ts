import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://techno-erp.az';

  const staticRoutes = [
    '',
    '/catalog',
    '/cart',
    '/wishlist',
    '/compare',
    '/login',
    '/register',
    '/affiliate-stats',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes];
}
