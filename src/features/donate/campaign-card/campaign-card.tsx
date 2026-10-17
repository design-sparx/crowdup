import {Link} from "react-router";
import {IconHeartHandshake} from "@tabler/icons-react";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {formatMinorAmount} from "@/helpers/formatAmount";
import type {Campaign} from "@/lib/campaigns/types";

export function CampaignCard({campaign}: {campaign: Campaign}) {
    return (
        <Card className="relative h-full transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-lg">
            {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt="" loading="lazy" className="aspect-video w-full object-cover"/>
            ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
                    <IconHeartHandshake className="size-10" aria-hidden="true"/>
                </div>
            )}
            <CardContent className="flex flex-1 flex-col gap-3">
                <Badge variant="secondary" className="w-fit">
                    {campaign.category}
                </Badge>
                <h3 className="text-lg font-semibold leading-snug">
                    <Link to={`/campaigns/${campaign.slug}`} className="outline-none after:absolute after:inset-0">
                        {campaign.title}
                    </Link>
                </h3>
                <p className="line-clamp-2 text-muted-foreground">{campaign.description}</p>
                <p className="text-xs text-muted-foreground">by {campaign.organizerName}</p>
                <div className="mt-auto space-y-2">
                    <Progress value={campaign.percentFunded} aria-label={`${campaign.title} funding progress`}/>
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold">
                            {formatMinorAmount(campaign.raisedAmount, campaign.currency)} raised
                        </span>
                        <span className="text-muted-foreground">{campaign.percentFunded}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        of {formatMinorAmount(campaign.goalAmount, campaign.currency)} ·{" "}
                        {campaign.donorCount} {campaign.donorCount === 1 ? "donor" : "donors"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
