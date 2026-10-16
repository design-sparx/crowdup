import type {OnboardingStatus} from "./onboarding";

export type PublishingMode = "auto" | "approval";
export type GoLiveDecision = "go_live" | "await_approval" | "none";

/** Reads PUBLISHING_MODE. Unknown values throw so a typo cannot silently publish everything. */
export function parsePublishingMode(raw: string | undefined): PublishingMode {
    const value = (raw ?? "").trim().toLowerCase();
    if (value === "") return "auto";
    if (value === "auto" || value === "approval") return value;
    throw new Error(`PUBLISHING_MODE must be "auto" or "approval" (got "${raw}")`);
}

/**
 * What to do with one campaign after an organiser's Stripe state changes. Only drafts of
 * active owners with completed onboarding are ever considered.
 */
export function goLiveDecision(p: {
    onboardingComplete: boolean;
    mode: PublishingMode;
    campaignStatus: string;
    ownerSuspended: boolean;
}): GoLiveDecision {
    if (p.campaignStatus !== "draft" || !p.onboardingComplete || p.ownerSuspended) return "none";
    return p.mode === "approval" ? "await_approval" : "go_live";
}

/** Plain-language reason shown to the organiser for a campaign's current state. */
export function campaignLiveExplanation(p: {
    status: string;
    rejectionReason?: string | null;
    onboarding: OnboardingStatus;
    mode: PublishingMode;
}): string {
    switch (p.status) {
        case "live":
            return "Live and accepting donations.";
        case "closed":
            return "Closed. It no longer accepts donations.";
        case "suspended":
            return "Suspended by an administrator.";
        case "pending_approval":
            return "Waiting for administrator approval. You cannot edit it while it is under review.";
        case "rejected":
            return `Rejected by an administrator${p.rejectionReason ? `: ${p.rejectionReason}` : "."} Edit it to resubmit.`;
    }
    if (p.onboarding === "not_started") return "Draft. Connect your Stripe account to publish it.";
    if (p.onboarding === "incomplete") return p.mode === "approval" ? "Draft. Finish Stripe onboarding and it is sent for administrator approval." : "Draft. Finish Stripe onboarding and it goes live automatically.";
    if (p.mode === "approval") return "Draft. Publish it to send it for administrator approval.";
    return "Draft. It goes live automatically; refresh your status if it does not.";
}
