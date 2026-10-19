// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {CampaignCard} from "./campaign-card";

const campaign: Campaign = {
    id: "c1",
    slug: "clean-water",
    title: "Clean water for schools",
    description: "Filtered water points in six schools.",
    category: "Community",
    country: "KE",
    imageUrl: null,
    goalAmount: 500000,
    raisedAmount: 310000,
    donorCount: 1,
    currency: "KES",
    endDate: null,
    createdAt: "2026-01-01T00:00:00Z",
    organizerName: "Amina",
    organizerAvatarUrl: null,
    percentFunded: 62,
};

describe("CampaignCard", () => {
    it("links the title to the campaign page", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByRole("link", {name: "Clean water for schools"})).toHaveAttribute(
            "href",
            "/campaigns/clean-water",
        );
    });
    it("shows money in major units, the percentage and a singular donor", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByText(/3,100\.00 raised/)).toBeInTheDocument();
        expect(screen.getByText("62%")).toBeInTheDocument();
        expect(screen.getByText(/1 donor$/)).toBeInTheDocument();
    });
    it("uses a plural for several donors", () => {
        renderWithRouter(<CampaignCard campaign={{...campaign, donorCount: 3}}/>);
        expect(screen.getByText(/3 donors$/)).toBeInTheDocument();
    });
    it("exposes progress to assistive tech", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
    });
    it("shows the cover image when there is one, a placeholder otherwise", () => {
        const {container, unmount} = renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(container.querySelector("img")).toBeNull();
        unmount();
        const {container: c2} = renderWithRouter(<CampaignCard campaign={{...campaign, imageUrl: "https://example.org/a.jpg"}}/>);
        expect(c2.querySelector("img")).toHaveAttribute("src", "https://example.org/a.jpg");
    });
});
