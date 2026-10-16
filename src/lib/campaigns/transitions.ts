/**
 * Campaign status transitions, the TypeScript twin of the SQL function
 * `campaign_status_transition_allowed` (supabase/migrations/20261019110000_campaign_approval.sql).
 * Keep both in sync; the pgTAP tests exercise the SQL side. See docs/moderation.md.
 *
 *   draft --(server: Stripe ready)--> live                  (auto mode)
 *   draft --(server: Stripe ready)--> pending_approval      (approval mode)
 *   pending_approval --(admin approve)--> live
 *   pending_approval --(admin reject, reason)--> rejected
 *   rejected --(owner edit)--> draft, then resubmitted like any draft
 *   live --(owner or server)--> closed
 *   any --(admin)--> suspended
 *
 * "owner" is a signed-in client; "server" is the service role, a SECURITY DEFINER function
 * (approve/reject) or an admin session.
 */

import {REASON_MAX, REASON_MIN, parseReason} from "../validation/reason";

export const CAMPAIGN_STATUSES =["draft", "pending_approval", "rejected", "live", "closed", "suspended"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type CampaignActor = "owner" | "server";

const OWNER_TRANSITIONS: ReadonlySet<string> = new Set(["live>closed", "rejected>draft"]);

export function canTransition(actor: CampaignActor, from: string, to: string): boolean {
    const known = (s: string) => (CAMPAIGN_STATUSES as readonly string[]).includes(s);
    if (!known(from) || !known(to)) return false;
    if (from === to) return true;
    if (actor === "owner") return OWNER_TRANSITIONS.has(`${from}>${to}`);
    // Server: entry into the moderation statuses is constrained, everything else is open.
    if (to === "pending_approval") return from === "draft";
    if (to === "rejected") return from === "pending_approval";
    return true;
}

const LABELS: Record<CampaignStatus, string> = {
    draft: "Draft",
    pending_approval: "Pending approval",
    rejected: "Rejected",
    live: "Live",
    closed: "Closed",
    suspended: "Suspended",
};

export function statusLabel(status: string): string {
    return (LABELS as Record<string, string>)[status] ?? status;
}

export const REJECTION_REASON_MIN = REASON_MIN;
export const REJECTION_REASON_MAX = REASON_MAX;

export type RejectionReasonResult = {ok: true; reason: string} | {ok: false; error: string};

export function parseRejectionReason(value: unknown): RejectionReasonResult {
    const parsed = parseReason(value);
    if (!parsed.ok) {
        return {ok: false, error: `Give a reason of ${REASON_MIN} to ${REASON_MAX} characters.`};
    }
    return parsed;
}
