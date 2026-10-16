import {Alert, Anchor, Badge, Button, Card, Container, Group, Stack, Text, TextInput, Title} from "@mantine/core";
import {Link, useFetcher, useLoaderData} from "react-router";
import type {AdminCampaignRow} from "../data-access/moderation/moderation.server";
import {canSuspendCampaign} from "../lib/moderation/moderation";

const Row = ({c}: {c: AdminCampaignRow}) => {
    const fetcher = useFetcher<{error?: string}>();
    const busy = fetcher.state !== "idle";
    return (
        <Card withBorder>
            <Group justify="space-between" align="flex-start">
                <div>
                    <Anchor component={Link} to={`/campaigns/${c.slug}`} fw={600}>{c.title}</Anchor>
                    <div><Badge color={c.status === "suspended" ? "red" : "gray"} variant="light">{c.status}</Badge></div>
                    {c.suspendedReason && <Text size="sm" c="dimmed" mt={4}>Reason: {c.suspendedReason}</Text>}
                </div>
                {c.status === "suspended" ? (
                    <fetcher.Form method="post">
                        <input type="hidden" name="campaignId" value={c.id}/>
                        <input type="hidden" name="intent" value="restore"/>
                        <Button type="submit" variant="default" loading={busy}>Restore</Button>
                    </fetcher.Form>
                ) : canSuspendCampaign(c.status) ? (
                    <fetcher.Form method="post">
                        <input type="hidden" name="campaignId" value={c.id}/>
                        <input type="hidden" name="intent" value="suspend"/>
                        <Group align="flex-end" wrap="nowrap">
                            <TextInput name="reason" label="Reason" placeholder="Required" required minLength={3} maxLength={1000}/>
                            <Button type="submit" color="red" loading={busy}>Suspend</Button>
                        </Group>
                    </fetcher.Form>
                ) : null}
            </Group>
            {fetcher.data?.error && <Alert color="red" mt="sm">{fetcher.data.error}</Alert>}
        </Card>
    );
};

const AdminCampaignsPage = () => {
    const {campaigns} = useLoaderData() as {campaigns: AdminCampaignRow[]};
    return (
        <Container size="md" py="lg">
            <Title order={2} mb="md">Campaigns</Title>
            {campaigns.length === 0 ? <Alert>No campaigns.</Alert> : (
                <Stack>{campaigns.map((c) => <Row key={c.id} c={c}/>)}</Stack>
            )}
        </Container>
    );
};

export default AdminCampaignsPage;
