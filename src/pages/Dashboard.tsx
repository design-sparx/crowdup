import {
    Box,
    Button,
    Card,
    Container,
    createStyles,
    Flex,
    Group,
    Paper,
    rem,
    SimpleGrid,
    Stack,
    Text,
    Title
} from "@mantine/core";
import {DashboardLayout} from "../layout";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconFunction,
    IconPlus,
    IconReceipt2,
    IconTrophy
} from "@tabler/icons-react";
import {CampaignsTable, YearlyDonationChart, DonatorsTable} from "../components";
import {Helmet} from "react-helmet";

const useStyles = createStyles((theme) => ({
    root: {
        padding: `calc(${theme.spacing.xl} * 1.5)`,
    },

    value: {
        fontSize: rem(24),
        fontWeight: 700,
        lineHeight: 1,
    },

    diff: {
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },

    icon: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
    },

    title: {
        fontWeight: 700,
        textTransform: 'uppercase',
    },
}));

const DashboardPage = () => {
    const {classes} = useStyles();

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>
            <DashboardLayout>
                <Container fluid>
                    <Stack>
                        <Title>Good evening, Jane</Title>
                        <SimpleGrid cols={4}>
                            <Paper withBorder p="md" radius="md">
                                <Group position="apart">
                                    <Text size="xs" color="dimmed" className={classes.title}>
                                        Total Donations
                                    </Text>
                                    <IconReceipt2 className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" spacing="xs" mt={25}>
                                    <Text className={classes.value}>$100,202.10</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text color={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>10%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md">
                                <Group position="apart">
                                    <Text size="xs" color="dimmed" className={classes.title}>
                                        Today's Donations
                                    </Text>
                                    <IconReceipt2 className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" spacing="xs" mt={25}>
                                    <Text className={classes.value}>$1,202.10</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text color={-3 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>30.1%</span>
                                        <IconArrowDownRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to yesterday
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md">
                                <Group position="apart">
                                    <Text size="xs" color="dimmed" className={classes.title}>
                                        Average Donations per Campaign
                                    </Text>
                                    <IconFunction className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" spacing="xs" mt={25}>
                                    <Text className={classes.value}>34%</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text color={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>4.2%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
                            </Paper>
                            <Paper withBorder p="md" radius="md">
                                <Group position="apart">
                                    <Text size="xs" color="dimmed" className={classes.title}>
                                        Active Campaigns
                                    </Text>
                                    <IconTrophy className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" spacing="xs" mt={25}>
                                    <Text className={classes.value}>13</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text color={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>11.1%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
                            </Paper>
                        </SimpleGrid>
                        <Card>
                            <Card.Section>
                                <Flex>
                                    <Box>
                                        <Title>Campaigns</Title>
                                        <Text>Let&apos;s manage your campaigns</Text>
                                    </Box>
                                    <Button leftIcon={<IconPlus size={18}/>}>Create Campaing</Button>
                                </Flex>
                            </Card.Section>
                            <Card.Section>
                                <CampaignsTable/>
                            </Card.Section>
                        </Card>
                        <Card>
                            <Card.Section>
                                <Title>Top Contributors</Title>
                                <DonatorsTable/>
                            </Card.Section>
                            <Card.Section></Card.Section>
                        </Card>
                        <Paper>
                            <Title>Donations per Category</Title>
                            <YearlyDonationChart/>
                        </Paper>
                    </Stack>
                </Container>
            </DashboardLayout>
        </>
    );
};

export default DashboardPage;
