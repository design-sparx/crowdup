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
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconFunction,
    IconPlus,
    IconReceipt2,
    IconTrophy
} from "@tabler/icons-react";
import {CampaignsTable, DonatorsTable, YearlyDonationChart} from "../components";
import {Link} from "react-router";
import classes from "./Dashboard.module.css";
import type {ReactNode} from "react";

const DashboardPage = ({stripePanel}: {stripePanel?: ReactNode}) => {
    const paperProps: PaperProps = {
        p: "md",
        shadow: "sm"
    }

    const subTitleProps: TitleProps = {
        size: 18,
        mb: "sm"
    }

    return (
        <>
            <title>Dashboard</title>
            <Box>
                <Container fluid my="xl">
                    <Stack gap="xl">
                        <Title order={3}>Good evening, Jane</Title>
                        {stripePanel}
                        <SimpleGrid
                            cols={{base: 1, sm: 2, lg: 4}}
                            spacing={{base: 'sm', sm: 'md'}}
                        >
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>
                                        Total Donations
                                    </Text>
                                    <IconReceipt2 className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" gap="xs" mt={25}>
                                    <Text className={classes.value}>$100,202.10</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text c={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>10%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
                            </Paper>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>
                                        Today's Donations
                                    </Text>
                                    <IconReceipt2 className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" gap="xs" mt={25}>
                                    <Text className={classes.value}>$1,202.10</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text c={-3 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>30.1%</span>
                                        <IconArrowDownRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to yesterday
                                </Text>
                            </Paper>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>
                                        Average Donations per Campaign
                                    </Text>
                                    <IconFunction className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" gap="xs" mt={25}>
                                    <Text className={classes.value}>34%</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text c={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>4.2%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
                            </Paper>
                            <Paper {...paperProps}>
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed" className={classes.title}>
                                        Active Campaigns
                                    </Text>
                                    <IconTrophy className={classes.icon} size="1.4rem" stroke={1.5}/>
                                </Group>

                                <Group align="flex-end" gap="xs" mt={25}>
                                    <Text className={classes.value}>13</Text>
                                    {/* eslint-disable-next-line no-constant-condition */}
                                    <Text c={10 > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                                        <span>11.1%</span>
                                        <IconArrowUpRight size="1rem" stroke={1.5}/>
                                    </Text>
                                </Group>

                                <Text fz="xs" c="dimmed" mt={7}>
                                    Compared to previous month
                                </Text>
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
                                <CampaignsTable/>
                            </Card.Section>
                        </Card>
                        <Card padding="md" shadow="sm">
                            <Title {...subTitleProps}>Top Contributors</Title>
                            <Card.Section mt="md">
                                <DonatorsTable/>
                            </Card.Section>
                        </Card>
                        <Paper {...paperProps}>
                            <Title {...subTitleProps}>Donations per Category</Title>
                            <YearlyDonationChart/>
                        </Paper>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default DashboardPage;
