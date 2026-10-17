import {useState} from "react";
import {IconHeartHandshake} from "@tabler/icons-react";

/** Cover photo with a placeholder for campaigns without one, or when the image cannot be loaded. */
export function CampaignCover({src}: {src: string | null}) {
    // Remember which URL failed, so a different image later gets a fresh attempt.
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    if (src && src !== failedSrc) {
        return (
            <img
                src={src}
                alt=""
                loading="lazy"
                onError={() => setFailedSrc(src)}
                className="aspect-video w-full object-cover"
            />
        );
    }
    return (
        <div
            data-testid="cover-placeholder"
            className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground"
        >
            <IconHeartHandshake className="size-10" aria-hidden="true"/>
        </div>
    );
}
