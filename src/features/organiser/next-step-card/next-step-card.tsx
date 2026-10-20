import {Form, Link} from "react-router";
import {IconArrowRight} from "@tabler/icons-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {StripeConnectButton} from "@/features/organiser/stripe-connect-button";
import type {NextStep} from "@/lib/dashboard/next-step";

interface NextStepCardProps {
    step: NextStep;
}

/** The one thing the organiser should do next. Each action uses an existing route; nothing new is posted. */
export function NextStepCard({step}: NextStepCardProps) {
    if (step.kind === "none") return null;
    if (step.kind === "connect_stripe") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connect Stripe to receive donations</CardTitle>
                    <CardDescription>Donations are paid out to your bank through Stripe. It takes a few minutes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StripeConnectButton/>
                </CardContent>
            </Card>
        );
    }
    if (step.kind === "publish") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Publish your campaign</CardTitle>
                    <CardDescription>Your draft is ready. Publish it to start taking donations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" action={`/campaigns/${step.campaignId}/publish`}>
                        <Button type="submit">Publish campaign</Button>
                    </Form>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Share your campaign</CardTitle>
                <CardDescription>Your campaign is live. Share the link to bring in donors.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link to={`/campaigns/${step.slug}`} className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
                    View your campaign <IconArrowRight className="size-4" aria-hidden="true"/>
                </Link>
            </CardContent>
        </Card>
    );
}
