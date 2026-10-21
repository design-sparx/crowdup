import {Form, Link} from "react-router";
import {IconHeart, IconLayoutDashboard, IconLogout} from "@tabler/icons-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {buttonVariants} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {initials, type Account} from "@/lib/account";
import {cn} from "@/lib/utils";

export function UserMenu({account}: {account: Account | null}) {
    if (!account) {
        return (
            <Link to="/login" className={cn(buttonVariants({variant: "outline", size: "sm"}), "h-11 md:h-8")}>
                Log in
            </Link>
        );
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Account menu"
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
                <Avatar>
                    {account.avatar ? <AvatarImage src={account.avatar} alt=""/> : null}
                    <AvatarFallback>{initials(account.name)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm font-medium">{account.name}</div>
                <DropdownMenuSeparator/>
                <DropdownMenuItem render={<Link to="/dashboard"/>}>
                    <IconLayoutDashboard/> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="/dashboard/donations"/>}>
                    <IconHeart/> My donations
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <Form method="post" action="/logout">
                    <DropdownMenuItem render={<button type="submit" className="w-full"/>}>
                        <IconLogout/> Log out
                    </DropdownMenuItem>
                </Form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
