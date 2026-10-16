import {Anchor, Badge, Box, Button, Card, Container, Stack, Table, Text, Title} from "@mantine/core";
import {Link} from "react-router";
import {formatMinorAmount} from "../helpers/formatAmount";
import type {DonationHistoryItem} from "../lib/donations/history";

interface Props {
    donations: DonationHistoryItem[];
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"});

const MyDonationsPage = ({donations}: Props) => (
    <>
        <title>My donations</title>
        <Box>
            <Container fluid my="xl">
                <Stack gap="lg">
                    <Title order={3}>My donations</Title>
                    <Card padding="md" shadow="sm">
                        {donations.length === 0 ? (
                            <Stack align="center" gap="xs" py="xl">
                                <Text fw={600}>You have not made any donations yet</Text>
                                <Button component={Link} to="/campaigns" variant="light">Browse campaigns</Button>
                            </Stack>
                        ) : (
                            <Table.ScrollContainer minWidth={500}>
                                <Table verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Campaign</Table.Th>
                                            <Table.Th>Amount</Table.Th>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {donations.map((d) => (
                                            <Table.Tr key={d.id}>
                                                <Table.Td>
                                                    <Anchor component={Link} to={d.campaignHref}>{d.campaignTitle}</Anchor>
                                                </Table.Td>
                                                <Table.Td>{formatMinorAmount(d.amount, d.currency)}</Table.Td>
                                                <Table.Td>{formatDate(d.createdAt)}</Table.Td>
                                                <Table.Td><Badge color="green" variant="light">{d.status}</Badge></Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        )}
                    </Card>
                </Stack>
            </Container>
        </Box>
    </>
);

export default MyDonationsPage;
