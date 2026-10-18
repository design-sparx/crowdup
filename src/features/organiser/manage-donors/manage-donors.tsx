import {DonorsList} from "@/features/donate/donors-list";
import type {RecentDonor} from "@/lib/campaigns/repository";

interface ManageDonorsProps {
    donors: RecentDonor[];
}

/**
 * The organiser's view of supporters. Rows come from the public donors list, so the anonymity rule is
 * applied in one place. Only the empty line is organiser wording: the public page invites a first donation.
 */
export function ManageDonors({donors}: ManageDonorsProps) {
    if (donors.length === 0) {
        return <p className="text-sm text-muted-foreground">No donations yet.</p>;
    }
    return <DonorsList donors={donors}/>;
}
