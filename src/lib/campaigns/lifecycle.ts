/**
 * Campaign lifecycle rules. Stored status is draft | live | closed | suspended. A live
 * campaign past its end date is treated as "ended" at read time; the database function
 * `close_expired_campaigns()` additionally persists it as closed. The funding goal is
 * deliberately not a cap: donations continue past 100%.
 */

export interface LifecycleCampaign {
    status: string;
    endDate: string | null;
}

function isPast(endDate: string | null, now: Date): boolean {
    if (endDate === null) return false;
    const end = new Date(endDate).getTime();
    // An unparseable date fails closed.
    return Number.isNaN(end) || end <= now.getTime();
}

export function effectiveStatus(campaign: LifecycleCampaign, now: Date = new Date()): string {
    if (campaign.status === "live" && isPast(campaign.endDate, now)) return "ended";
    return campaign.status;
}

export function canAcceptDonations(campaign: LifecycleCampaign, now: Date = new Date()): boolean {
    return effectiveStatus(campaign, now) === "live";
}
