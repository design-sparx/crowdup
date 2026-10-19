import {IconAlertTriangle, IconFlask} from "@tabler/icons-react";
import type {DemoBannerState} from "@/lib/demo/demo";

export function DemoBanner({state}: {state: DemoBannerState | undefined}) {
    if (!state || state === "hidden") return null;
    const warning = state === "live-key-warning";
    return (
        <div
            role={warning ? "alert" : "status"}
            className={
                warning
                    ? "flex items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive"
                    : "flex items-center justify-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground"
            }
        >
            {warning ? <IconAlertTriangle className="size-4"/> : <IconFlask className="size-4"/>}
            {warning
                ? "Demo mode is on but the Stripe key is not a test key. Do not take real payments."
                : "Demo site: payments run in Stripe test mode. No real money moves."}
        </div>
    );
}
