// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {HomePage} from "./home-page";

function campaign(n: number): Campaign {
    return {
        id: `c${n}`, slug: `slug-${n}`, title: `Campaign ${n}`, description: "d", category: "Food", country: "GB",
        imageUrl: null, goalAmount: 1000, raisedAmount: 0, donorCount: 0, currency: "GBP",
        endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "A", organizerAvatarUrl: null, percentFunded: 0,
    };
}

describe("HomePage", () => {
    it("keeps the text links readable in dark mode and tappable on phones", () => {
        renderWithRouter(<HomePage campaigns={[campaign(1)]}/>);
        for (const name of ["See all", "Learn more"]) {
            const link = screen.getByRole("link", {name});
            expect(link).toHaveClass("dark:text-chart-1");
            expect(link).toHaveClass("h-11");
        }
    });
    it("has one h1 and the two main calls to action", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.getByRole("heading", {level: 1})).toHaveTextContent("Raise money for what matters");
        expect(screen.getByRole("link", {name: "Donate to a campaign"})).toHaveAttribute("href", "/campaigns");
        expect(screen.getByRole("link", {name: "Start a campaign"})).toHaveAttribute("href", "/create-campaign");
    });
    it("hides the featured section when there are no campaigns", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.queryByRole("heading", {name: "Featured campaigns"})).not.toBeInTheDocument();
    });
    it("shows at most six featured campaigns", () => {
        renderWithRouter(<HomePage campaigns={Array.from({length: 8}, (_, i) => campaign(i + 1))}/>);
        expect(screen.getByRole("heading", {name: "Featured campaigns"})).toBeInTheDocument();
        expect(screen.getAllByRole("link", {name: /^Campaign \d$/})).toHaveLength(6);
    });
    it("explains how it works in three steps", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });
});
