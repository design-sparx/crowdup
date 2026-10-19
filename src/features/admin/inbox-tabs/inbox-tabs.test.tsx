// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen, within} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {InboxTabs} from "./inbox-tabs";

describe("InboxTabs", () => {
    it("links each admin tab to its page", () => {
        renderWithRouter(<InboxTabs counts={{reports: 0, approvals: 0, payments: 0}} current="reports"/>);
        const nav = screen.getByRole("navigation", {name: "Admin"});
        expect(within(nav).getByRole("link", {name: /Reports/})).toHaveAttribute("href", "/admin/reports");
        expect(within(nav).getByRole("link", {name: /Approvals/})).toHaveAttribute("href", "/admin/approvals");
        expect(within(nav).getByRole("link", {name: /Payments/})).toHaveAttribute("href", "/admin/payments");
        expect(within(nav).getByRole("link", {name: /Campaigns/})).toHaveAttribute("href", "/admin/campaigns");
        expect(within(nav).getByRole("link", {name: /Users/})).toHaveAttribute("href", "/admin/users");
    });

    it("shows a count badge on tabs that have open items", () => {
        renderWithRouter(<InboxTabs counts={{reports: 3, approvals: 0, payments: 1}} current="reports"/>);
        expect(screen.getByRole("link", {name: /Reports/})).toHaveTextContent("3");
        expect(screen.getByRole("link", {name: /Payments/})).toHaveTextContent("1");
        expect(screen.getByRole("link", {name: /Approvals/})).not.toHaveTextContent(/\d/);
    });

    it("marks the current tab", () => {
        renderWithRouter(<InboxTabs counts={{reports: 0, approvals: 0, payments: 0}} current="approvals"/>);
        expect(screen.getByRole("link", {name: /Approvals/})).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", {name: /Reports/})).not.toHaveAttribute("aria-current");
    });

    it("keeps the tab row inside its own box on narrow screens, so it cannot widen the page", () => {
        renderWithRouter(<InboxTabs counts={{reports: 0, approvals: 0, payments: 0}} current="reports"/>);
        const nav = screen.getByRole("navigation", {name: "Admin"});
        // Five tabs do not fit a phone; the row scrolls sideways inside itself instead of widening the page.
        expect(nav.className).toMatch(/overflow-x-auto/);
        // Each tab keeps its label on one line, so a tab never wraps into two rows.
        expect(screen.getByRole("link", {name: /Reports/}).className).toMatch(/whitespace-nowrap/);
    });
});
