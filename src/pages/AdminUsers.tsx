import {Alert, Badge, Button, Card, Container, Group, Stack, Text, TextInput, Title} from "@mantine/core";
import {useFetcher, useLoaderData} from "react-router";
import type {AdminUserRow} from "../data-access/moderation/moderation.server";

const Row = ({u, isSelf}: {u: AdminUserRow; isSelf: boolean}) => {
    const fetcher = useFetcher<{error?: string}>();
    const busy = fetcher.state !== "idle";
    return (
        <Card withBorder>
            <Group justify="space-between" align="flex-start">
                <div>
                    <Text fw={600}>{u.displayName || u.id}</Text>
                    <Group gap={6}>
                        <Badge variant="light">{u.role}</Badge>
                        {u.suspended && <Badge color="red" variant="light">suspended</Badge>}
                    </Group>
                    {u.suspendedReason && <Text size="sm" c="dimmed" mt={4}>Reason: {u.suspendedReason}</Text>}
                </div>
                {u.suspended ? (
                    <fetcher.Form method="post">
                        <input type="hidden" name="userId" value={u.id}/>
                        <input type="hidden" name="intent" value="unsuspend"/>
                        <Button type="submit" variant="default" loading={busy}>Unsuspend</Button>
                    </fetcher.Form>
                ) : !isSelf ? (
                    <fetcher.Form method="post">
                        <input type="hidden" name="userId" value={u.id}/>
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

const AdminUsersPage = () => {
    const {users, selfId} = useLoaderData() as {users: AdminUserRow[]; selfId: string};
    return (
        <Container size="md" py="lg">
            <Title order={2} mb="md">Users</Title>
            <Stack>{users.map((u) => <Row key={u.id} u={u} isSelf={u.id === selfId}/>)}</Stack>
        </Container>
    );
};

export default AdminUsersPage;
