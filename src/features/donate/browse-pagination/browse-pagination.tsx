import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {buildBrowseHref, pageCount} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";

interface BrowsePaginationProps {
    search: CampaignSearch;
    total: number;
    pageSize: number;
}

export function BrowsePagination({search, total, pageSize}: BrowsePaginationProps) {
    const pages = pageCount(total, pageSize);
    if (pages <= 1) return null;
    const current = Math.min(search.page, pages);
    return (
        <Pagination aria-label="Pagination">
            <PaginationContent>
                {current > 1 ? (
                    <PaginationItem>
                        <PaginationPrevious href={buildBrowseHref(search, current - 1)}/>
                    </PaginationItem>
                ) : null}
                <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                        Page {current} of {pages}
                    </span>
                </PaginationItem>
                {current < pages ? (
                    <PaginationItem>
                        <PaginationNext href={buildBrowseHref(search, current + 1)}/>
                    </PaginationItem>
                ) : null}
            </PaginationContent>
        </Pagination>
    );
}
