import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button";
import {CampaignGrid} from "@/features/donate/campaign-grid";
import type {Campaign} from "@/lib/campaigns/types";

const STEPS = [
    {title: "Create your campaign", text: "Tell your story, set a goal and add a photo. It takes a few minutes."},
    {title: "Share it", text: "Send the link to friends, family and your community."},
    {title: "Receive donations", text: "People give by card. Money goes straight to your own Stripe account."},
] as const;

export function HomePage({campaigns}: {campaigns: Campaign[]}) {
    const featured = campaigns.slice(0, 6);
    return (
        <div>
            <section className="border-b border-border bg-muted/40">
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Raise money for what matters</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        CrowdUp is an open-source home for community fundraisers. Donations go straight to the
                        organiser&apos;s own Stripe account.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link to="/campaigns" className={buttonVariants({size: "lg"})}>
                            Donate to a campaign
                        </Link>
                        <Link to="/create-campaign" className={buttonVariants({size: "lg", variant: "outline"})}>
                            Start a campaign
                        </Link>
                    </div>
                </div>
            </section>

            {featured.length > 0 ? (
                <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold">Featured campaigns</h2>
                        <Link to="/campaigns" className={buttonVariants({variant: "link"})}>
                            See all
                        </Link>
                    </div>
                    <CampaignGrid campaigns={featured} resetHref={null}/>
                </section>
            ) : null}

            <section className="border-t border-border bg-muted/40">
                <div className="mx-auto max-w-6xl space-y-8 px-4 py-14">
                    <h2 className="text-2xl font-semibold">How it works</h2>
                    <ol className="grid gap-6 sm:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="space-y-2">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                    {index + 1}
                                </span>
                                <h3 className="font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                    <Link to="/how-it-works" className={buttonVariants({variant: "link", className: "px-0"})}>
                        Learn more
                    </Link>
                </div>
            </section>
        </div>
    );
}
