import {renderStoryHtml} from "./story";

/**
 * Renders a story the organiser has typed but not saved, for the preview step. It uses the same
 * sanitising renderer as the published campaign page, so the preview matches what will publish.
 * Nothing is stored. Unreadable input renders as empty, as it does for a saved campaign.
 */
export function renderStoryPreview(raw: string | undefined): string {
    if (!raw) return "";
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return "";
    }
    return renderStoryHtml(parsed);
}
