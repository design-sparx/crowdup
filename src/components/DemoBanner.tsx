import {Alert} from "@mantine/core";
import type {DemoBannerState} from "../lib/demo/demo";

/** Site-wide notice on the public demo. Renders nothing when demo mode is off. */
export function DemoBanner({state}: {state: DemoBannerState | undefined}) {
    if (!state || state === "hidden") return null;

    if (state === "live-key-warning") {
        return (
            <Alert color="red" variant="filled" radius={0} role="alert" data-testid="demo-banner-warning">
                Misconfiguration: DEMO_MODE is on but Stripe is not using a test key. Do not enter real card details.
            </Alert>
        );
    }

    return (
        <Alert color="yellow" variant="light" radius={0} data-testid="demo-banner">
            This is a demo in Stripe test mode. Pay with test card 4242 4242 4242 4242 (any future expiry, any CVC).
            Data resets on a schedule.
        </Alert>
    );
}
