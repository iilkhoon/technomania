/**
 * Schema.org Structured Data Generators for SEO Optimization
 */

export interface ProductSeoData {
  id: string;
  name: string;
  description: string;
  images: string[];
  brand: string;
  sku: string;
  price: number;
  currency?: string;
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
}

export function generateProductJsonLd(product: ProductSeoData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://techno-erp.az/product/${product.id}`,
      priceCurrency: product.currency || 'AZN',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.ratingValue && product.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
