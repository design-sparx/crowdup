/**
 * Returns `next` only when it is a same-origin relative path; otherwise the fallback.
 * Blocks open redirects such as `//evil.com`, `/\evil.com`, `https://evil.com` and
 * control-character tricks.
 */
export function safeRedirect(next: unknown, fallback = "/dashboard"): string {
    if (typeof next !== "string") return fallback;
    if (!next.startsWith("/") || next.startsWith("//")) return fallback;
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
    return next;
}
