import {IconBrandFacebook, IconBrandX, IconBrandWhatsapp, IconMail} from "@tabler/icons-react";

export interface ShareLink {
    name: string;
    href: string;
    icon: (props: React.ComponentProps<"svg">) => React.ReactNode;
}

export function shareLinks(title: string, url: string): readonly ShareLink[] {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    return [
        {name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: IconBrandFacebook},
        {name: "X", href: `https://x.com/intent/tweet?url=${u}&text=${t}`, icon: IconBrandX},
        {name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: IconBrandWhatsapp},
        {name: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: IconMail},
    ];
}