/** Shared length rule for free-text reasons (moderation actions, campaign rejections). */

export const REASON_MIN = 3;
export const REASON_MAX = 1000;

export type ReasonParseResult = {ok: true; reason: string} | {ok: false};

/** Trims the value and accepts it when it is a string of REASON_MIN to REASON_MAX characters. */
export function parseReason(value: unknown): ReasonParseResult {
    const reason = typeof value === "string" ? value.trim() : "";
    if (reason.length < REASON_MIN || reason.length > REASON_MAX) return {ok: false};
    return {ok: true, reason};
}
