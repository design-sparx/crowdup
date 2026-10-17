export const REASON_MIN = 3;
export const REASON_MAX = 1000;

export type ReasonResult = {ok: true; reason: string} | {ok: false; error: string};

export function parseReason(value: unknown): ReasonResult {
    const reason = typeof value === "string" ? value.trim() : "";
    if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
        return {ok: false, error: `Describe the problem in ${REASON_MIN} to ${REASON_MAX} characters.`};
    }
    return {ok: true, reason};
}

/**
 * Which request header carries the real client address, or null when none can be trusted.
 * X-Forwarded-For is never used: its leftmost entry is whatever the client sent, and the
 * rightmost is just the last proxy, which is wrong behind multi-hop setups. The operator names
 * the header their own proxy sets and overwrites (`CLIENT_IP_HEADER`, for example `x-real-ip`);
 * on Netlify the platform header is the default. Anywhere else with no setting, guests share
 * one bucket (strict, but safe) instead of a spoofable one.
 */
export function trustedClientIpHeader(env: Record<string, string | undefined>): string | null {
    const configured = env.CLIENT_IP_HEADER?.trim().toLowerCase();
    if (configured) return configured;
    return env.NETLIFY ? "x-nf-client-connection-ip" : null;
}

/**
 * Rate-limit bucket for a request: the signed-in user, else the address in the trusted
 * header. The database also enforces one open report per user per campaign.
 */
export function clientKey(userId: string | null, headers: Headers, trustedHeader: string | null): string {
    if (userId) return `user:${userId}`;
    const ip = trustedHeader ? headers.get(trustedHeader)?.trim() : "";
    return `ip:${ip || "unknown"}`;
}

export interface ReportRow {
    id: string;
    campaign_id: string;
    reason: string;
    reporter_id: string | null;
    created_at: string;
    campaign: {title: string; slug: string} | null;
}

export interface ReportGroup {
    campaignId: string;
    title: string;
    slug: string;
    reportCount: number;
    reasons: string[];
    reportIds: string[];
}

/** Groups open reports per campaign, most reported first. Reasons are sorted for stable output. */
export function groupOpenReports(rows: ReportRow[]): ReportGroup[] {
    const groups = new Map<string, ReportGroup>();
    for (const row of rows) {
        if (!row.campaign) continue;
        const group = groups.get(row.campaign_id) ?? {
            campaignId: row.campaign_id,
            title: row.campaign.title,
            slug: row.campaign.slug,
            reportCount: 0,
            reasons: [],
            reportIds: [],
        };
        group.reportCount += 1;
        group.reasons.push(row.reason);
        group.reportIds.push(row.id);
        groups.set(row.campaign_id, group);
    }
    for (const g of groups.values()) {
        g.reasons.sort();
        g.reportIds.sort();
    }
    return [...groups.values()].sort((a, b) => b.reportCount - a.reportCount || a.title.localeCompare(b.title));
}
