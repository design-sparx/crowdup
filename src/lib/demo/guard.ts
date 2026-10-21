import {isDemoMode} from "./demo";

type Env = Record<string, string | undefined>;

/** Seeded campaigns (supabase/seed.sql) use ids 10000000-0000-4000-8000-0000000000NN. */
const SEEDED_CAMPAIGN_ID = /^10000000-0000-4000-8000-0000000000[0-9a-f]{2}$/i;

export const DEMO_DISABLED_MESSAGE = "This action is disabled in the public demo.";

export function isSeededCampaignId(id: string | null | undefined): boolean {
    return SEEDED_CAMPAIGN_ID.test(id ?? "");
}

/** Password changes and resets would lock other visitors out of the shared demo accounts. */
export function demoBlocksPasswordChange(env: Env): boolean {
    return isDemoMode(env);
}

/** Moderating or editing a seeded campaign would deface the demo for everyone until the next reset. */
export function demoBlocksCampaign(env: Env, campaignId: string | null | undefined): boolean {
    return isDemoMode(env) && isSeededCampaignId(campaignId);
}

/** Suspending users would lock the shared demo accounts. */
export function demoBlocksUserModeration(env: Env): boolean {
    return isDemoMode(env);
}
