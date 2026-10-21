import {Link} from "react-router";
import {IconMenu2} from "@tabler/icons-react";
import {Button} from "@/components/ui/button";
import {Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {NAV_LINKS} from "@/components/shell/nav-links";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="size-11 md:size-9" aria-label="Open menu"/>}>
                <IconMenu2/>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
                    {NAV_LINKS.map((link) => (
                        <SheetClose
                            key={link.to}
                            render={<Link to={link.to} className="rounded-xl px-3 py-2 text-base hover:bg-muted"/>}
                        >
                            {link.label}
                        </SheetClose>
                    ))}
                    <SheetClose
                        render={<Link to="/create-campaign" className="rounded-xl px-3 py-2 text-base font-medium hover:bg-muted"/>}
                    >
                        Start a campaign
                    </SheetClose>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
