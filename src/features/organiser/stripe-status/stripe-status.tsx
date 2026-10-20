import {IconCircleCheck} from "@tabler/icons-react";
import {StripeConnectButton} from "@/features/organiser/stripe-connect-button";

export type StripeOnboardingStatus = "not_started" | "incomplete" | "connected";

interface StripeStatusProps {
    status: StripeOnboardingStatus;
    /** Payout currency, set by Stripe once connected. Null before that. */
    currency: string | null;
}

/** Shows where the organiser's Stripe account stands. The button POSTs to the existing /stripe/connect action. */
export function StripeStatus({status, currency}: StripeStatusProps) {
    if (status === "connected") {
        return (
            <div className="flex items-start gap-3 rounded-xl border p-4">
                <IconCircleCheck className="mt-0.5 size-5 text-primary" aria-hidden="true"/>
                <div className="space-y-1">
                    <p className="font-medium">Connected to Stripe</p>
                    <p className="text-sm text-muted-foreground">
                        Donations are paid in {currency ?? "your account currency"}, straight to your bank.
                    </p>
                </div>
            </div>
        );
    }
    const unfinished = status === "incomplete";
    return (
        <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-1">
                <p className="font-medium">{unfinished ? "Stripe setup is not finished" : "Connect Stripe to receive donations"}</p>
                <p className="text-sm text-muted-foreground">
                    CrowdUp uses Stripe to take donations and pay them out to you. You will set this up on Stripe&apos;s
                    secure site, and it only takes a few minutes.
                </p>
            </div>
            <StripeConnectButton label={unfinished ? "Finish Stripe setup" : "Connect Stripe"}/>
        </div>
    );
}
