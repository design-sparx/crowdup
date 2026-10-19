import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button";
import {MobileNav} from "@/components/shell/mobile-nav";
import {NAV_LINKS} from "@/components/shell/nav-links";
import {ThemeToggle} from "@/components/shell/theme-toggle";
import {UserMenu} from "@/components/shell/user-menu";
import type {Account} from "@/lib/account";
import {cn} from "@/lib/utils";

export function SiteHeader({account}: {account: Account | null}) {
    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
                <div className="md:hidden">
                    <MobileNav/>
                </div>
                <Link to="/" className="text-lg font-semibold">
                    CrowdUp
                </Link>
                <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.to} to={link.to} className={buttonVariants({variant: "ghost", size: "sm"})}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="ms-auto flex items-center gap-2">
                    <Link to="/create-campaign" className={cn(buttonVariants({size: "sm"}), "hidden sm:inline-flex")}>
                        Start a campaign
                    </Link>
                    <ThemeToggle/>
                    <UserMenu account={account}/>
                </div>
            </div>
        </header>
    );
}
