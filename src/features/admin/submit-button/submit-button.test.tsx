// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SubmitButton} from "./submit-button";

describe("SubmitButton", () => {
    it("is enabled when no submission is in flight", () => {
        renderWithRouter(<SubmitButton name="intent" value="approve">Approve</SubmitButton>);
        expect(screen.getByRole("button", {name: "Approve"})).toBeEnabled();
    });

    it("keeps its name and value so the server still gets the intent", () => {
        renderWithRouter(<SubmitButton name="intent" value="approve">Approve</SubmitButton>);
        const button = screen.getByRole("button", {name: "Approve"});
        expect(button).toHaveAttribute("name", "intent");
        expect(button).toHaveAttribute("value", "approve");
    });
});
