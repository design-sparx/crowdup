// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import type {CampaignDetails} from "@/lib/campaigns/types";
import {CampaignDetailsPage} from "./campaign-details-page";

const campaign: CampaignDetails = {
    id: "c1", slug: "clean-water", title: "Clean water for schools", description: "Filtered water points.",
    category: "Community", country: "KE", imageUrl: null, goalAmount: 500000, raisedAmount: 310000, donorCount: 2,
    currency: "KES", endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "Amina",
    organizerAvatarUrl: null, percentFunded: 62, story: null,
};

const base = {
    campaign, storyHtml: "<p>Six schools.</p>", updates: [], donors: [], ended: false,
    acceptingDonations: true, donationReturn: null as "success" | "cancelled" | null,
};

describe("CampaignDetailsPage", () => {
    it("has one h1 with the title, and the organiser and money summary", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Clean water for schools"})).toBeInTheDocument();
        expect(screen.getByText(/Created by Amina/)).toBeInTheDocument();
        expect(screen.getByText(/3,100\.00/)).toBeInTheDocument();
        expect(screen.getByText("62% funded")).toBeInTheDocument();
        expect(screen.getByRole("progressbar", {name: "Funding progress"})).toHaveAttribute("aria-valuenow", "62");
    });
    it("shows the donate form on the page itself", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("form", {name: "Donate"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Donate now"})).toBeInTheDocument();
    });
    it("replaces the form when donations are closed, and says so when ended", () => {
        renderWithRouter(<CampaignDetailsPage {...base} acceptingDonations={false} ended/>);
        expect(screen.queryByRole("form", {name: "Donate"})).not.toBeInTheDocument();
        expect(screen.getByText("This campaign is not accepting donations.")).toBeInTheDocument();
        expect(screen.getByText(/has ended and is no longer accepting donations/)).toBeInTheDocument();
    });
    it("thanks the donor after a successful payment, without claiming a recorded amount", () => {
        renderWithRouter(<CampaignDetailsPage {...base} donationReturn="success"/>);
        expect(screen.getByText("Thank you for your donation!")).toBeInTheDocument();
        expect(screen.getByText(/being confirmed/)).toBeInTheDocument();
    });
    it("tells the donor nothing was charged after a cancelled payment, and keeps the form usable", () => {
        renderWithRouter(<CampaignDetailsPage {...base} donationReturn="cancelled"/>);
        expect(screen.getByText(/You have not been charged/)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Donate now"})).toBeEnabled();
    });
    it("switches between the story, updates and donors tabs", async () => {
        renderWithRouter(
            <CampaignDetailsPage
                {...base}
                updates={[{id: "u1", body: "Funds arrived", createdAt: "2026-03-05T10:00:00Z"}]}
                donors={[{id: "d1", donorName: "Jane", message: null, amount: 2500, currency: "KES", createdAt: "2026-03-05T10:00:00Z"}]}
            />,
        );
        expect(screen.getByText("Six schools.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("tab", {name: /Updates/}));
        expect(await screen.findByText("Funds arrived")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("tab", {name: /Donors/}));
        expect(await screen.findByText(/Jane/)).toBeInTheDocument();
    });
    it("offers Copy link and Report campaign", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Report campaign"})).toBeInTheDocument();
    });
});