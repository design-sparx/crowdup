import {AppShell, Badge, Container, Group, Text, Title} from "@mantine/core";
import {Link, Outlet, useLoaderData} from "react-router";
import classes from "./Dashboard.module.css";

const AdminLayout = () => {
    const {openCount} = useLoaderData() as {openCount: number};
    return (
        <AppShell header={{height: 60}} classNames={{main: classes.main}}>
            <AppShell.Header>
                <Container fluid h="100%">
                    <Group h="100%" justify="space-between">
                        <Title order={3}>CrowdUp admin</Title>
                        <Group gap="md">
                            <Link to="/admin/reports" style={{textDecoration: "none"}}>
                                <Group gap={6}>
                                    <Text c="dark">Reports</Text>
                                    <Badge color="red" aria-label={`${openCount} open reports`}>{openCount}</Badge>
                                </Group>
                            </Link>
                            <Text component={Link} to="/dashboard" c="dimmed">Dashboard</Text>
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>
            <AppShell.Main>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    );
};

export default AdminLayout;
