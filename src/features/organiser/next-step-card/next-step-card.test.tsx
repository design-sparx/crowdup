// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {NextStepCard} from "./next-step-card";

describe("NextStepCard", () => {
    it("offers Connect Stripe as a form that posts to the connect action", () => {
        const {container} = renderWithRouter(<NextStepCard step={{kind: "connect_stripe"}}/>);
        expect(screen.getByRole("button", {name: "Connect Stripe"})).toBeInTheDocument();
        expect(container.querySelector('form[action="/stripe/connect"]')).not.toBeNull();
    });

    it("links a draft to its publish action", () => {
        renderWithRouter(<NextStepCard step={{kind: "publish", campaignId: "abc"}}/>);
        expect(screen.getByRole("button", {name: "Publish campaign"})).toBeInTheDocument();
    });

    it("links a live campaign to its public page to share", () => {
        renderWithRouter(<NextStepCard step={{kind: "share", slug: "clean-water"}}/>);
        expect(screen.getByRole("link", {name: "View your campaign"})).toHaveAttribute("href", "/campaigns/clean-water");
    });

    it("renders nothing when there is no next step", () => {
        const {container} = renderWithRouter(<NextStepCard step={{kind: "none"}}/>);
        expect(container.textContent).toBe("");
    });
});
