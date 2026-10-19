import {Form} from "react-router";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Closing ends donations for good, so it sits behind a confirmation. The trigger only opens the
 * dialog; the close intent is posted by the confirm button inside the form.
 */
export function CloseCampaign() {
    return (
        <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive">Close campaign</Button>}/>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Close this campaign?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Closing ends donations to this campaign. It cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep it open</AlertDialogCancel>
                    <Form method="post">
                        <AlertDialogAction type="submit" name="intent" value="close" variant="destructive">
                            Yes, close it
                        </AlertDialogAction>
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
