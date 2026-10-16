/** Pure moderation rules shared by the admin routes and organiser-facing messages. */

import {REASON_MAX, REASON_MIN, parseReason} from "../validation/reason";

export type ReasonResult = {ok: true; reason: string} | {ok: false; error: string};

export function parseModerationReason(value: unknown): ReasonResult {
    const parsed = parseReason(value);
    if (!parsed.ok) {
        return {
            ok: false,
            error: `A reason of ${REASON_MIN} to ${REASON_MAX} characters is required.`,
        };
    }
    return parsed;
}

/** Only published campaigns can be suspended; drafts are private already. */
export function canSuspendCampaign(status: string): boolean {
    return status === "live" || status === "closed";
}

/**
 * Restore rule: back to the status stored at suspension. Anything unknown restores to
 * closed, the safe choice: it never reopens donations by accident. Mirrors the SQL function.
 */
export function restoreStatus(prior: string | null | undefined): "live" | "closed" {
    return prior === "live" ? "live" : "closed";
}

export function campaignSuspensionNotice(status: string, reason: string | null): string | null {
    if (status !== "suspended") return null;
    return reason
        ? `This campaign was suspended by a moderator: ${reason}`
        : "This campaign was suspended by a moderator.";
}

export function userSuspensionNotice(suspended: boolean, reason: string | null): string | null {
    if (!suspended) return null;
    return reason
        ? `Your account is suspended, so you cannot create or edit campaigns. Reason: ${reason}`
        : "Your account is suspended, so you cannot create or edit campaigns.";
}

export function mapModerationError(code: string | undefined): string {
    switch (code) {
        case "42501":
            return "You are not allowed to do that.";
        case "23514":
            return "That action cannot be applied in the current state, or the reason is invalid.";
        case "P0002":
            return "Target not found.";
        default:
            return "Could not complete the action. Please try again.";
    }
}
