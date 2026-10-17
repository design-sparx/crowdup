import type {ReactNode} from "react";
import {SiteFooter} from "@/components/shell/site-footer";
import {SiteHeader} from "@/components/shell/site-header";
import type {Account} from "@/lib/account";

export function SitePage({account, children}: {account: Account | null; children: ReactNode}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader account={account}/>
            <main className="flex-1">{children}</main>
            <SiteFooter/>
        </div>
    );
}
