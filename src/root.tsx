import type {ReactNode} from "react";
import {Links, Meta, Outlet, Scripts, ScrollRestoration} from "react-router";
import "./styles/globals.css";
import {Error404Page} from "./pages";
import {buildMeta} from "./helpers";
import {demoBannerState} from "./lib/demo/demo";

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
        <html lang="en">
        <head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="icon" type="image/svg+xml" href="/vite.svg"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        {children}
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
    return <Outlet/>;
}

export function ErrorBoundary() {
    return <Error404Page/>;
}
