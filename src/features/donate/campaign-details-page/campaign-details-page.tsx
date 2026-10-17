import dayjs from "dayjs";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Progress} from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CampaignCover} from "@/features/donate/campaign-cover";
import {DonatePanel} from "@/features/donate/donate-panel";
import {DonorsList} from "@/features/donate/donors-list";
import {ReportDialog} from "@/features/donate/report-dialog";
import {ShareButtons} from "@/features/donate/share-buttons";
import {StoryContent} from "@/features/donate/story-content";
import {UpdatesList} from "@/features/donate/updates-list";
import {formatMinorAmount} from "@/helpers/formatAmount";
import type {CampaignUpdate, RecentDonor} from "@/lib/campaigns/repository";
import type {CampaignDetails} from "@/lib/campaigns/types";

interface CampaignDetailsPageProps {
    campaign: CampaignDetails;
    storyHtml: string;
    updates: CampaignUpdate[];
    donors: RecentDonor[];
    ended: boolean;
    acceptingDonations: boolean;
    donationReturn: "success" | "cancelled" | null;
}

export function CampaignDetailsPage({
    campaign,
    storyHtml,
    updates,
    donors,
    ended,
    acceptingDonations,
    donationReturn,
}: CampaignDetailsPageProps) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
                    <div className="overflow-hidden rounded-3xl">
                        <CampaignCover src={campaign.imageUrl}/>
                    </div>
                    <header className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{campaign.category}</Badge>
                            <Badge variant="outline">{campaign.country}</Badge>
                            {ended ? <Badge variant="destructive">Ended</Badge> : null}
                        </div>
                        <h1 className="text-3xl font-semibold leading-tight">{campaign.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Created by {campaign.organizerName} on {dayjs(campaign.createdAt).format("D MMM YYYY")}
                        </p>
                        <p className="text-muted-foreground">{campaign.description}</p>
                    </header>
                    {donationReturn === "success" ? (
                        <Alert role="status">
                            <AlertTitle>Thank you for your donation!</AlertTitle>
                            <AlertDescription>
                                Your payment is being confirmed. The total updates as soon as it is.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {ended ? (
                        <Alert role="status">
                            <AlertDescription>This campaign has ended and is no longer accepting donations.</AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
                    <Card>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <p className="text-3xl font-semibold">
                                    {formatMinorAmount(campaign.raisedAmount, campaign.currency)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    raised of {formatMinorAmount(campaign.goalAmount, campaign.currency)} ·{" "}
                                    {campaign.donorCount} {campaign.donorCount === 1 ? "donor" : "donors"}
                                </p>
                                <Progress value={campaign.percentFunded} aria-label="Funding progress"/>
                                <p className="text-sm font-medium">{campaign.percentFunded}% funded</p>
                            </div>
                            <DonatePanel
                                currency={campaign.currency}
                                acceptingDonations={acceptingDonations}
                                notice={
                                    donationReturn === "cancelled"
                                        ? "Your donation was cancelled. You have not been charged."
                                        : null
                                }
                            />
                        </CardContent>
                    </Card>
                    <ShareButtons title={campaign.title}/>
                    <ReportDialog/>
                </aside>

                <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                    <Tabs defaultValue="story">
                        <TabsList>
                            <TabsTrigger value="story">Story</TabsTrigger>
                            <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
                            <TabsTrigger value="donors">Donors</TabsTrigger>
                        </TabsList>
                        <TabsContent value="story" className="pt-4">
                            {storyHtml ? <StoryContent html={storyHtml}/> : (
                                <p className="text-sm text-muted-foreground">The organiser has not written a story yet.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="updates" className="pt-4">
                            <UpdatesList updates={updates}/>
                        </TabsContent>
                        <TabsContent value="donors" className="pt-4">
                            <DonorsList donors={donors}/>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}