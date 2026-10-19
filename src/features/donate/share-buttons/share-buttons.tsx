import {useSyncExternalStore} from "react";
import {IconLink} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/toast";
import {cn} from "@/lib/utils";
import {shareLinks} from "./share-links";

/** The page URL never changes without a navigation (which remounts this), so there is nothing to subscribe to. */
const subscribeNever = () => () => {};

interface ShareButtonsProps {
    title: string;
    /** Absolute campaign URL. When omitted the current page URL is used once the page is in the browser. */
    url?: string;
    className?: string;
}

export function ShareButtons({title, url, className}: ShareButtonsProps) {
    // The page URL only exists in the browser. useSyncExternalStore renders `null` on the server and
    // during hydration, then switches to the real URL, so server and browser markup always match.
    const browserUrl = useSyncExternalStore(subscribeNever, () => window.location.href, () => null);
    const pageUrl = url ?? browserUrl;

    async function copy() {
        const target = url ?? window.location.href;
        try {
            await navigator.clipboard.writeText(target);
            toast.add({title: "Link copied"});
        } catch {
            toast.add({title: "Could not copy the link", description: target});
        }
    }

    const links = pageUrl ? shareLinks(title, pageUrl) : [];
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
                <IconLink aria-hidden="true"/> Copy link
            </Button>
            {links.map(({name, href, icon: Icon}) => (
                <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({variant: "outline", size: "sm"})}
                >
                    <Icon aria-hidden="true"/> {name}
                </a>
            ))}
        </div>
    );
}
