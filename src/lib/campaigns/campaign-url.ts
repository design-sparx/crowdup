/**
 * Absolute URL of a campaign page for sharing. Uses the trusted origin only: `SITE_URL` when set,
 * otherwise the request origin outside production. Production without SITE_URL is an error, so
 * shared links can never point at a host taken from a request header.
 */
export function campaignPageUrl(slug: string, siteUrl: string | undefined, requestUrl: string, production: boolean): string {
    const configured = siteUrl?.trim().replace(/\/+$/, "");
    if (configured) return `${configured}/campaigns/${encodeURIComponent(slug)}`;
    if (production) throw new Error("SITE_URL must be set in production (see .env.example)");
    return `${new URL(requestUrl).origin}/campaigns/${encodeURIComponent(slug)}`;
}
