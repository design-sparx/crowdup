// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {UserMenu} from "./user-menu";

describe("UserMenu", () => {
    it("shows a Log in link when signed out", () => {
        renderWithRouter(<UserMenu account={null}/>);
        expect(screen.getByRole("link", {name: "Log in"})).toHaveAttribute("href", "/login");
        expect(screen.getByRole("link", {name: "Log in"})).toHaveClass("h-11");
    });
    it("shows the account button with initials when signed in", () => {
        renderWithRouter(<UserMenu account={{name: "Jane Doe", avatar: null}}/>);
        const button = screen.getByRole("button", {name: "Account menu"});
        expect(button).toHaveTextContent("JD");
        expect(screen.queryByRole("link", {name: "Log in"})).not.toBeInTheDocument();
    });
});
