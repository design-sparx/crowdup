import type {ReactNode} from "react";
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from "react-router";
import "./styles/globals.css";
import {buildMeta} from "./helpers";
import {demoBannerState} from "./lib/demo/demo";
import {Toaster} from "@/components/ui/toast";
import {DemoBanner} from "@/components/shell/demo-banner";
import {ErrorPage} from "@/components/shell/error-page";
import {themeInitScript} from "@/lib/theme";

export function loader() {
    const demo = demoBannerState(process.env);
    // The demo banner promises test mode, so a live or unknown key shows a red warning instead.
    if (demo === "live-key-warning") {
        console.error("DEMO_MODE is on but STRIPE_SECRET_KEY is not a test key (sk_test_).");
    }
    return {demo};
}

export function Layout({children}: {children: ReactNode}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <script dangerouslySetInnerHTML={{__html: themeInitScript}}/>
            <link rel="icon" type="image/svg+xml" href="/vite.svg"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        <Toaster>{children}</Toaster>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export function meta() {
    return buildMeta({
        title: "Crowdfunding",
        description: "CrowdUp is a crowdfunding platform for personal projects, charities and NGOs.",
    });
}

export default function Root() {
    const {demo} = useLoaderData<typeof loader>();
    return (
        <>
            <DemoBanner state={demo}/>
            <Outlet/>
        </>
    );
}

export function ErrorBoundary() {
    return <ErrorPage/>;
}
