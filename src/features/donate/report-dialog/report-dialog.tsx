import {useState} from "react";
import {useFetcher} from "react-router";
import {IconFlag} from "@tabler/icons-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {REASON_MAX} from "@/lib/reports/reports";

type ReportResult = {ok?: boolean; error?: string};

export function ReportDialog() {
    const [open, setOpen] = useState(false);
    const fetcher = useFetcher<ReportResult>();
    const sending = fetcher.state !== "idle";
    const done = fetcher.data?.ok === true;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="text-muted-foreground"/>}>
                <IconFlag aria-hidden="true"/> Report campaign
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report this campaign</DialogTitle>
                    <DialogDescription>
                        Tell our moderators what is wrong. You do not need an account.
                    </DialogDescription>
                </DialogHeader>
                {done ? (
                    <div className="space-y-4">
                        <Alert role="status">
                            <AlertDescription>Thanks. Our moderators will review your report.</AlertDescription>
                        </Alert>
                        <DialogFooter>
                            <DialogClose render={<Button type="button"/>}>Close</DialogClose>
                        </DialogFooter>
                    </div>
                ) : (
                    <fetcher.Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="report"/>
                        <Field data-invalid={fetcher.data?.error ? true : undefined}>
                            <FieldLabel htmlFor="report-reason">What is wrong with this campaign?</FieldLabel>
                            <Textarea id="report-reason" name="reason" rows={4} required maxLength={REASON_MAX}/>
                            {fetcher.data?.error ? <FieldError>{fetcher.data.error}</FieldError> : null}
                        </Field>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline"/>}>Cancel</DialogClose>
                            <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Send report"}</Button>
                        </DialogFooter>
                    </fetcher.Form>
                )}
            </DialogContent>
        </Dialog>
    );
}