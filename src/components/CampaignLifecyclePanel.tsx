import {Form, useNavigation} from "react-router";
import {Alert, Button, Container, Group, Paper, Stack, Text, Textarea, Title} from "@mantine/core";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import {MAX_UPDATE_LENGTH} from "../lib/campaigns/updates";
import type {CampaignUpdate} from "../lib/campaigns/repository";

dayjs.extend(LocalizedFormat);

interface Props {
    status: string;
    updates: CampaignUpdate[];
    notice?: string;
    error?: string;
}

/**
 * Owner-only controls on the edit page: post a plain-text update and close the campaign.
 * Separate forms (never nested in the campaign form), each with an explicit intent.
 */
const CampaignLifecyclePanel = ({status, updates, notice, error}: Props) => {
    const navigation = useNavigation();
    const busy = navigation.state !== "idle";
    const canUpdate = status === "live" || status === "closed";

    return (
        <Container size="md" mb={36}>
            <Paper p="md" shadow="sm">
                <Stack gap="md">
                    <Title order={3}>Updates and lifecycle</Title>
                    {notice && <Alert color="green">{notice}</Alert>}
                    {error && <Alert color="red">{error}</Alert>}

                    {canUpdate && (
                        <Form method="post">
                            <input type="hidden" name="intent" value="post-update"/>
                            <Stack gap="xs">
                                <Textarea
                                    name="body"
                                    label="Post an update"
                                    description="Plain text. Visible to everyone on the campaign page."
                                    maxLength={MAX_UPDATE_LENGTH}
                                    minRows={3}
                                    autosize
                                    required
                                />
                                <Group justify="flex-end">
                                    <Button type="submit" loading={busy}>Post update</Button>
                                </Group>
                            </Stack>
                        </Form>
                    )}

                    {updates.length > 0 && (
                        <Stack gap="xs">
                            <Text fw={600}>Posted updates</Text>
                            {updates.map((u) => (
                                <Text key={u.id} size="sm" style={{whiteSpace: "pre-wrap"}}>
                                    <Text span c="dimmed">{dayjs(u.createdAt).format("LL")}: </Text>
                                    {u.body}
                                </Text>
                            ))}
                        </Stack>
                    )}

                    {status === "live" && (
                        <Form method="post">
                            <input type="hidden" name="intent" value="close"/>
                            <Group justify="space-between">
                                <Text size="sm">Closing stops new donations. This cannot be undone.</Text>
                                <Button type="submit" color="red" variant="outline" loading={busy}>
                                    Close campaign
                                </Button>
                            </Group>
                        </Form>
                    )}
                    {status === "closed" && <Text size="sm" c="dimmed">This campaign is closed.</Text>}
                </Stack>
            </Paper>
        </Container>
    );
};

export default CampaignLifecyclePanel;
