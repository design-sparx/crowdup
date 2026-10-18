// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ManageCampaignPage} from "./manage-campaign-page";

const base = {
    campaignId: "c1",
    title: "Clean water for schools",
    status: "live" as const,
    updates: [{id: "u1", body: "Taps are working.", createdAt: "2026-03-05T10:00:00Z"}],
    donors: [],
    publish: null,
    saved: false,
    moderationNotice: null,
    lifecycleNotice: null,
    lifecycleError: null,
    formErrors: {},
    currency: "KES",
    stripeStatus: "connected" as const,
    defaults: {title: "Clean water for schools"},
    storyHtml: "",
    publicUrl: "https://crowdup.example/campaigns/clean-water",
};

describe("ManageCampaignPage", () => {
    it("has one h1 with the campaign title and its status", () => {
        renderWithRouter(<ManageCampaignPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Clean water for schools"})).toBeInTheDocument();
        expect(screen.getByText("live")).toBeInTheDocument();
    });

    it("shows the publish result when the publish action sent one back", () => {
        renderWithRouter(<ManageCampaignPage {...base} publish="awaiting_approval"/>);
        expect(screen.getByRole("heading", {level: 2, name: "Waiting for approval"})).toBeInTheDocument();
    });

    it("shows the posted update and its count", () => {
        renderWithRouter(<ManageCampaignPage {...base}/>);
        expect(screen.getByText("Taps are working.")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Post update"})).toBeInTheDocument();
    });

    it("offers the close control", () => {
        renderWithRouter(<ManageCampaignPage {...base}/>);
        expect(screen.getByRole("button", {name: "Close campaign"})).toBeInTheDocument();
    });

    it("shows the server's lifecycle error", () => {
        renderWithRouter(<ManageCampaignPage {...base} lifecycleError="This campaign cannot be closed."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("This campaign cannot be closed.");
    });
});
