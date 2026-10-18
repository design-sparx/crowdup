import {Form} from "react-router";
import {SubmitButton} from "@/features/admin/submit-button";
import {Card, CardContent} from "@/components/ui/card";
import {formatDate} from "@/helpers/formatDate";
import {formatMinor} from "@/lib/donations/amount";

export interface UnmatchedRow {
    id: string;
    createdAt: string;
    amount: number;
    currency: string;
    reason: string;
    accountId: string;
    campaignId: string | null;
    eventId: string;
    sessionId: string | null;
    paymentIntentId: string | null;
}

interface PaymentsTabProps {
    payments: UnmatchedRow[];
}

/** Payments Stripe sent that did not match a campaign. "Mark resolved" posts the paymentId with the resolve intent. */
export function PaymentsTab({payments}: PaymentsTabProps) {
    if (payments.length === 0) {
        return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No unmatched payments.</p>;
    }
    return (
        <div className="space-y-4">
            {payments.map((p) => (
                <Card key={p.id}>
                    <CardContent className="space-y-3 pt-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-medium tabular-nums">{formatMinor(p.amount, p.currency)}</p>
                            <time dateTime={p.createdAt} className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</time>
                        </div>
                        <p className="text-sm">{p.reason}</p>
                        <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                            <div><dt className="inline">Event </dt><dd className="inline break-all">{p.eventId}</dd></div>
                            {p.paymentIntentId ? (
                                <div><dt className="inline">Payment intent </dt><dd className="inline break-all">{p.paymentIntentId}</dd></div>
                            ) : null}
                        </dl>
                        <Form method="post">
                            <input type="hidden" name="paymentId" value={p.id}/>
                            <SubmitButton name="intent" value="resolve" variant="outline" size="sm">Mark resolved</SubmitButton>
                        </Form>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
