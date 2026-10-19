// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {GoogleButton} from "./google-button";

describe("GoogleButton", () => {
    it("is a submit button for the Google intent", () => {
        render(<GoogleButton/>);
        const button = screen.getByRole("button", {name: "Continue with Google"});
        expect(button).toHaveAttribute("type", "submit");
        expect(button).toHaveAttribute("name", "intent");
        expect(button).toHaveAttribute("value", "google");
    });
});
