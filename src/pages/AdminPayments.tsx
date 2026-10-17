import {Alert, Button, Card, Code, Container, Group, Stack, Text, Title} from "@mantine/core";
import {useFetcher, useLoaderData} from "react-router";
import {formatMinorAmount} from "../helpers/formatAmount";
import type {UnmatchedPayment} from "../data-access/payments/unmatched.server";

const Row = ({p}: {p: UnmatchedPayment}) => {
    const fetcher = useFetcher<{error?: string}>();
    // XXX is ISO 4217 for "no currency": the payment event carried none we could use.
    const amount = p.currency === "XXX" ? `${p.amount} (unknown currency)` : formatMinorAmount(p.amount, p.currency);
    return (
        <Card withBorder>
            <Group justify="space-between" align="flex-start">
                <div>
                    <Text fw={600}>{amount}</Text>
                    <Text size="sm" c="dimmed">{p.reason} · {new Date(p.createdAt).toLocaleString("en-GB")}</Text>
                    <Text size="sm" mt={4}>
                        Account <Code>{p.accountId}</Code>
                        {p.paymentIntentId && <> · payment <Code>{p.paymentIntentId}</Code></>}
                        {p.campaignId && <> · campaign <Code>{p.campaignId}</Code></>}
                    </Text>
                </div>
                <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="resolve"/>
                    <input type="hidden" name="paymentId" value={p.id}/>
                    <Button type="submit" variant="default" loading={fetcher.state !== "idle"}>Mark reviewed</Button>
                </fetcher.Form>
            </Group>
            {fetcher.data?.error && <Alert color="red" mt="sm">{fetcher.data.error}</Alert>}
        </Card>
    );
};

const AdminPaymentsPage = () => {
    const {payments} = useLoaderData() as {payments: UnmatchedPayment[]};
    return (
        <Container size="md" py="lg">
            <Title order={2} mb="xs">Unmatched payments</Title>
            <Text c="dimmed" mb="md">
                Money paid to a connected account that could not be tied to a live campaign. It is not counted in any
                total. Refund or reconcile it in the Stripe dashboard, then mark it reviewed.
            </Text>
            {payments.length === 0 ? <Alert color="green">Nothing to review.</Alert> : (
                <Stack>{payments.map((p) => <Row key={p.id} p={p}/>)}</Stack>
            )}
        </Container>
    );
};

export default AdminPaymentsPage;
