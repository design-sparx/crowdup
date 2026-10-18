import {Form, Link} from "react-router";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {formatDate} from "@/helpers/formatDate";

export interface ReportGroup {
    campaignId: string;
    title: string;
    slug: string;
    reports: {id: string; reason: string; createdAt: string}[];
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
                            <span className="ml-2 text-sm font-normal text-muted-foreground">{group.reports.length} open</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm">
                            {group.reports.map((r) => (
                                <li key={r.id} className="flex flex-wrap justify-between gap-2">
                                    <span>{r.reason}</span>
                                    <time dateTime={r.createdAt} className="text-muted-foreground">{formatDate(r.createdAt)}</time>
                                </li>
                            ))}
                        </ul>
                        <Form method="post" aria-label={`Reports for ${group.title}`}>
                            {group.reports.map((r) => (
                                <input key={r.id} type="hidden" name="reportId" value={r.id}/>
                            ))}
                            <Button type="submit" name="intent" value="dismiss" variant="outline" size="sm">Dismiss reports</Button>
                        </Form>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
