export function getPublicSiteUrl(): URL | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}
