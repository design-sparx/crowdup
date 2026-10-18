// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ThankYouPage} from "./thank-you-page";

const base = {campaign: {title: "Clean water for schools", slug: "clean-water"}, signedIn: false};

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
});