// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {renderToString} from "react-dom/server";
import {ShareButtons} from "./share-buttons";
import {shareLinks} from "./share-links";

const {add} = vi.hoisted(() => ({add: vi.fn()}));
vi.mock("@/components/ui/toast", () => ({toast: {add}}));

describe("shareLinks", () => {
    it("encodes the title and the URL", () => {
        const links = shareLinks("Clean water & schools", "https://crowdup.example/campaigns/a b");
        const x = links.find((l) => l.name === "X");
        expect(x?.href).toContain("url=https%3A%2F%2Fcrowdup.example%2Fcampaigns%2Fa%20b");
        expect(x?.href).toContain("text=Clean%20water%20%26%20schools");
        expect(links.find((l) => l.name === "Email")?.href.startsWith("mailto:?subject=")).toBe(true);
    });
});

describe("ShareButtons", () => {
    beforeEach(() => add.mockClear());
    afterEach(() => vi.unstubAllGlobals());

    it("always offers Copy link", () => {
        render(<ShareButtons title="T"/>);
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
    });

    it("renders share links that open safely in a new tab when a URL is given", () => {
        render(<ShareButtons title="T" url="https://crowdup.example/campaigns/a"/>);
        const link = screen.getByRole("link", {name: "WhatsApp"});
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("uses the current page URL for the share links once in the browser", () => {
        render(<ShareButtons title="T"/>);
        const href = screen.getByRole("link", {name: "X"}).getAttribute("href");
        expect(href).toContain(`url=${encodeURIComponent(window.location.href)}`);
    });

    it("renders only Copy link on the server, so server and browser markup match", () => {
        const html = renderToString(<ShareButtons title="T"/>);
        expect(html).toContain("Copy link");
        expect(html).not.toContain("WhatsApp");
    });

    it("copies the page URL and confirms with a toast", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", {...navigator, clipboard: {writeText}});
        render(<ShareButtons title="T"/>);
        fireEvent.click(screen.getByRole("button", {name: "Copy link"}));
        await waitFor(() => expect(add).toHaveBeenCalledWith({title: "Link copied"}));
        expect(writeText).toHaveBeenCalledWith(window.location.href);
    });

    it("copies the given URL instead of the page URL when one is passed", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", {...navigator, clipboard: {writeText}});
        render(<ShareButtons title="T" url="https://crowdup.example/campaigns/a"/>);
        fireEvent.click(screen.getByRole("button", {name: "Copy link"}));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://crowdup.example/campaigns/a"));
    });

    it("shows the link in the toast when the browser refuses to copy", async () => {
        const writeText = vi.fn().mockRejectedValue(new Error("denied"));
        vi.stubGlobal("navigator", {...navigator, clipboard: {writeText}});
        render(<ShareButtons title="T" url="https://crowdup.example/campaigns/a"/>);
        fireEvent.click(screen.getByRole("button", {name: "Copy link"}));
        await waitFor(() =>
            expect(add).toHaveBeenCalledWith({
                title: "Could not copy the link",
                description: "https://crowdup.example/campaigns/a",
            }),
        );
    });
});
