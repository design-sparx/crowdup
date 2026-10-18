import {Alert, AlertDescription} from "@/components/ui/alert";
import {CampaignsTable} from "@/features/organiser/campaigns-table";
import {DonationsChart} from "@/features/organiser/donations-chart";
import {NextStepCard} from "@/features/organiser/next-step-card";
import {StatCard} from "@/features/organiser/stat-card";
import {bucketDonations, summarize, type DashboardCampaign, type DashboardDonation} from "@/lib/dashboard/dashboard";
import {formatMinor} from "@/lib/donations/amount";
import {nextStep} from "@/lib/dashboard/next-step";

/** Where Stripe sent the organiser back to, as the return route reports it (see stripe-return). */
const STRIPE_NOTICE: Record<string, string> = {
    connected: "Stripe is connected. You can publish your campaigns now.",
    incomplete: "Stripe setup is not finished yet. Finish it to receive donations.",
    not_started: "Stripe setup did not start. Try connecting again.",
    error: "We could not confirm your Stripe status. Try again in a moment.",
};

interface DashboardPageProps {
    name: string;
    campaigns: DashboardCampaign[];
    donations: DashboardDonation[];
    stripeStatus: "not_started" | "incomplete" | "connected";
    currency: string | null;
    moderationNotice: string | null;
    notice: string | null;
    mode: "auto" | "approval";
    /** ISO time from the loader, so the chart's day buckets match the server's clock. */
    now: string;
}

/** The organiser's home: the next step, the totals, the chart and their campaigns. */
export function DashboardPage({name, campaigns, donations, stripeStatus, moderationNotice, notice, now}: DashboardPageProps) {
    const {campaigns: stats, totalsByCurrency} = summarize(campaigns, donations);
    const chart = bucketDonations(donations, 30, new Date(now));
    const donors = new Set(donations.map((d) => d.id)).size;
    const step = nextStep({stripeStatus, campaigns});
    const totals = totalsByCurrency.length
        ? totalsByCurrency.map((t) => formatMinor(t.raised, t.currency)).join(" · ")
        : "None yet";

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
            <header>
                <h1 className="text-3xl font-semibold">Welcome, {name}</h1>
            </header>
            {moderationNotice ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{moderationNotice}</AlertDescription>
                </Alert>
            ) : null}
            {notice && STRIPE_NOTICE[notice] ? (
                <Alert role="status">
                    <AlertDescription>{STRIPE_NOTICE[notice]}</AlertDescription>
                </Alert>
            ) : null}
            <NextStepCard step={step}/>
            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Raised" value={totals}/>
                <StatCard label="Donors" value={String(donors)} hint={`Across ${campaigns.length} ${campaigns.length === 1 ? "campaign" : "campaigns"}`}/>
                <StatCard label="Live campaigns" value={String(campaigns.filter((c) => c.status === "live").length)}/>
            </section>
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Last 30 days</h2>
                <DonationsChart series={chart}/>
            </section>
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Your campaigns</h2>
                <CampaignsTable campaigns={stats}/>
            </section>
        </div>
    );
}
