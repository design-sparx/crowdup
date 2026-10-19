import {DonationHistory} from "@/features/donate/donation-history";
import type {DonationHistoryItem} from "@/lib/donations/history";

export function MyDonationsPage({donations}: {donations: DonationHistoryItem[]}) {
    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            <header className="space-y-1">
                <h1 className="text-3xl font-semibold">My donations</h1>
                <p className="text-sm text-muted-foreground">Confirmed donations made while signed in.</p>
            </header>
            <DonationHistory donations={donations}/>
        </div>
    );
}
