import dayjs from "dayjs";
import {IconHeart} from "@tabler/icons-react";
import {formatMinor} from "@/lib/donations/amount";
import type {RecentDonor} from "@/lib/campaigns/repository";

export function DonorsList({donors}: {donors: RecentDonor[]}) {
    if (donors.length === 0) {
        return <p className="text-sm text-muted-foreground">No donations yet. Be the first.</p>;
    }
    return (
        <ul className="space-y-4">
            {donors.map((donor) => (
                <li key={donor.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <IconHeart className="size-4" aria-hidden="true"/>
                    </span>
                    <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">
                            {donor.donorName ?? "Anonymous"} · {formatMinor(donor.amount, donor.currency)}
                        </p>
                        {donor.message ? <p className="whitespace-pre-wrap text-sm">{donor.message}</p> : null}
                        <time dateTime={donor.createdAt} className="text-xs text-muted-foreground">
                            {dayjs(donor.createdAt).format("D MMM YYYY")}
                        </time>
                    </div>
                </li>
            ))}
        </ul>
    );
}