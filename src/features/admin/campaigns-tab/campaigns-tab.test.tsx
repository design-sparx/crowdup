// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {CampaignsTab} from "./campaigns-tab";

const campaigns = [
    {id: "c1", slug: "clean-water", title: "Clean water for schools", status: "live", suspendedReason: null},
    {id: "c2", slug: "quick-cash", title: "Quick cash", status: "suspended", suspendedReason: "Possible scam."},
];

describe("CampaignsTab", () => {
    it("suspends a live campaign with a reason the server requires", () => {
        renderWithRouter(<CampaignsTab campaigns={[campaigns[0]]}/>);
        expect(screen.getByLabelText("Reason for suspending")).toHaveAttribute("name", "reason");
        const button = screen.getByRole("button", {name: "Suspend"});
        expect(button).toHaveAttribute("name", "intent");
        expect(button).toHaveAttribute("value", "suspend");
    });

    it("restores a suspended campaign and shows the reason it was suspended", () => {
        renderWithRouter(<CampaignsTab campaigns={[campaigns[1]]}/>);
        expect(screen.getByText("Reason: Possible scam.")).toBeInTheDocument();
        const button = screen.getByRole("button", {name: "Restore"});
        expect(button).toHaveAttribute("value", "restore");
    });

    it("shows an empty state when there are no campaigns to review", () => {
        renderWithRouter(<CampaignsTab campaigns={[]}/>);
        expect(screen.getByText("No campaigns to review.")).toBeInTheDocument();
    });
});
