import {Link} from "react-router";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Pagination, PaginationContent, PaginationItem} from "@/components/ui/pagination";
import {buildBrowseHref, pageCount} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";

interface BrowsePaginationProps {
    search: CampaignSearch;
    total: number;
    pageSize: number;
}

// The shadcn PaginationPrevious/Next render `<a role="button">`, which screen readers announce
// as buttons. These are real links (and navigate client-side), so they use Link directly.
export function BrowsePagination({search, total, pageSize}: BrowsePaginationProps) {
    const pages = pageCount(total, pageSize);
    if (pages <= 1) return null;
    const current = Math.min(search.page, pages);
    return (
        <Pagination aria-label="Pagination">
            <PaginationContent>
                {current > 1 ? (
                    <PaginationItem>
                        <Link
                            to={buildBrowseHref(search, current - 1)}
                            aria-label="Go to previous page"
                            className={buttonVariants({variant: "ghost"})}
                        >
                            <IconChevronLeft aria-hidden="true" className="rtl:rotate-180"/>
                            <span className="hidden sm:block">Previous</span>
                        </Link>
                    </PaginationItem>
                ) : null}
                <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                        Page {current} of {pages}
                    </span>
                </PaginationItem>
                {current < pages ? (
                    <PaginationItem>
                        <Link
                            to={buildBrowseHref(search, current + 1)}
                            aria-label="Go to next page"
                            className={buttonVariants({variant: "ghost"})}
                        >
                            <span className="hidden sm:block">Next</span>
                            <IconChevronRight aria-hidden="true" className="rtl:rotate-180"/>
                        </Link>
                    </PaginationItem>
                ) : null}
            </PaginationContent>
        </Pagination>
    );
}
