// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {UpdatePasswordPage} from "./update-password-page";

describe("UpdatePasswordPage", () => {
    it("asks for a new password", () => {
        renderWithRouter(<UpdatePasswordPage error={undefined}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Choose a new password"})).toBeInTheDocument();
        expect(screen.getByLabelText("New password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Update password"})).toBeInTheDocument();
    });
    it("shows the server's error", () => {
        renderWithRouter(<UpdatePasswordPage error="Password must be at least 8 characters."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
    });
});
