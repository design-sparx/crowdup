import type {CampaignSearch} from "./params";

/** Link to `page` of the browse list, keeping the active filters. Page 1 has no `page` parameter. */
export function buildBrowseHref(search: CampaignSearch, page: number): string {
    const params = new URLSearchParams();
    if (search.q) params.set("q", search.q);
    if (search.category) params.set("category", search.category);
    if (search.country) params.set("country", search.country);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/campaigns?${query}` : "/campaigns";
}

export function pageCount(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize));
}

export function hasActiveFilters(search: CampaignSearch): boolean {
    return Boolean(search.q || search.category || search.country);
}
