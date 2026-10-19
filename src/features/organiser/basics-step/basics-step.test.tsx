// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {BasicsStep} from "./basics-step";

describe("BasicsStep", () => {
    it("has the title, category, country and summary fields", () => {
        renderWithRouter(<BasicsStep errors={{}} defaults={{}}/>);
        expect(screen.getByLabelText("Title")).toBeInTheDocument();
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByLabelText("Country")).toBeInTheDocument();
        expect(screen.getByLabelText("Summary")).toBeInTheDocument();
    });

    it("offers the campaign categories", () => {
        renderWithRouter(<BasicsStep errors={{}} defaults={{}}/>);
        const category = screen.getByLabelText("Category");
        expect(category.querySelectorAll("option").length).toBeGreaterThan(1);
        expect(screen.getByRole("option", {name: "Environment"})).toBeInTheDocument();
    });

    it("shows the server's error for a field next to that field", () => {
        renderWithRouter(<BasicsStep errors={{title: "Use a title of 3 to 140 characters."}} defaults={{}}/>);
        expect(screen.getByText("Use a title of 3 to 140 characters.")).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    });
});
