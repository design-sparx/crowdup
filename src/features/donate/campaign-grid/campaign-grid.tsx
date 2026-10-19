import {Link} from "react-router";
import {IconSearchOff} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {CampaignCard} from "@/features/donate/campaign-card";
import type {Campaign} from "@/lib/campaigns/types";

interface CampaignGridProps {
    campaigns: Campaign[];
    resetHref: string | null;
}

export function CampaignGrid({campaigns, resetHref}: CampaignGridProps) {
    if (campaigns.length === 0) {
        return (
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconSearchOff/>
                    </EmptyMedia>
                    <EmptyTitle>No campaigns found</EmptyTitle>
                    <EmptyDescription>Try a different search, or look at everything that is live.</EmptyDescription>
                </EmptyHeader>
                {resetHref ? (
                    <EmptyContent>
                        <Link to={resetHref} className={buttonVariants({variant: "outline"})}>
                            Show all campaigns
                        </Link>
                    </EmptyContent>
                ) : null}
            </Empty>
        );
    }
    return (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
                <li key={campaign.id}>
                    <CampaignCard campaign={campaign}/>
                </li>
            ))}
        </ul>
    );
}
