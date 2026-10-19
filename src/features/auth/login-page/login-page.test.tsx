// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {LoginPage} from "./login-page";

describe("LoginPage", () => {
    it("has the email and password fields, a sign-in button and sign-up and forgot links", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} error={undefined}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Log in"})).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Sign in"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Create an account"})).toHaveAttribute("href", "/signup?next=%2Fdashboard");
        expect(screen.getByRole("link", {name: "Forgot password?"})).toHaveAttribute("href", "/forgot-password");
    });
    it("shows the Google button only when Google is enabled", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled error={undefined}/>);
        expect(screen.getByRole("button", {name: "Continue with Google"})).toBeInTheDocument();
    });
    it("shows the server's error as an alert", () => {
        renderWithRouter(<LoginPage next="/dashboard" googleEnabled={false} error="Invalid email or password."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.");
    });
});
