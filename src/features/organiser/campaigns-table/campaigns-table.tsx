import {Link} from "react-router";
import {Badge} from "@/components/ui/badge";
import {buttonVariants} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatMinor} from "@/lib/donations/amount";
import type {CampaignStats} from "@/lib/dashboard/dashboard";

interface CampaignsTableProps {
    campaigns: CampaignStats[];
}

/** The organiser's own campaigns. Draft campaigns have no currency yet, so they show a dash for money. */
export function CampaignsTable({campaigns}: CampaignsTableProps) {
    if (campaigns.length === 0) {
        return (
            <div className="space-y-4 rounded-xl border border-dashed p-8 text-center">
                <p className="text-muted-foreground">You have no campaigns yet.</p>
                <Link to="/create-campaign" className={buttonVariants({variant: "outline"})}>Create a campaign</Link>
            </div>
        );
    }
    return (
        <Table aria-label="Your campaigns">
            <TableHeader>
                <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Raised</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {campaigns.map((c) => (
                    <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>
                            <Badge variant={c.status === "live" ? "default" : "secondary"}>{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {c.currency ? formatMinor(c.raised, c.currency) : "–"}
                        </TableCell>
                        <TableCell className="text-right">
                            <Link to={`/campaigns/${c.id}/edit`} className="text-sm underline underline-offset-4" aria-label={`Edit ${c.title}`}>
                                Edit
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
