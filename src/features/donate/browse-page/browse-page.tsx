import {BrowsePagination} from "@/features/donate/browse-pagination";
import {CampaignFilters} from "@/features/donate/campaign-filters";
import {CampaignGrid} from "@/features/donate/campaign-grid";
import {hasActiveFilters} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";
import type {Campaign} from "@/lib/campaigns/types";

interface BrowsePageProps {
    items: Campaign[];
    total: number;
    categories: string[];
    search: CampaignSearch;
    pageSize: number;
}

export function BrowsePage({items, total, categories, search, pageSize}: BrowsePageProps) {
    const canReset = hasActiveFilters(search) || search.page > 1;
    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold">Browse campaigns</h1>
                <p className="text-muted-foreground">
                    {total === 1 ? "1 live campaign" : `${total} live campaigns`}
                    {hasActiveFilters(search) ? " match your search" : ""}
                </p>
            </header>
            <CampaignFilters search={search} categories={categories}/>
            <CampaignGrid campaigns={items} resetHref={canReset ? "/campaigns" : null}/>
            <BrowsePagination search={search} total={total} pageSize={pageSize}/>
        </div>
    );
}
