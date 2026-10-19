/**
 * The guided campaign form. Each step owns some of the form's fields. Steps are client-side
 * panels of one form, so the server still validates every field; a server error sends the user
 * back to the first step that owns the failing field.
 */
export const WIZARD_STEPS = [
    {id: "basics", label: "Basics", fields: ["title", "category", "country", "description"]},
    {id: "story", label: "Story", fields: ["story", "cover"]},
    {id: "goal", label: "Goal", fields: ["goal", "endDate"]},
    {id: "preview", label: "Preview", fields: []},
] as const satisfies readonly {id: string; label: string; fields: readonly string[]}[];

/** Categories seeded and used by live campaigns. The server accepts any category up to 64 characters. */
export const CAMPAIGN_CATEGORIES = ["Community", "Education", "Environment", "Food", "Other", "Sports"] as const;

/** Index of the earliest step owning a field with an error, or null. Form-level errors belong to no step. */
export function firstStepWithError(errors: Record<string, string | undefined>): number | null {
    let first: number | null = null;
    WIZARD_STEPS.forEach((step, index) => {
        if (first !== null) return;
        if (step.fields.some((field) => errors[field])) first = index;
    });
    return first;
}
