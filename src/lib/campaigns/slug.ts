const MAX_BASE_LENGTH = 60;

/** Turns a title into a URL slug matching the database check `^[a-z0-9]+(-[a-z0-9]+)*$`. */
export function slugify(title: string): string {
    const slug = title
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, MAX_BASE_LENGTH)
        .replace(/-+$/g, "");
    return slug || "campaign";
}

/** Used to retry after a unique violation on the slug. */
export function withSuffix(slug: string, suffix: string): string {
    return `${slug}-${suffix}`;
}
