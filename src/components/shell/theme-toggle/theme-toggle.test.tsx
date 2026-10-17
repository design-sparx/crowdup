// @vitest-environment jsdom
import {afterEach, describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ThemeToggle} from "./theme-toggle";

afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
});

describe("ThemeToggle", () => {
    it("switches to dark, remembers it, and switches back", async () => {
        render(<ThemeToggle/>);
        const button = screen.getByRole("button", {name: "Toggle theme"});

        await userEvent.click(button);
        expect(document.documentElement).toHaveClass("dark");
        expect(localStorage.getItem("theme")).toBe("dark");

        await userEvent.click(button);
        expect(document.documentElement).not.toHaveClass("dark");
        expect(localStorage.getItem("theme")).toBe("light");
    });
});
