import {IconCircleCheck, IconClock, IconAlertTriangle} from "@tabler/icons-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {ShareButtons} from "@/features/donate/share-buttons";

/** The publish action's outcomes, as the server names them (see lib/stripe/connect `PublishResult`). */
export type PublishOutcome = "live" | "awaiting_approval" | "not_connected" | "bad_goal";

interface PublishResultProps {
    result: PublishOutcome;
    /** Campaign title, used as the subject of the share links. */
    title: string;
    /** Absolute campaign URL. Only shown once the campaign is live, because it is not public before that. */
    shareUrl: string;
}

/** The result of pressing Publish: live with a link, waiting for an admin, or a fix the organiser must make. */
export function PublishResult({result, title, shareUrl}: PublishResultProps) {
    if (result === "live") {
        return (
            <section className="space-y-4 rounded-xl border p-6">
                <div className="flex items-start gap-3">
                    <IconCircleCheck className="mt-1 size-6 text-primary" aria-hidden="true"/>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Your campaign is live</h2>
                        <p className="text-sm text-muted-foreground">Anyone can find and donate to it now. Share it to get started.</p>
                    </div>
                </div>
                <p className="break-all rounded-md bg-muted px-3 py-2 text-sm">{shareUrl}</p>
                <ShareButtons title={title} url={shareUrl}/>
            </section>
        );
    }
    if (result === "awaiting_approval") {
        return (
            <section className="space-y-3 rounded-xl border p-6">
                <div className="flex items-start gap-3">
                    <IconClock className="mt-1 size-6 text-muted-foreground" aria-hidden="true"/>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Waiting for approval</h2>
                        <p className="text-sm text-muted-foreground">
                            An admin reviews every campaign before it goes live. You will not be able to share the link until it
                            is approved. You can keep editing the campaign meanwhile.
                        </p>
                    </div>
                </div>
            </section>
        );
    }
    const message =
        result === "not_connected"
            ? "Connect Stripe before you publish. Donations need a connected account to be paid out."
            : "Your goal is not valid for this campaign's currency. Check the goal amount and try again.";
    return (
        <Alert variant="destructive" role="alert">
            <IconAlertTriangle aria-hidden="true"/>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
