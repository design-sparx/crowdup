// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SiteFooter} from "./site-footer";

describe("SiteFooter", () => {
    it("links to the legal pages", () => {
        renderWithRouter(<SiteFooter/>);
        expect(screen.getByRole("link", {name: "Terms"})).toHaveAttribute("href", "/terms");
        expect(screen.getByRole("link", {name: "Privacy"})).toHaveAttribute("href", "/privacy");
        expect(screen.getByRole("link", {name: "Security"})).toHaveAttribute("href", "/security");
    });
});
