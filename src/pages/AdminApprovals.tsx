import {Alert, Badge, Button, Card, Container, Group, Stack, Text, Textarea, Title} from "@mantine/core";
import {useFetcher, useLoaderData} from "react-router";
import {formatMinorAmount} from "../helpers/formatAmount";
import type {PendingCampaign} from "../lib/campaigns/pending";
import {REJECTION_REASON_MAX} from "../lib/campaigns/transitions";

const DecisionForm = ({id}: {id: string}) => {
    const fetcher = useFetcher<{error?: string; message?: string}>();
    const busy = fetcher.state !== "idle";
    return (
        <fetcher.Form method="post">
            <Stack gap="xs" mt="sm">
                {fetcher.data?.error && <Alert color="red">{fetcher.data.error}</Alert>}
                <input type="hidden" name="campaignId" value={id}/>
                <Textarea
                    name="reason"
                    label="Rejection reason (required to reject)"
                    maxLength={REJECTION_REASON_MAX}
                    autosize
                    minRows={2}
                />
                <Group>
                    <Button type="submit" name="intent" value="approve" color="green" loading={busy}>Approve</Button>
                    <Button type="submit" name="intent" value="reject" color="red" variant="light" loading={busy}>Reject</Button>
                </Group>
            </Stack>
        </fetcher.Form>
    );
};

const AdminApprovalsPage = () => {
    const {campaigns} = useLoaderData() as {campaigns: PendingCampaign[]};
    return (
        <Container size="md" py="lg">
            <title>Campaigns pending approval</title>
            <Title order={2} mb="md">Campaigns pending approval</Title>
            {campaigns.length === 0 ? (
                <Alert color="green">Nothing waiting for approval.</Alert>
            ) : (
                <Stack>
                    {campaigns.map((c) => (
                        <Card key={c.id} withBorder>
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Text fw={600}>{c.title}</Text>
                                    <Text size="sm" c="dimmed">By {c.organizerName}</Text>
                                </div>
                                <Badge color="yellow">Pending</Badge>
                            </Group>
                            <Text size="sm" mt="xs">{c.description}</Text>
                            <Text size="sm" c="dimmed" mt="xs">
                                {c.category} · {c.country}
                                {c.currency ? ` · Goal ${formatMinorAmount(c.goalAmount, c.currency)}` : ""}
                            </Text>
                            <DecisionForm id={c.id}/>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default AdminApprovalsPage;
