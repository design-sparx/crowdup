import {
    Box,
    Button,
    Card,
    Container,
    Flex,
    Group,
    Paper,
    PaperProps,
    SimpleGrid,
    Stack,
    Text,
    Title,
    TitleProps
} from "@mantine/core";
import {IconPlus, IconReceipt2, IconTrophy, IconUsers} from "@tabler/icons-react";
import {Link} from "react-router";
import {DonationsChart, OrganiserCampaignsTable, RecentDonorsTable} from "../components";
import {formatMinorAmount} from "../helpers/formatAmount";
import {
    bucketDonations,
    summarize,
    type DashboardCampaign,
    type DashboardDonation
} from "../lib/dashboard/dashboard";
import classes from "./Dashboard.module.css";

interface Props {
    campaigns: DashboardCampaign[];
    donations: DashboardDonation[];
    name: string;
    now: string;
}

const paperProps: PaperProps = {p: "md", shadow: "sm"};
const subTitleProps: TitleProps = {size: 18, mb: "sm"};

const EmptyState = ({title, children}: {title: string; children?: React.ReactNode}) => (
    <Stack align="center" gap="xs" py="xl">
        <Text fw={600}>{title}</Text>
        {children}
    </Stack>
);

const DashboardPage = ({campaigns, donations, name, now}: Props) => {
    const {campaigns: stats, totalsByCurrency} = summarize(campaigns, donations);
    const titles = Object.fromEntries(campaigns.map((c) => [c.id, c.title]));
    const hasChartData = bucketDonations(donations, 30, new Date(now)).series.length > 0;
    const activeCount = campaigns.filter((c) => c.status === "live").length;
    const donorCount = donations.length;

    return (
        <>
            <title>Dashboard</title>
            <Box>
                <Container fluid my="xl">
                    <Stack gap="xl">
                        <Title order={3}>{name ? `Welcome, ${name}` : "Welcome"}</Title>
                        <SimpleGrid cols={{base: 1, sm: 3}} spacing={{base: "sm", sm: "md"}}>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>Total raised</Text>
                                    <IconReceipt2 className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>
                                <Stack gap={4} mt={25}>
                                    {totalsByCurrency.length === 0 ? (
                                        <Text className={classes.value}>0</Text>
                                    ) : (
                                        totalsByCurrency.map((t) => (
                                            <Text key={t.currency} className={classes.value}>
                                                {formatMinorAmount(t.raised, t.currency)}
                                            </Text>
                                        ))
                                    )}
                                </Stack>
                            </Paper>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>Donations received</Text>
                                    <IconUsers className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>
                                <Text className={classes.value} mt={25}>{donorCount}</Text>
                            </Paper>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>Live campaigns</Text>
                                    <IconTrophy className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>
                                <Text className={classes.value} mt={25}>{activeCount}</Text>
                            </Paper>
                        </SimpleGrid>
                        <Card padding="md" shadow="sm">
                            <Card.Section mb="lg" px="md" pt="md">
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <Title {...subTitleProps}>Campaigns</Title>
                                        <Text size="sm">Let&apos;s manage your campaigns</Text>
                                    </Box>
                                    <Button
                                        leftSection={<IconPlus size={18}/>}
                                        component={Link}
                                        to="/create-campaign"
                                    >
                                        Create a Campaign
                                    </Button>
                                </Flex>
                            </Card.Section>
                            <Card.Section>
                                {stats.length === 0 ? (
                                    <EmptyState title="You have no campaigns yet">
                                        <Button component={Link} to="/create-campaign" variant="light">
                                            Create your first campaign
                                        </Button>
                                    </EmptyState>
                                ) : (
                                    <OrganiserCampaignsTable campaigns={stats}/>
                                )}
                            </Card.Section>
                        </Card>
                        <Card padding="md" shadow="sm">
                            <Title {...subTitleProps}>Recent donors</Title>
                            <Card.Section mt="md">
                                {donations.length === 0 ? (
                                    <EmptyState title="No donations yet"/>
                                ) : (
                                    <RecentDonorsTable donations={donations} campaignTitles={titles}/>
                                )}
                            </Card.Section>
                        </Card>
                        <Paper {...paperProps}>
                            <Title {...subTitleProps}>Donations, last 30 days</Title>
                            {hasChartData ? (
                                <DonationsChart donations={donations} now={now}/>
                            ) : (
                                <EmptyState title="No donations in the last 30 days"/>
                            )}
                        </Paper>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default DashboardPage;
