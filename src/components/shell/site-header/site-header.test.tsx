// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SiteHeader} from "./site-header";

describe("SiteHeader", () => {
    it("links to the main places", () => {
        renderWithRouter(<SiteHeader account={null}/>);
        expect(screen.getByRole("link", {name: "CrowdUp"})).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", {name: "Browse"})).toHaveAttribute("href", "/campaigns");
        expect(screen.getByRole("link", {name: "Start a campaign"})).toHaveAttribute("href", "/create-campaign");
    });
    it("offers Log in when signed out and the account menu when signed in", () => {
        const {unmount} = renderWithRouter(<SiteHeader account={null}/>);
        expect(screen.getByRole("link", {name: "Log in"})).toBeInTheDocument();
        unmount();
        renderWithRouter(<SiteHeader account={{name: "Jane Doe", avatar: null}}/>);
        expect(screen.getByRole("button", {name: "Account menu"})).toBeInTheDocument();
    });
});
