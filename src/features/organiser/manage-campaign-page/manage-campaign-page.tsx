import {Form} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CloseCampaign} from "@/features/organiser/close-campaign";
import {PostUpdateForm} from "@/features/organiser/post-update-form";
import {PublishResult, type PublishOutcome} from "@/features/organiser/publish-result";
import {ManageDonors} from "@/features/organiser/manage-donors";
import {BasicsStep} from "@/features/organiser/basics-step";
import {GoalStep} from "@/features/organiser/goal-step";
import {StoryStep} from "@/features/organiser/story-step";
import {formatDate} from "@/helpers/formatDate";
import type {RecentDonor} from "@/lib/campaigns/repository";
import type {StoryDoc} from "@/lib/campaigns/story-doc";

interface ManageCampaignPageProps {
    campaignId: string;
    title: string;
    status: string;
    updates: {id: string; body: string; createdAt: string}[];
    donors: RecentDonor[];
    /** Result of the last publish attempt, from the ?publish= query, or null. */
    publish: PublishOutcome | null;
    saved: boolean;
    moderationNotice: string | null;
    lifecycleNotice: string | null;
    lifecycleError: string | null;
    formErrors: Record<string, string | undefined>;
    currency: string | null;
    stripeStatus: "not_started" | "incomplete" | "connected";
    defaults: {title?: string; category?: string; country?: string; description?: string; goal?: string; endDate?: string; story?: StoryDoc; coverUrl?: string};
    storyHtml: string;
    publicUrl: string;
}

/**
 * Manage one campaign: its details, the latest publish result, updates to supporters, donors, and closing.
 * The edit form posts to this route, which saves through the same action the create flow uses.
 */
export function ManageCampaignPage(props: ManageCampaignPageProps) {
    const {campaignId, title, status, updates, donors, publish, saved, moderationNotice, lifecycleNotice, lifecycleError, formErrors, currency, stripeStatus, defaults, publicUrl} = props;
    const closed = status === "closed" || status === "ended";
    return (
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
            <header className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{status}</Badge>
                </div>
                <h1 className="text-3xl font-semibold">{title}</h1>
            </header>

            {moderationNotice ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{moderationNotice}</AlertDescription>
                </Alert>
            ) : null}
            {publish ? <PublishResult result={publish} title={title} shareUrl={publicUrl}/> : null}
            {saved ? (
                <Alert role="status">
                    <AlertDescription>{status === "draft" ? "Draft saved." : "Changes saved."}</AlertDescription>
                </Alert>
            ) : null}
            {lifecycleNotice ? (
                <Alert role="status">
                    <AlertDescription>{lifecycleNotice}</AlertDescription>
                </Alert>
            ) : null}
            {lifecycleError ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{lifecycleError}</AlertDescription>
                </Alert>
            ) : null}
            {formErrors.form ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{formErrors.form}</AlertDescription>
                </Alert>
            ) : null}

            <section aria-labelledby="details-heading" className="space-y-6">
                <h2 id="details-heading" className="text-xl font-semibold">Details</h2>
                <Form method="post" encType="multipart/form-data" className="space-y-8">
                    <BasicsStep errors={formErrors} defaults={{title: defaults.title, category: defaults.category, country: defaults.country, description: defaults.description}}/>
                    <StoryStep errors={formErrors} defaults={{story: defaults.story, coverUrl: defaults.coverUrl}}/>
                    <GoalStep errors={formErrors} defaults={{goal: defaults.goal, endDate: defaults.endDate}} currency={currency}/>
                    {stripeStatus === "connected" ? null : (
                        <p className="text-sm text-muted-foreground">Connect Stripe to publish changes to a draft.</p>
                    )}
                    <Button type="submit">Save changes</Button>
                </Form>
            </section>

            <section aria-labelledby="updates-heading" className="space-y-4">
                <h2 id="updates-heading" className="text-xl font-semibold">Updates</h2>
                {closed ? null : <PostUpdateForm/>}
                <ul className="space-y-3">
                    {updates.map((u) => (
                        <li key={u.id} className="rounded-xl border p-4">
                            <p className="whitespace-pre-wrap text-sm">{u.body}</p>
                            <time dateTime={u.createdAt} className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</time>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="donors-heading" className="space-y-4">
                <h2 id="donors-heading" className="text-xl font-semibold">Donors</h2>
                <ManageDonors donors={donors}/>
            </section>

            {closed ? null : (
                <section aria-labelledby="close-heading" className="space-y-3 border-t pt-8">
                    <h2 id="close-heading" className="text-xl font-semibold">Close campaign</h2>
                    <p className="text-sm text-muted-foreground">Closing ends donations to this campaign for good.</p>
                    <CloseCampaign/>
                </section>
            )}
            <input type="hidden" name="campaignId" value={campaignId}/>
        </div>
    );
}
