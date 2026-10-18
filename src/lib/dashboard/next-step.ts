/**
 * The single next action the dashboard suggests. Stripe comes first, because nothing can be paid out
 * without it. A live campaign is shared before a draft is published, since sharing is what brings in donors.
 */
export type NextStep =
    | {kind: "connect_stripe"}
    | {kind: "publish"; campaignId: string}
    | {kind: "share"; slug: string}
    | {kind: "none"};

interface NextStepInput {
    stripeStatus: "not_started" | "incomplete" | "connected";
    campaigns: {id: string; slug: string; status: string}[];
}

export function nextStep({stripeStatus, campaigns}: NextStepInput): NextStep {
    if (stripeStatus !== "connected") return {kind: "connect_stripe"};
    const live = campaigns.find((c) => c.status === "live");
    if (live) return {kind: "share", slug: live.slug};
    const draft = campaigns.find((c) => c.status === "draft");
    if (draft) return {kind: "publish", campaignId: draft.id};
    return {kind: "none"};
}
