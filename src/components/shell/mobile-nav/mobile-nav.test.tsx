// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import {MobileNav} from "./mobile-nav";

describe("MobileNav", () => {
    it("keeps the links hidden until the menu is opened", async () => {
        renderWithRouter(<MobileNav/>);
        expect(screen.queryByRole("link", {name: "Browse"})).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Open menu"}));
        expect(await screen.findByRole("link", {name: "Browse"})).toHaveAttribute("href", "/campaigns");
    });
});
