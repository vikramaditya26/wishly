// ---------------------------------------------------------------------------
// Wishly site configuration.
// This is THE file to edit for branding / affiliate settings.
// ---------------------------------------------------------------------------

export const SITE_NAME = "Wishly";
export const SITE_TAGLINE = "wedding registries, without the duplicate gifts";

// Amazon Associates tag. Every amazon.in link on the site (curated products
// AND links pasted by users) automatically gets this tag appended.
export const AFFILIATE_TAG = "thesimpleguyy-21";

/**
 * Adds the affiliate tag to any Amazon link that doesn't already have one.
 * Non-Amazon links are returned untouched.
 */
export function withAffiliateTag(url: string): string {
  try {
    const u = new URL(url);
    if (!/(^|\.)amazon\./i.test(u.hostname)) return url;
    if (!u.searchParams.get("tag")) u.searchParams.set("tag", AFFILIATE_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

/** Builds an affiliate-tagged amazon.in search link for a curated product. */
export function amazonSearchLink(query: string): string {
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}
