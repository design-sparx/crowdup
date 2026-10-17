import {formatDate} from "@/helpers/formatDate";
import type {CampaignUpdate} from "@/lib/campaigns/repository";

export function UpdatesList({updates}: {updates: CampaignUpdate[]}) {
    if (updates.length === 0) {
        return <p className="text-sm text-muted-foreground">No updates yet.</p>;
    }
    return (
        <ol className="space-y-5">
            {updates.map((update) => (
                <li key={update.id} className="space-y-1">
                    <time dateTime={update.createdAt} className="text-xs text-muted-foreground">
                        {formatDate(update.createdAt)}
                    </time>
                    <p className="whitespace-pre-wrap text-sm">{update.body}</p>
                </li>
            ))}
        </ol>
    );
}