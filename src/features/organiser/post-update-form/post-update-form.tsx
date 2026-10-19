import {useId, useState} from "react";
import {Form} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {MAX_UPDATE_LENGTH} from "@/lib/campaigns/updates";

interface PostUpdateFormProps {
    error?: string;
}

/** Posts an update to supporters. The server enforces the limit; the counter only helps the organiser see it. */
export function PostUpdateForm({error}: PostUpdateFormProps) {
    const id = useId();
    const [length, setLength] = useState(0);
    return (
        <Form method="post" className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor={id}>Post an update</Label>
                <Textarea
                    id={id}
                    name="body"
                    rows={4}
                    maxLength={MAX_UPDATE_LENGTH}
                    onChange={(e) => setLength(e.currentTarget.value.length)}
                    aria-describedby={`${id}-count`}
                />
                <p id={`${id}-count`} className="text-right text-xs text-muted-foreground tabular-nums">
                    {length} / {MAX_UPDATE_LENGTH}
                </p>
            </div>
            {error ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}
            <Button type="submit" name="intent" value="post-update">Post update</Button>
        </Form>
    );
}
