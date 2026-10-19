import {Link} from "react-router";
import {FOOTER_LINKS} from "@/components/shell/nav-links";

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>CrowdUp is open source under the MIT licence.</p>
                <nav aria-label="Footer" className="flex flex-wrap gap-4">
                    {FOOTER_LINKS.map((link) => (
                        <Link key={link.to} to={link.to} className="hover:text-foreground">
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
