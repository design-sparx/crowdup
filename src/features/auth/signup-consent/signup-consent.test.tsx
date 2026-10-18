// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SignupConsent} from "./signup-consent";

describe("SignupConsent", () => {
    it("is a required checkbox that links to the terms and privacy pages", () => {
        renderWithRouter(<SignupConsent/>);
        const box = screen.getByRole("checkbox", {name: /I agree to the Terms and Privacy Policy/});
        expect(box).toBeRequired();
        expect(screen.getByRole("link", {name: "Terms"})).toHaveAttribute("href", "/terms");
        expect(screen.getByRole("link", {name: "Privacy Policy"})).toHaveAttribute("href", "/privacy");
    });
});
