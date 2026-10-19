// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ThankYouPage} from "./thank-you-page";

const base = {campaign: {title: "Clean water for schools", slug: "clean-water"}, signedIn: false, campaignUrl: "https://crowdup.example/campaigns/clean-water"};

describe("ThankYouPage", () => {
    it("has one h1 that thanks the donor and names the campaign", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Thank you"})).toBeInTheDocument();
        expect(screen.getByText(/Clean water for schools/)).toBeInTheDocument();
    });

    it("does not claim a donation was recorded and shows no amount", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        expect(screen.queryByText(/recorded|received your donation|receipt/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/[$£€]\s?\d/)).not.toBeInTheDocument();
    });

    it("links back to the campaign and to Browse", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        expect(screen.getByRole("link", {name: "Back to the campaign"})).toHaveAttribute("href", "/campaigns/clean-water");
        expect(screen.getByRole("link", {name: "Browse more campaigns"})).toHaveAttribute("href", "/campaigns");
    });

    it("offers share buttons", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
    });

    it("hides the My donations link from signed-out visitors", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        expect(screen.queryByRole("link", {name: "View my donations"})).not.toBeInTheDocument();
    });

    it("shows the My donations link to signed-in visitors", () => {
        renderWithRouter(<ThankYouPage {...base} signedIn/>);
        expect(screen.getByRole("link", {name: "View my donations"})).toHaveAttribute("href", "/dashboard/donations");
    });

    it("shares the campaign page, not the thank-you page", () => {
        renderWithRouter(<ThankYouPage {...base}/>);
        const whatsapp = screen.getByRole("link", {name: "WhatsApp"});
        expect(whatsapp).toHaveAttribute("href", expect.stringContaining(encodeURIComponent("https://crowdup.example/campaigns/clean-water")));
        expect(whatsapp.getAttribute("href")).not.toContain("thanks");
    });
});
