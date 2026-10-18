import {Form, Link} from "react-router";
import {SubmitButton} from "@/features/admin/submit-button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

/** One campaign's open reports, as lib/reports `groupOpenReports` produces them. */
export interface ReportGroup {
    campaignId: string;
    title: string;
    slug: string;
    reportCount: number;
    reasons: string[];
    reportIds: string[];
}

interface ReportsTabProps {
    groups: ReportGroup[];
}

/** Open reports grouped by campaign. Dismissing posts every report id for that campaign to the existing action. */
export function ReportsTab({groups}: ReportsTabProps) {
    if (groups.length === 0) {
        return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No open reports.</p>;
    }
    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <Card key={group.campaignId}>
                    <CardHeader>
                        <CardTitle className="text-base">
                            <Link to={`/campaigns/${group.slug}`} className="underline underline-offset-4">{group.title}</Link>
                            <span className="ml-2 text-sm font-normal text-muted-foreground">{group.reportCount} open</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                            {group.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                        <Form method="post" aria-label={`Reports for ${group.title}`}>
                            {group.reportIds.map((id) => (
                                <input key={id} type="hidden" name="reportId" value={id}/>
                            ))}
                            <SubmitButton name="intent" value="dismiss" variant="outline" size="sm">Dismiss reports</SubmitButton>
                        </Form>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
