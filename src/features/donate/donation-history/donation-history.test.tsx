// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen, within} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {DonationHistoryItem} from "@/lib/donations/history";
import {DonationHistory} from "./donation-history";

const donations: DonationHistoryItem[] = [
    {id: "1", campaignTitle: "Clean water for schools", campaignHref: "/campaigns/clean-water",
        amount: 5000, currency: "KES", createdAt: "2026-03-05T10:00:00Z", status: "confirmed"},
    {id: "2", campaignTitle: "Community kitchen", campaignHref: "/campaigns/community-kitchen",
        amount: 1500, currency: "GBP", createdAt: "2026-03-01T10:00:00Z", status: "confirmed"},
];

describe("DonationHistory", () => {
    it("shows an empty state that links to Browse when there are no donations", () => {
        renderWithRouter(<DonationHistory donations={[]}/>);
        expect(screen.getByText("You have not donated yet.")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Browse campaigns"})).toHaveAttribute("href", "/campaigns");
    });

    it("has a table with the campaign, amount and date for each donation", () => {
        renderWithRouter(<DonationHistory donations={donations}/>);
        const table = screen.getByRole("table", {name: "My donations"});
        const rows = within(table).getAllByRole("row");
        expect(rows).toHaveLength(3); // header + 2 donations
        expect(within(table).getByRole("link", {name: "Clean water for schools"})).toHaveAttribute(
            "href",
            "/campaigns/clean-water",
        );
        expect(within(table).getByText("KES 50.00")).toBeInTheDocument();
    });

    it("also renders stacked cards for small screens, one per donation", () => {
        renderWithRouter(<DonationHistory donations={donations}/>);
        const cards = screen.getAllByRole("listitem");
        expect(cards).toHaveLength(2);
        expect(within(cards[0]).getByRole("link", {name: "Clean water for schools"})).toBeInTheDocument();
    });

    it("never shows donor details, only the donation's own fields", () => {
        renderWithRouter(<DonationHistory donations={donations}/>);
        expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });
});
