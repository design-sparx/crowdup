import {Link} from "react-router";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

export type InboxTab = "reports" | "approvals" | "payments" | "campaigns" | "users";

/** Only these tabs have something waiting to count; campaigns and users have no badge. */
export type CountedTab = "reports" | "approvals" | "payments";

interface InboxTabsProps {
    counts: Record<CountedTab, number>;
    current: InboxTab;
}

const TABS: {id: InboxTab; label: string; href: string}[] = [
    {id: "reports", label: "Reports", href: "/admin/reports"},
    {id: "approvals", label: "Approvals", href: "/admin/approvals"},
    {id: "payments", label: "Payments", href: "/admin/payments"},
    {id: "campaigns", label: "Campaigns", href: "/admin/campaigns"},
    {id: "users", label: "Users", href: "/admin/users"},
];

/** The admin inbox's tab bar. A count badge shows only when there is something waiting. */
export function InboxTabs({counts, current}: InboxTabsProps) {
    return (
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto border-b">
            {TABS.map((tab) => {
                const active = tab.id === current;
                const count = tab.id in counts ? counts[tab.id as CountedTab] : 0;
                return (
                    <Link
                        key={tab.id}
                        to={tab.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm",
                            active ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {tab.label}
                        {count > 0 ? <Badge variant="secondary" className="tabular-nums">{count}</Badge> : null}
                    </Link>
                );
            })}
        </nav>
    );
}
