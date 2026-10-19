import {useId} from "react";
import {Form, Link} from "react-router";
import {SubmitButton} from "@/features/admin/submit-button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

export interface AdminCampaign {
    id: string;
    slug: string;
    title: string;
    status: string;
    suspendedReason: string | null;
}

interface CampaignsTabProps {
    campaigns: AdminCampaign[];
}

/** Every campaign that is not a draft. A live campaign can be suspended with a reason; a suspended one restored. */
export function CampaignsTab({campaigns}: CampaignsTabProps) {
    if (campaigns.length === 0) {
        return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No campaigns to review.</p>;
    }
    return (
        <div className="space-y-4">
            {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c}/>
            ))}
        </div>
    );
}

function CampaignCard({campaign}: {campaign: AdminCampaign}) {
    const reasonId = useId();
    const suspended = campaign.status === "suspended";
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <Link to={`/campaigns/${campaign.slug}`} className="underline underline-offset-4">{campaign.title}</Link>
                    <Badge variant={suspended ? "destructive" : "secondary"}>{campaign.status}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {suspended ? (
                    <Form method="post" className="space-y-3">
                        {campaign.suspendedReason ? (
                            <p className="text-sm text-muted-foreground">Reason: {campaign.suspendedReason}</p>
                        ) : null}
                        <input type="hidden" name="campaignId" value={campaign.id}/>
                        <SubmitButton name="intent" value="restore" variant="outline" size="sm">Restore</SubmitButton>
                    </Form>
                ) : (
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="campaignId" value={campaign.id}/>
                        <div className="space-y-2">
                            <Label htmlFor={reasonId}>Reason for suspending</Label>
                            <Textarea id={reasonId} name="reason" rows={2}/>
                        </div>
                        <SubmitButton name="intent" value="suspend" variant="destructive" size="sm">Suspend</SubmitButton>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
