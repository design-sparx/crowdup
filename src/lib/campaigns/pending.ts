/** A campaign waiting in the admin approval queue. */
export interface PendingCampaign {
    id: string;
    slug: string;
    title: string;
    category: string;
    country: string;
    description: string;
    goalAmount: number;
    currency: string | null;
    createdAt: string;
    organizerName: string;
}
