import {Alert, Button, Group, Modal, Stack, Textarea} from "@mantine/core";
import {useFetcher} from "react-router";
import {REASON_MAX} from "../lib/reports/reports";

export type ReportActionResult = {ok?: boolean; error?: string};

interface IProps {
    opened: boolean;
    onClose: () => void;
}

/** Posts to the current campaign route's action (`intent=report`). Works for guests too. */
const ReportModal = ({opened, onClose}: IProps) => {
    const fetcher = useFetcher<ReportActionResult>();
    const submitting = fetcher.state !== "idle";
    const done = fetcher.data?.ok === true;

    return (
        <Modal opened={opened} onClose={onClose} title="Report this campaign" centered>
            {done ? (
                <Stack>
                    <Alert color="green">Thanks. Our moderators will review your report.</Alert>
                    <Button onClick={onClose}>Close</Button>
                </Stack>
            ) : (
                <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="report"/>
                    <Stack>
                        <Textarea
                            name="reason"
                            label="What is wrong with this campaign?"
                            minRows={4}
                            autosize
                            required
                            maxLength={REASON_MAX}
                            error={fetcher.data?.error}
                        />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={onClose}>Cancel</Button>
                            <Button type="submit" loading={submitting}>Send report</Button>
                        </Group>
                    </Stack>
                </fetcher.Form>
            )}
        </Modal>
    );
};

export default ReportModal;
