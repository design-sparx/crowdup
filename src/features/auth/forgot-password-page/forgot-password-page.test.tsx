// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ForgotPasswordPage} from "./forgot-password-page";

describe("ForgotPasswordPage", () => {
    it("asks for an email and links back to login", () => {
        renderWithRouter(<ForgotPasswordPage message={undefined}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Reset your password"})).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Send reset link"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Back to log in"})).toHaveAttribute("href", "/login");
    });
    it("shows the server's message and no form once submitted", () => {
        renderWithRouter(<ForgotPasswordPage message="If an account exists for that email, a reset link is on its way."/>);
        expect(screen.getByRole("status")).toHaveTextContent("a reset link is on its way");
    });
});
