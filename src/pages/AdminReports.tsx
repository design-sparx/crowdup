import {Alert, Anchor, Badge, Button, Card, Container, Group, List, Stack, Text, Title} from "@mantine/core";
import {Link, useFetcher, useLoaderData} from "react-router";
import type {ReportGroup} from "../lib/reports/reports";

const DismissButton = ({ids}: {ids: string[]}) => {
    const fetcher = useFetcher();
    return (
        <fetcher.Form method="post">
            <input type="hidden" name="intent" value="dismiss"/>
            {ids.map((id) => <input key={id} type="hidden" name="reportId" value={id}/>)}
            <Button type="submit" variant="default" loading={fetcher.state !== "idle"}>Dismiss</Button>
        </fetcher.Form>
    );
};

const AdminReportsPage = () => {
    const {groups} = useLoaderData() as {groups: ReportGroup[]};
    return (
        <Container size="md" py="lg">
            <Title order={2} mb="md">Open reports</Title>
            {groups.length === 0 ? (
                <Alert color="green">No open reports.</Alert>
            ) : (
                <Stack>
                    {groups.map((group) => (
                        <Card key={group.campaignId} withBorder>
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Anchor component={Link} to={`/campaigns/${group.slug}`} fw={600}>{group.title}</Anchor>
                                    <Text size="sm" c="dimmed">
                                        {group.reportCount} {group.reportCount === 1 ? "report" : "reports"}
                                    </Text>
                                </div>
                                <Group>
                                    <Badge color="red">{group.reportCount}</Badge>
                                    <DismissButton ids={group.reportIds}/>
                                </Group>
                            </Group>
                            <List size="sm" mt="sm" spacing={4}>
                                {group.reasons.map((reason, i) => <List.Item key={i}>{reason}</List.Item>)}
                            </List>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default AdminReportsPage;
