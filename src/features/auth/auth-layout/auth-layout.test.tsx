// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {AuthLayout} from "./auth-layout";

describe("AuthLayout", () => {
    it("has one h1 and renders its children in a card", () => {
        renderWithRouter(
            <AuthLayout title="Log in">
                <p>Form goes here</p>
            </AuthLayout>,
        );
        expect(screen.getByRole("heading", {level: 1, name: "Log in"})).toBeInTheDocument();
        expect(screen.getByText("Form goes here")).toBeInTheDocument();
    });
});
