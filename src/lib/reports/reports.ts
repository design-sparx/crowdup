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
 * Rate-limit bucket for a request: the signed-in user, else the client address. The address
 * comes from the header the platform sets (Netlify), which a client cannot supply; failing
 * that, the LAST X-Forwarded-For entry, which our own proxy appends (the first entry is
 * whatever the client sent, so rotating it would bypass the limit). With no address at all
 * guests share one bucket. The database also enforces one open report per user per campaign.
 */
export function clientKey(userId: string | null, headers: Headers): string {
    if (userId) return `user:${userId}`;
    const platformIp = headers.get("x-nf-client-connection-ip")?.trim();
    const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
    return `ip:${platformIp || forwarded || "unknown"}`;
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
