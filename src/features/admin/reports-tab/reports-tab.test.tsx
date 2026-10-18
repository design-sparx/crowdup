// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ReportsTab} from "./reports-tab";

const groups = [
    {campaignId: "c1", title: "Clean water for schools", slug: "clean-water", reports: [
        {id: "r1", reason: "Looks like a scam", createdAt: "2026-03-05T10:00:00Z"},
        {id: "r2", reason: "Misleading photo", createdAt: "2026-03-04T10:00:00Z"},
    ]},
];

describe("ReportsTab", () => {
    it("shows each reported campaign, its reports and a link to it", () => {
        renderWithRouter(<ReportsTab groups={groups}/>);
        expect(screen.getByText("Clean water for schools")).toBeInTheDocument();
        expect(screen.getByText("Looks like a scam")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Clean water for schools"})).toHaveAttribute("href", "/campaigns/clean-water");
    });

    it("dismisses a campaign's reports with the reportId fields the server reads", () => {
        const {container} = renderWithRouter(<ReportsTab groups={groups}/>);
        // Dismissal is per campaign: the form carries every open report id as a hidden reportId field.
        const hidden = container.querySelectorAll('input[name="reportId"]');
        expect(hidden).toHaveLength(2);
        expect(screen.getByRole("button", {name: "Dismiss reports"})).toHaveAttribute("name", "intent");
        expect(screen.getByRole("button", {name: "Dismiss reports"})).toHaveAttribute("value", "dismiss");
    });

    it("shows an empty state when there are no open reports", () => {
        renderWithRouter(<ReportsTab groups={[]}/>);
        expect(screen.getByText("No open reports.")).toBeInTheDocument();
    });
});
