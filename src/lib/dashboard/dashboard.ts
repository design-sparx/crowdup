/** Pure dashboard logic: totals, time-series bucketing and anonymity masking. Amounts are minor units. */

export interface DashboardCampaign {
    id: string;
    slug: string;
    title: string;
    status: string;
    /** Null for a draft that has not gone live yet (currency is set at go-live). */
    currency: string | null;
    goalAmount: number;
    /** Set while status is rejected. */
    rejectionReason?: string | null;
}

/** A confirmed donation as the organiser may see it (from the `public_donation` view). */
export interface DashboardDonation {
    id: string;
    campaignId: string;
    amount: number;
    currency: string;
    createdAt: string;
    anonymous: boolean;
    donorName: string | null;
}

export interface CampaignStats extends DashboardCampaign {
    raised: number;
    donors: number;
    percentFunded: number;
}

export interface CurrencyTotal {
    currency: string;
    raised: number;
    donors: number;
}

export const ANONYMOUS_LABEL = "Anonymous";

/** Never reveals a name the donor withheld, even if one is present in the data. */
export function donorLabel(d: Pick<DashboardDonation, "anonymous" | "donorName">): string {
    if (d.anonymous) return ANONYMOUS_LABEL;
    const name = d.donorName?.trim();
    return name ? name : ANONYMOUS_LABEL;
}

/** Totals per campaign and per currency. Donations for unknown campaigns are ignored. */
export function summarize(campaigns: DashboardCampaign[], donations: DashboardDonation[]) {
    const byCampaign = new Map<string, CampaignStats>(
        campaigns.map((c) => [c.id, {...c, raised: 0, donors: 0, percentFunded: 0}]),
    );
    const byCurrency = new Map<string, CurrencyTotal>();

    for (const d of donations) {
        const stats = byCampaign.get(d.campaignId);
        if (!stats) continue;
        stats.raised += d.amount;
        stats.donors += 1;
        const total = byCurrency.get(d.currency) ?? {currency: d.currency, raised: 0, donors: 0};
        total.raised += d.amount;
        total.donors += 1;
        byCurrency.set(d.currency, total);
    }

    const stats = campaigns.map((c) => {
        const s = byCampaign.get(c.id)!;
        s.percentFunded = s.goalAmount > 0 ? Math.min(100, Math.round((s.raised / s.goalAmount) * 100)) : 0;
        return s;
    });
    return {campaigns: stats, totalsByCurrency: [...byCurrency.values()]};
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Daily (UTC) sums for the last `days` days ending at `now`, one series per currency. */
export function bucketDonations(donations: DashboardDonation[], days: number, now: Date = new Date()) {
    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
        keys.push(dayKey(new Date(now.getTime() - i * 86_400_000)));
    }
    const index = new Map(keys.map((k, i) => [k, i]));
    const series = new Map<string, number[]>();

    for (const d of donations) {
        const i = index.get(dayKey(new Date(d.createdAt)));
        if (i === undefined) continue;
        const data = series.get(d.currency) ?? keys.map(() => 0);
        data[i] += d.amount;
        series.set(d.currency, data);
    }
    return {days: keys, series: [...series].map(([currency, data]) => ({currency, data}))};
}
