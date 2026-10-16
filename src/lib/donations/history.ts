/** Row shape of the `my_donation` view: the signed-in donor's own confirmed donations. */
export interface DonationHistoryRow {
    id: string;
    amount: number;
    currency: string;
    created_at: string;
    status: string;
    campaign_title: string;
    campaign_slug: string;
}

export interface DonationHistoryItem {
    id: string;
    campaignTitle: string;
    campaignHref: string;
    /** Minor units, as stored. */
    amount: number;
    currency: string;
    createdAt: string;
    status: "confirmed";
}

/** Maps view rows to the page model: confirmed only, newest first. */
export function toDonationHistory(rows: DonationHistoryRow[]): DonationHistoryItem[] {
    return rows
        .filter((r) => r.status === "confirmed")
        .map((r) => ({
            id: r.id,
            campaignTitle: r.campaign_title,
            campaignHref: `/campaigns/${r.campaign_slug}`,
            amount: Number(r.amount),
            currency: r.currency,
            createdAt: r.created_at,
            status: "confirmed" as const,
        }))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
