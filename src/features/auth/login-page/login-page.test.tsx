// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {LoginPage} from "./login-page";

describe("LoginPage", () => {
    it("gives the forgot-password link a 44px touch target", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} signupEnabled error={undefined}/>);
        expect(screen.getByRole("link", {name: "Forgot password?"})).toHaveClass("min-h-11");
    });
    it("has the email and password fields, a sign-in button and sign-up and forgot links", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} signupEnabled error={undefined}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Log in"})).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Sign in"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Create an account"})).toHaveAttribute("href", "/signup?next=%2Fdashboard");
        expect(screen.getByRole("link", {name: "Forgot password?"})).toHaveAttribute("href", "/forgot-password");
    });
    it("replaces the sign-up link with a note when signup is disabled", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} signupEnabled={false} error={undefined}/>);
        expect(screen.queryByRole("link", {name: "Create an account"})).not.toBeInTheDocument();
        expect(screen.getByText("Accounts are created by the site team.")).toBeInTheDocument();
    });
    it("shows the Google button only when Google is enabled", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled signupEnabled error={undefined}/>);
        expect(screen.getByRole("button", {name: "Continue with Google"})).toBeInTheDocument();
    });
    it("shows the server's error as an alert", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} signupEnabled error="Invalid email or password."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.");
    });
    it("shows the server's message as a status", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} signupEnabled message="Ask the site team for an account."/>);
        expect(screen.getByRole("status")).toHaveTextContent("Ask the site team for an account.");
    });
    it("never shows a message alongside an error", () => {
        renderWithRouter(
            <LoginPage next="/dashboard" googleEnabled={false} signupEnabled error="Nope." message="Ignored."/>,
        );
        expect(screen.getByRole("alert")).toHaveTextContent("Nope.");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
