// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import {PostUpdateForm} from "./post-update-form";

describe("PostUpdateForm", () => {
    it("posts with the post-update intent the server reads", () => {
        renderWithRouter(<PostUpdateForm/>);
        const button = screen.getByRole("button", {name: "Post update"});
        expect(button).toHaveAttribute("name", "intent");
        expect(button).toHaveAttribute("value", "post-update");
    });

    it("shows a live character count against the 5000 limit", async () => {
        renderWithRouter(<PostUpdateForm/>);
        expect(screen.getByText("0 / 5000")).toBeInTheDocument();
        await userEvent.type(screen.getByLabelText("Post an update"), "Hello");
        expect(screen.getByText("5 / 5000")).toBeInTheDocument();
    });

    it("shows the server's error when an update is rejected", () => {
        renderWithRouter(<PostUpdateForm error="Updates can be at most 5000 characters."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("Updates can be at most 5000 characters.");
    });
});
