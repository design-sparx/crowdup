// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {PublishResult} from "./publish-result";

const shareUrl = "https://crowdup.example/campaigns/clean-water";

describe("PublishResult", () => {
    it("shows the campaign is live, with its link and a copy button", () => {
        renderWithRouter(<PublishResult result="live" title="Clean water" shareUrl={shareUrl}/>);
        expect(screen.getByRole("heading", {level: 2, name: "Your campaign is live"})).toBeInTheDocument();
        expect(screen.getByText(shareUrl)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "WhatsApp"})).toHaveAttribute("href", expect.stringContaining("Clean%20water"));
    });

    it("explains the wait when approval is required, with no share link yet", () => {
        renderWithRouter(<PublishResult result="awaiting_approval" title="Clean water" shareUrl={shareUrl}/>);
        expect(screen.getByRole("heading", {level: 2, name: "Waiting for approval"})).toBeInTheDocument();
        expect(screen.getByText(/An admin reviews every campaign/)).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Copy link"})).not.toBeInTheDocument();
    });

    it("says Stripe must be connected first", () => {
        renderWithRouter(<PublishResult result="not_connected" title="Clean water" shareUrl={shareUrl}/>);
        expect(screen.getByRole("alert")).toHaveTextContent("Connect Stripe before you publish");
    });

    it("says the goal is not valid for the currency", () => {
        renderWithRouter(<PublishResult result="bad_goal" title="Clean water" shareUrl={shareUrl}/>);
        expect(screen.getByRole("alert")).toHaveTextContent("goal");
    });
});
