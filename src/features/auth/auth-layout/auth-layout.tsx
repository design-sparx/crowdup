import type {ReactNode} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

interface AuthLayoutProps {
    title: string;
    description?: ReactNode;
    children: ReactNode;
}

/** One centred card for every sign-in screen. */
export function AuthLayout({title, description, children}: AuthLayoutProps) {
    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <Card>
                <CardHeader className="space-y-1">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}
