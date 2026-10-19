/** A stable anchor id from a heading, so links such as #refunds work. */
export function slug(heading: string): string {
    return heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
