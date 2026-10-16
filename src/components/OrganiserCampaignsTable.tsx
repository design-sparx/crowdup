import {Badge, Button, Group, Progress, Stack, Table, Text} from "@mantine/core";
import {IconEdit, IconExternalLink} from "@tabler/icons-react";
import {Link} from "react-router";
import {formatMinorAmount} from "../helpers/formatAmount";
import {statusLabel} from "../lib/campaigns/transitions";
import type {CampaignStats} from "../lib/dashboard/dashboard";

const STATUS_COLOR: Record<string, string> = {draft: "gray", pending_approval: "yellow", rejected: "orange", live: "green", closed: "blue", suspended: "red"};

const OrganiserCampaignsTable = ({campaigns}: {campaigns: CampaignStats[]}) => (
    <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="sm" highlightOnHover striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Campaign</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Raised</Table.Th>
                    <Table.Th>Donors</Table.Th>
                    <Table.Th/>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {campaigns.map((c) => (
                    <Table.Tr key={c.id}>
                        <Table.Td>
                            <Text fw={500}>{c.title}</Text>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={STATUS_COLOR[c.status] ?? "gray"} variant="light">{statusLabel(c.status)}</Badge>
                        </Table.Td>
                        <Table.Td>
                            <Stack gap={4}>
                                <Text size="sm">
                                    {c.currency
                                        ? `${formatMinorAmount(c.raised, c.currency)} of ${formatMinorAmount(c.goalAmount, c.currency)}`
                                        : `Goal ${c.goalAmount / 100} (currency set at go-live)`}
                                </Text>
                                <Progress value={c.percentFunded} size="sm" aria-label={`${c.percentFunded}% funded`}/>
                            </Stack>
                        </Table.Td>
                        <Table.Td>{c.donors}</Table.Td>
                        <Table.Td>
                            <Group gap="xs" justify="flex-end" wrap="nowrap">
                                <Button
                                    component={Link}
                                    to={`/campaigns/${c.id}/edit`}
                                    size="xs"
                                    variant="light"
                                    leftSection={<IconEdit size={14}/>}
                                    aria-label={`Edit ${c.title}`}
                                >
                                    Edit
                                </Button>
                                {c.status === "live" && (
                                    <Button
                                        component={Link}
                                        to={`/campaigns/${c.slug}`}
                                        size="xs"
                                        variant="subtle"
                                        leftSection={<IconExternalLink size={14}/>}
                                    >
                                        View
                                    </Button>
                                )}
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    </Table.ScrollContainer>
);

export default OrganiserCampaignsTable;
