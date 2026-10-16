import type {ReactNode} from "react";
import {Links, Meta, Outlet, Scripts, ScrollRestoration} from "react-router";
import {ColorSchemeScript, MantineProvider, mantineHtmlProps} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "./index.css";
import "./App.css";
import "./fonts/montserrat.css";
import {customTheme} from "./theme";
import {Error404Page} from "./pages";
import {buildMeta} from "./helpers";

export function Layout({children}: {children: ReactNode}) {
    return (
        <html lang="en" {...mantineHtmlProps}>
        <head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="icon" type="image/svg+xml" href="/vite.svg"/>
            <Meta/>
            <Links/>
            <ColorSchemeScript forceColorScheme="light"/>
        </head>
        <body>
        <MantineProvider theme={customTheme} forceColorScheme="light">
            {children}
            <Notifications/>
        </MantineProvider>
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
