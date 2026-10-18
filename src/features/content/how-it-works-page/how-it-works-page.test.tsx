// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter as render} from "@/test/render-with-router";
import {HowItWorksPage} from "./how-it-works-page";

describe("HowItWorksPage", () => {
    it("has one h1 and explains the four steps in order", () => {
        render(<HowItWorksPage/>);
        expect(screen.getByRole("heading", {level: 1, name: "How it works"})).toBeInTheDocument();
        // Each heading reads "1. Start a campaign"; compare the names, not the step numbers.
        const steps = screen.getAllByRole("heading", {level: 2}).map((h) => h.textContent?.replace(/^\d+\.\s*/, ""));
        expect(steps).toEqual(["Start a campaign", "Connect Stripe", "Share it", "Get paid"]);
    });

    it("does not state a fixed platform fee, because the operator sets it", () => {
        render(<HowItWorksPage/>);
        expect(screen.queryByText(/\d+\s?%/)).not.toBeInTheDocument();
    });

    it("describes approval only as something the operator may require", () => {
        render(<HowItWorksPage/>);
        expect(screen.getByText(/may need an admin to approve/i)).toBeInTheDocument();
    });
});
