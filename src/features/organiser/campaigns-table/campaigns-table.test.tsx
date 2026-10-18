// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen, within} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {CampaignStats} from "@/lib/dashboard/dashboard";
import {CampaignsTable} from "./campaigns-table";

const campaigns: CampaignStats[] = [
    {id: "1", slug: "clean-water", title: "Clean water for schools", status: "live", currency: "KES",
        goalAmount: 500000, raised: 310000, donors: 2, percentFunded: 62, suspendedReason: null, rejectionReason: null},
    {id: "2", slug: "football-kit", title: "Youth football kit fund", status: "draft", currency: null,
        goalAmount: 200000, raised: 0, donors: 0, percentFunded: 0, suspendedReason: null, rejectionReason: null},
];

describe("CampaignsTable", () => {
    it("lists each campaign with its status and raised amount", () => {
        renderWithRouter(<CampaignsTable campaigns={campaigns}/>);
        const table = screen.getByRole("table", {name: "Your campaigns"});
        expect(within(table).getByText("Clean water for schools")).toBeInTheDocument();
        expect(within(table).getByText("live")).toBeInTheDocument();
        expect(within(table).getByText("draft")).toBeInTheDocument();
        expect(within(table).getByText("KES 3,100.00")).toBeInTheDocument();
    });

    it("gives each campaign an edit link", () => {
        renderWithRouter(<CampaignsTable campaigns={campaigns}/>);
        expect(screen.getByRole("link", {name: "Edit Youth football kit fund"})).toHaveAttribute("href", "/campaigns/2/edit");
    });

    it("says so when the organiser has no campaigns", () => {
        renderWithRouter(<CampaignsTable campaigns={[]}/>);
        expect(screen.getByText("You have no campaigns yet.")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Create a campaign"})).toHaveAttribute("href", "/create-campaign");
    });
});
