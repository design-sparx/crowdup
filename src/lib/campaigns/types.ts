export interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    country: string;
    imageUrl: string | null;
    /** Amounts are in minor units (cents). */
    goalAmount: number;
    raisedAmount: number;
    donorCount: number;
    currency: string;
    endDate: string | null;
    createdAt: string;
    organizerName: string;
    organizerAvatarUrl: string | null;
    percentFunded: number;
}

export interface CampaignDetails extends Campaign {
    story: unknown;
}
