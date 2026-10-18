// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {CoverUpload} from "./cover-upload";

describe("CoverUpload", () => {
    it("describes the accepted types and the size limit", () => {
        render(<CoverUpload name="cover"/>);
        expect(screen.getByText(/JPEG, PNG or WebP/)).toBeInTheDocument();
        expect(screen.getByText(/3 MB/)).toBeInTheDocument();
    });

    it("renders a file input named for the form field, limited to the allowed types", () => {
        const {container} = render(<CoverUpload name="cover"/>);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(input.name).toBe("cover");
        expect(input.accept).toBe("image/jpeg,image/png,image/webp");
    });

    it("shows the existing cover when given one", () => {
        render(<CoverUpload name="cover" defaultUrl="https://images.example/cover.jpg"/>);
        expect(screen.getByRole("img", {name: "Current cover"})).toHaveAttribute("src", "https://images.example/cover.jpg");
    });

    it("shows the error text when given one", () => {
        render(<CoverUpload name="cover" error="The cover image must be 3 MB or smaller."/>);
        expect(screen.getByText("The cover image must be 3 MB or smaller.")).toBeInTheDocument();
    });
});
