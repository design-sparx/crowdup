export interface CampaignSearch {
    q?: string;
    category?: string;
    country?: string;
    page: number;
}

const MAX_KEYWORD_LENGTH = 100;

function clean(value: string | null): string | undefined {
    const v = value?.trim();
    return v ? v : undefined;
}

/** Parses the public campaign list query string into validated filters. */
export function parseCampaignSearch(params: URLSearchParams): CampaignSearch {
    const result: CampaignSearch = {page: 1};

    const q = clean(params.get("q"));
    if (q) result.q = q.slice(0, MAX_KEYWORD_LENGTH);

    const category = clean(params.get("category"));
    if (category) result.category = category;

    const country = clean(params.get("country"))?.toUpperCase();
    if (country && /^[A-Z]{2}$/.test(country)) result.country = country;

    const page = Number(params.get("page"));
    if (Number.isInteger(page) && page >= 1) result.page = page;

    return result;
}

/**
 * Builds a PostgREST `or` filter matching the keyword in title or description.
 * Characters with meaning in the filter grammar or in LIKE patterns become spaces.
 */
export function buildKeywordFilter(keyword: string): string {
    const safe = keyword.replace(/[,()%_*\\"]/g, " ").replace(/\s+/g, " ").trim();
    return `title.ilike.*${safe}*,description.ilike.*${safe}*`;
}
