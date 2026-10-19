// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {PasswordField} from "./password-field";

describe("PasswordField", () => {
    it("renders a labelled password input that hides the text by default", () => {
        render(<PasswordField name="password" label="Password"/>);
        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("toggles the text between hidden and visible", async () => {
        render(<PasswordField name="password" label="Password"/>);
        await userEvent.click(screen.getByRole("button", {name: "Show password"}));
        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
        await userEvent.click(screen.getByRole("button", {name: "Hide password"}));
        expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("shows the error text and marks the input invalid", () => {
        render(<PasswordField name="password" label="Password" error="Too short."/>);
        expect(screen.getByText("Too short.")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
    });
});
