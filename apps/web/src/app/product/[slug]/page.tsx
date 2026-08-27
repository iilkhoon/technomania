import type { Metadata } from 'next';
import { getProductBySlug, fetchProductBySlugApi, getSimilarProducts, GREAT_OFFERS, Product } from '../../data/products';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

// ── Dynamic SEO Metadata ───────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug ? String(resolvedParams.slug) : '';
    const product = slug ? ((await fetchProductBySlugApi(slug).catch(() => undefined)) || getProductBySlug(slug)) : undefined;

    if (!product) {
      return { title: 'Məhsul Detalları | TechnoMania' };
    }
    const title = `${product.model_name || 'Məhsul'} — ${product.cash_price || ''} | TechnoMania`;
    const description =
      product.description ??
      `${product.model_name || ''} ${product.cash_price || ''} qiymətinə TechnoMania-da. ` +
        `${product.discount ? product.discount + ' endirim. ' : ''}Faizsiz taksit, pulsuz çatdırılma.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.image ? [{ url: product.image, width: 800, height: 600, alt: product.model_name || 'Məhsul' }] : [],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', title, description },
      keywords: [
        product.model_name || '',
        product.brand || '',
        product.category ?? '',
        'technomania',
        'elektronika',
        'azerbaycan',
      ],
    };
  } catch (e) {
    return { title: 'Məhsul Detalları | TechnoMania' };
  }
}

// ── Server Component Shell ─────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  let slug = '';
  let product: Product | undefined = undefined;
  let similarProducts: Product[] = [];

  try {
    const resolvedParams = await Promise.resolve(params);
    slug = resolvedParams?.slug ? String(resolvedParams.slug) : '';
    if (slug) {
      product = (await fetchProductBySlugApi(slug).catch(() => undefined)) || getProductBySlug(slug);
      if (product) {
        similarProducts = getSimilarProducts(product, 6);
      }
    }
  } catch (e) {
    console.error('Error resolving ProductPage params:', e);
  }

  return (
    <ProductDetailClient
      product={product || null}
      similarProducts={similarProducts}
      greatOffers={GREAT_OFFERS}
      slug={slug}
    />
  );
}

