import {IconLink} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/toast";
import {cn} from "@/lib/utils";
import {shareLinks} from "./share-links";

interface ShareButtonsProps {
    title: string;
    /** Absolute campaign URL. When omitted the current page URL is read on click. */
    url?: string;
    className?: string;
}

export function ShareButtons({title, url, className}: ShareButtonsProps) {
    async function copy() {
        const target = url ?? window.location.href;
        try {
            await navigator.clipboard.writeText(target);
            toast.add({title: "Link copied"});
        } catch {
            toast.add({title: "Could not copy the link", description: target});
        }
    }

    // Links need an absolute URL; before hydration there is no window, so build them lazily.
    const links = url ? shareLinks(title, url) : [];
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