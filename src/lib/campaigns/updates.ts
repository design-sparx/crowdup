/** Organiser updates are plain text. Markup is never interpreted; React escapes it at render. */

/** Matches the `campaign_update.body` check constraint (1 to 5000 characters). */
export const MAX_UPDATE_LENGTH = 5000;

export type ParsedUpdate = {ok: true; body: string} | {ok: false; error: string};

export function parseUpdateBody(raw: unknown): ParsedUpdate {
    if (typeof raw !== "string") return {ok: false, error: "Write an update before posting."};
    const body = raw.trim();
    if (body.length === 0) return {ok: false, error: "Write an update before posting."};
    if (body.length > MAX_UPDATE_LENGTH) {
        return {ok: false, error: `Updates can be at most ${MAX_UPDATE_LENGTH} characters.`};
    }
    return {ok: true, body};
}
