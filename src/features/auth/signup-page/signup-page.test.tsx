// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SignupPage} from "./signup-page";

describe("SignupPage", () => {
    it("has name, email, password, the consent checkbox and a sign-up button", () => {
        renderWithRouter(<SignupPage next="/dashboard" googleEnabled={false} error={undefined} message={undefined}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Create your account"})).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", {name: /I agree to the Terms and Privacy Policy/})).toBeRequired();
        expect(screen.getByRole("button", {name: "Sign up"})).toBeInTheDocument();
    });
    it("shows the server's message after signup needs email confirmation", () => {
        renderWithRouter(
            <SignupPage next="/dashboard" googleEnabled={false} error={undefined} message="Check your email to confirm your account."/>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Check your email to confirm your account.");
    });
    it("shows the server's error as an alert", () => {
        renderWithRouter(
            <SignupPage next="/dashboard" googleEnabled={false} error="Enter an email and a password of at least 8 characters." message={undefined}/>,
        );
        expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
    });
});
