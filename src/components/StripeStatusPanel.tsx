import {Alert, Badge, Button, Group, Paper, Stack, Text, Title} from "@mantine/core";
import {Form, Link} from "react-router";
import {ONBOARDING_LABELS, type OnboardingStatus} from "../lib/stripe/onboarding";
import {campaignLiveExplanation, type PublishingMode} from "../lib/stripe/publishing";

export interface StripePanelProps {
    status: OnboardingStatus;
    currency: string | null;
    mode: PublishingMode;
    campaigns: {id: string; title: string; status: string; rejectionReason?: string | null}[];
    /** Result of returning from Stripe (?stripe=...), shown once. */
    notice?: string | null;
}

const COLORS: Record<OnboardingStatus, string> = {not_started: "gray", incomplete: "yellow", connected: "green"};

const NOTICES: Record<string, string> = {
    error: "We could not read your Stripe status. Please try again.",
    incomplete: "Stripe still needs a few details from you. Continue onboarding to finish.",
    connected: "Your Stripe account is connected.",
};

/** Organiser's Stripe payout status and why each campaign is or is not live. */
const StripeStatusPanel = ({status, currency, mode, campaigns, notice}: StripePanelProps) => (
    <Paper p="md" shadow="sm" withBorder>
        <Stack gap="sm">
            <Group justify="space-between">
                <Title order={4}>Payouts with Stripe</Title>
                <Badge color={COLORS[status]} data-testid="stripe-status">{ONBOARDING_LABELS[status]}</Badge>
            </Group>
            {notice && NOTICES[notice] && (
                <Alert color={notice === "error" ? "red" : notice === "connected" ? "green" : "yellow"}>
                    {NOTICES[notice]}
                </Alert>
            )}
            <Text size="sm" c="dimmed">
                {status === "connected"
                    ? `Donations go straight to your own Stripe account. Campaign currency: ${currency}.`
                    : "Connect your own Stripe account so donations go straight to you. CrowdUp never holds your funds."}
            </Text>
            {status !== "connected" && (
                <Form method="post" action="/stripe/connect">
                    <Button type="submit">{status === "incomplete" ? "Continue Stripe onboarding" : "Connect Stripe"}</Button>
                </Form>
            )}
            {campaigns.length > 0 && (
                <Stack gap={4}>
                    {campaigns.map((c) => (
                        <Group key={c.id} justify="space-between" wrap="nowrap" align="flex-start">
                            <div>
                                <Text component={Link} to={`/campaigns/${c.id}/edit`} size="sm" fw={500}>{c.title}</Text>
                                <Text size="xs" c="dimmed">{campaignLiveExplanation({status: c.status, rejectionReason: c.rejectionReason, onboarding: status, mode})}</Text>
                            </div>
                            {c.status === "draft" && status === "connected" && (
                                <Form method="post" action={`/campaigns/${c.id}/publish`}>
                                    <Button type="submit" size="xs" variant="light">{mode === "approval" ? "Submit for approval" : "Publish"}</Button>
                                </Form>
                            )}
                        </Group>
                    ))}
                </Stack>
            )}
        </Stack>
    </Paper>
);

export default StripeStatusPanel;
