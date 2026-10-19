// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {CampaignGrid} from "./campaign-grid";

const base: Campaign = {
    id: "c1", slug: "one", title: "One", description: "d", category: "Food", country: "GB",
    imageUrl: null, goalAmount: 1000, raisedAmount: 0, donorCount: 0, currency: "GBP",
    endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "A", organizerAvatarUrl: null, percentFunded: 0,
};

describe("CampaignGrid", () => {
    it("lists one card per campaign", () => {
        renderWithRouter(<CampaignGrid campaigns={[base, {...base, id: "c2", slug: "two", title: "Two"}]} resetHref={null}/>);
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
    it("shows an empty state with a way back when resetHref is given", () => {
        renderWithRouter(<CampaignGrid campaigns={[]} resetHref="/campaigns"/>);
        expect(screen.getByText("No campaigns found")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toHaveAttribute("href", "/campaigns");
    });
    it("hides the way back when resetHref is null", () => {
        renderWithRouter(<CampaignGrid campaigns={[]} resetHref={null}/>);
        expect(screen.queryByRole("link", {name: "Show all campaigns"})).not.toBeInTheDocument();
    });
});
