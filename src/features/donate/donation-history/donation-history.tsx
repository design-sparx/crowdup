import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatDate} from "@/helpers/formatDate";
import {formatMinor} from "@/lib/donations/amount";
import type {DonationHistoryItem} from "@/lib/donations/history";
import {cn} from "@/lib/utils";

interface DonationHistoryProps {
    donations: DonationHistoryItem[];
}

/** The donor's confirmed donations: a table from `md` up, stacked cards below it. Both render from the same data. */
export function DonationHistory({donations}: DonationHistoryProps) {
    if (donations.length === 0) {
        return (
            <div className="space-y-4 rounded-xl border border-dashed p-8 text-center">
                <p className="text-muted-foreground">You have not donated yet.</p>
                <Link to="/campaigns" className={cn(buttonVariants({variant: "outline"}))}>
                    Browse campaigns
                </Link>
            </div>
        );
    }
    return (
        <>
            <Table aria-label="My donations" className="hidden md:table">
                <TableHeader>
                    <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donations.map((donation) => (
                        <TableRow key={donation.id}>
                            <TableCell>
                                <Link to={donation.campaignHref} className="font-medium underline-offset-4 hover:underline">
                                    {donation.campaignTitle}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <time dateTime={donation.createdAt}>{formatDate(donation.createdAt)}</time>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatMinor(donation.amount, donation.currency)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ul className="space-y-3 md:hidden">
                {donations.map((donation) => (
                    <li key={donation.id} className="rounded-xl border bg-card p-4">
                        <Link to={donation.campaignHref} className="font-medium underline-offset-4 hover:underline">
                            {donation.campaignTitle}
                        </Link>
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <time dateTime={donation.createdAt} className="text-muted-foreground">
                                {formatDate(donation.createdAt)}
                            </time>
                            <span className="font-medium tabular-nums">{formatMinor(donation.amount, donation.currency)}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
