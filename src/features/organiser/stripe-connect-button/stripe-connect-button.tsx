import {useFetcher} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {CONNECT_STRIPE_ACTION, type StripeConnectActionData} from "@/lib/stripe/connectAction";

interface StripeConnectButtonProps {
    /** Button text. Defaults to "Connect Stripe". */
    label?: string;
}

/**
 * Starts Stripe onboarding and shows why it failed, if it did.
 *
 * A plain `Form` could not do this: the action lives on another route, so `useActionData` never
 * sees its error and a failed attempt looked like nothing happened. A fetcher posts to the
 * action, receives the failure as `fetcher.data`, and follows the redirect to Stripe on success.
 */
export function StripeConnectButton({label = "Connect Stripe"}: StripeConnectButtonProps) {
    const fetcher = useFetcher<StripeConnectActionData>();
    const starting = fetcher.state !== "idle";
    const error = fetcher.data?.error;

    return (
        <div className="space-y-3">
            <fetcher.Form method="post" action={CONNECT_STRIPE_ACTION}>
                <Button type="submit" disabled={starting}>
                    {starting ? "Opening Stripe..." : label}
                </Button>
            </fetcher.Form>
            {error ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
