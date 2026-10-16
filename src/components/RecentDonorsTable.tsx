import {Table, Text} from "@mantine/core";
import {formatMinorAmount} from "../helpers/formatAmount";
import {donorLabel, type DashboardDonation} from "../lib/dashboard/dashboard";

interface Props {
    donations: DashboardDonation[];
    campaignTitles: Record<string, string>;
}

const LIMIT = 10;

/** Most recent confirmed donations. Anonymous donors are always shown as "Anonymous". */
const RecentDonorsTable = ({donations, campaignTitles}: Props) => (
    <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Donor</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Campaign</Table.Th>
                    <Table.Th>Date</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {[...donations]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, LIMIT)
                    .map((d) => (
                        <Table.Tr key={d.id}>
                            <Table.Td>{donorLabel(d)}</Table.Td>
                            <Table.Td>{formatMinorAmount(d.amount, d.currency)}</Table.Td>
                            <Table.Td><Text size="sm" lineClamp={1}>{campaignTitles[d.campaignId]}</Text></Table.Td>
                            <Table.Td>{d.createdAt.slice(0, 10)}</Table.Td>
                        </Table.Tr>
                    ))}
            </Table.Tbody>
        </Table>
    </Table.ScrollContainer>
);

export default RecentDonorsTable;
