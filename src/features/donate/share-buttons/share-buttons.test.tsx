// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {ShareButtons} from "./share-buttons";
import {shareLinks} from "./share-links";

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
});