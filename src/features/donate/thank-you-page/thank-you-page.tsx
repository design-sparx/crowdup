import {Link} from "react-router";
import {IconHeartHandshake} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {ShareButtons} from "@/features/donate/share-buttons";

interface ThankYouPageProps {
    campaign: {title: string; slug: string};
    signedIn: boolean;
}

/**
 * Where Stripe sends donors after paying. It deliberately shows no amount and makes no claim that a
 * donation exists: the webhook records it, maybe after this page loads, and anyone can open this URL.
 */
export function ThankYouPage({campaign, signedIn}: ThankYouPageProps) {
    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted text-primary">
                <IconHeartHandshake className="size-7" aria-hidden="true"/>
            </div>
            <h1 className="text-3xl font-semibold">Thank you</h1>
            <p className="mt-3 text-muted-foreground">
                Thanks for supporting {campaign.title}. Sharing it helps it reach more people.
            </p>
            <ShareButtons title={campaign.title} className="mt-6 justify-center"/>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to={`/campaigns/${encodeURIComponent(campaign.slug)}`} className={buttonVariants()}>
                    Back to the campaign
                </Link>
                <Link to="/campaigns" className={buttonVariants({variant: "outline"})}>
                    Browse more campaigns
                </Link>
                {signedIn ? (
                    <Link to="/dashboard/donations" className={buttonVariants({variant: "outline"})}>
                        View my donations
                    </Link>
                ) : null}
            </div>
        </div>
    );
}