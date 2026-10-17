import type {PublishingMode} from "../stripe/publishing";

/**
 * Editing a live campaign. The public content (title, summary, category, country, story,
 * cover) is what an admin approved, so in approval mode changing it sends the campaign back
 * to `pending_approval` and it stays offline until re-approved. Goal and end date are not
 * content and never trigger review. The database refuses client edits of this content on a
 * live campaign (`guard_campaign_write`); the server applies them after this check.
 */
export interface EditableContent {
    title: string;
    category: string;
    country: string;
    description: string;
    story: unknown;
    /** Undefined when no new cover was uploaded (the stored cover is kept). */
    coverImageUrl?: string | null;
}

export interface LiveEditPlan {
    contentChanged: boolean;
    nextStatus: "live" | "pending_approval";
}

/** Key-order-independent JSON: Postgres jsonb does not preserve the order we stored. */
function canonical(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
    }
    return JSON.stringify(value) ?? "null";
}

export function liveEditPlan(current: EditableContent, next: EditableContent, mode: PublishingMode): LiveEditPlan {
    const contentChanged =
        current.title !== next.title ||
        current.category !== next.category ||
        current.country !== next.country ||
        current.description !== next.description ||
        canonical(current.story) !== canonical(next.story) ||
        (next.coverImageUrl !== undefined && next.coverImageUrl !== (current.coverImageUrl ?? null));
    return {contentChanged, nextStatus: contentChanged && mode === "approval" ? "pending_approval" : "live"};
}
