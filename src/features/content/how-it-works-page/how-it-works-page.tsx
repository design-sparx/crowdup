import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button";

const STEPS = [
    {
        heading: "Start a campaign",
        body: "Tell people what the money is for, add a story and a cover image, and set a goal. Save a draft as often as you like; nobody sees it until you publish.",
    },
    {
        heading: "Connect Stripe",
        body: "Donations are paid through Stripe straight to your bank account. You finish the Stripe setup on Stripe's secure site, and CrowdUp never sees your bank details.",
    },
    {
        heading: "Share it",
        body: "Once your campaign is live, share its link. Anyone can donate without creating an account, and you can post updates to your supporters as you go.",
    },
    {
        heading: "Get paid",
        body: "Donations are paid out to your Stripe account. Some deployments of CrowdUp may need an admin to approve a campaign before it goes live, and some charge a platform fee; the terms that apply to your campaign say which.",
    },
];

/** Plain-language explanation of the donation flow. It names no fee or approval rule, because the operator sets both. */
export function HowItWorksPage() {
    return (
        <article className="mx-auto max-w-prose space-y-10 px-4 py-12">
            <header className="space-y-3">
                <h1 className="text-3xl font-semibold">How it works</h1>
                <p className="text-muted-foreground">Four steps from an idea to money in your account.</p>
            </header>
            {STEPS.map((step, i) => (
                <section key={step.heading} className="space-y-2">
                    <h2 className="text-xl font-semibold">
                        <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}.</span>
                        {step.heading}
                    </h2>
                    <p className="leading-relaxed">{step.body}</p>
                </section>
            ))}
            <div>
                <Link to="/create-campaign" className={buttonVariants()}>Start a campaign</Link>
            </div>
        </article>
    );
}
