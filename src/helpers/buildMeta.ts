export type MetaDescriptor =
    | {title: string}
    | {name: string; content: string}
    | {property: string; content: string};

interface BuildMetaOptions {
    title: string;
    description: string;
    image?: string;
}

const SITE_NAME = "CrowdUp";

/** Builds title, description and Open Graph tags for a route's `meta` export. */
export function buildMeta({title, description, image}: BuildMetaOptions): MetaDescriptor[] {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const tags: MetaDescriptor[] = [
        {title: fullTitle},
        {name: "description", content: description},
        {property: "og:title", content: fullTitle},
        {property: "og:description", content: description},
    ];
    if (image) {
        tags.push({property: "og:image", content: image});
    }
    return tags;
}
