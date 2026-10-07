import type { MetadataRoute } from 'next';
import { getCards } from '@/lib/queries/cards';
import { getPublicSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) return [];

  const pages: MetadataRoute.Sitemap = ['/', '/cards', '/contact'].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === '/' ? 'weekly' : 'daily',
  }));

  try {
    const cards = await getCards();
    pages.push(
      ...cards
        .filter((card) => card.status === 'available' && card.quantity > 0)
        .map((card) => ({
          url: new URL(`/cards/${card.id}`, siteUrl).toString(),
          changeFrequency: 'weekly' as const,
        })),
    );
  } catch {
    // Keep the static public routes available when Supabase is temporarily unavailable.
  }

  return pages;
}
