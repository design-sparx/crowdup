import {sanitizeStory, type StoryDoc} from "./story";

export interface CampaignValues {
    title: string;
    category: string;
    country: string;
    description: string;
    /** Minor units (cents). */
    goalAmount: number;
    currency: string;
    endDate: string | null;
    story: StoryDoc;
}

export type CampaignFormErrors = Partial<Record<
    "title" | "category" | "country" | "goal" | "currency" | "description" | "endDate" | "story",
    string
>>;

export type ParsedCampaignForm =
    | {ok: true; values: CampaignValues}
    | {ok: false; errors: CampaignFormErrors};

/** Largest goal in minor units; keeps the value inside a safe integer. */
const MAX_GOAL_MINOR = 10_000_000_000;

function str(form: FormData, name: string): string {
    const v = form.get(name);
    return typeof v === "string" ? v.trim() : "";
}

function parseGoal(raw: string): number | null {
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw)) return null;
    const minor = Math.round(Number(raw) * 100);
    return minor > 0 && minor <= MAX_GOAL_MINOR ? minor : null;
}

function parseEndDate(raw: string, now: Date): {value: string | null} | {error: string} {
    if (!raw) return {value: null};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return {error: "Enter a valid end date."};
    const date = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
        return {error: "Enter a valid end date."};
    }
    if (date.getTime() <= now.getTime()) return {error: "The end date must be in the future."};
    return {value: date.toISOString()};
}

/** Validates the create/edit form. Never trusts the client: story is sanitised here. */
export function parseCampaignForm(
    form: FormData,
    {now = new Date(), requireCurrency = true}: {now?: Date; requireCurrency?: boolean} = {},
): ParsedCampaignForm {
    const errors: CampaignFormErrors = {};

    const title = str(form, "title");
    if (title.length < 3 || title.length > 140) errors.title = "Use a title of 3 to 140 characters.";

    const category = str(form, "category");
    if (category.length < 1 || category.length > 64) errors.category = "Choose a category.";

    const country = str(form, "country");
    if (!/^[A-Z]{2}$/.test(country)) errors.country = "Choose a country.";

    const description = str(form, "description");
    if (description.length > 300) errors.description = "Keep the summary to 300 characters.";

    const goalAmount = parseGoal(str(form, "goal"));
    if (goalAmount === null) errors.goal = "Enter a goal greater than zero, with at most 2 decimals.";

    const currency = str(form, "currency");
    if (requireCurrency && !/^[A-Z]{3}$/.test(currency)) errors.currency = "Choose a currency.";

    const end = parseEndDate(str(form, "endDate"), now);
    if ("error" in end) errors.endDate = end.error;

    let story: StoryDoc = {type: "doc", content: []};
    try {
        const raw = form.get("story");
        story = sanitizeStory(typeof raw === "string" && raw ? JSON.parse(raw) : undefined);
    } catch {
        errors.story = "The story could not be read. Please try again.";
    }

    if (Object.keys(errors).length > 0) return {ok: false, errors};
    return {
        ok: true,
        values: {
            title, category, country, description, currency,
            goalAmount: goalAmount as number,
            endDate: "error" in end ? null : end.value,
            story,
        },
    };
}
