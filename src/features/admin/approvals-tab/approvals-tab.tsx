import {useId} from "react";
import {Form} from "react-router";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {formatDate} from "@/helpers/formatDate";

export interface PendingApproval {
    id: string;
    title: string;
    organizerName: string;
    createdAt: string;
    description: string;
}

interface ApprovalsTabProps {
    campaigns: PendingApproval[];
}

/** Campaigns waiting for approval. Approve and reject post `campaignId` and `intent`; a rejection carries a `reason`. */
export function ApprovalsTab({campaigns}: ApprovalsTabProps) {
    if (campaigns.length === 0) {
        return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Nothing is waiting for approval.</p>;
    }
    return (
        <div className="space-y-4">
            {campaigns.map((c) => (
                <ApprovalCard key={c.id} campaign={c}/>
            ))}
        </div>
    );
}

function ApprovalCard({campaign}: {campaign: PendingApproval}) {
    const reasonId = useId();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{campaign.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    By {campaign.organizerName} · submitted <time dateTime={campaign.createdAt}>{formatDate(campaign.createdAt)}</time>
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm">{campaign.description}</p>
                <Form method="post" className="space-y-3">
                    <input type="hidden" name="campaignId" value={campaign.id}/>
                    <div className="space-y-2">
                        <Label htmlFor={reasonId}>Reason for rejecting</Label>
                        <Textarea id={reasonId} name="reason" rows={2}/>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" name="intent" value="approve">Approve</Button>
                        <Button type="submit" name="intent" value="reject" variant="outline">Reject</Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
