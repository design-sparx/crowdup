// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ReportsTab} from "./reports-tab";

const groups = [
    {campaignId: "c1", title: "Clean water for schools", slug: "clean-water", reportCount: 2,
        reasons: ["Looks like a scam", "Misleading photo"], reportIds: ["r1", "r2"]},
];

describe("ReportsTab", () => {
    it("shows each reported campaign, its count, its reasons and a link to it", () => {
        renderWithRouter(<ReportsTab groups={groups}/>);
        expect(screen.getByRole("link", {name: "Clean water for schools"})).toHaveAttribute("href", "/campaigns/clean-water");
        expect(screen.getByText("2 open")).toBeInTheDocument();
        expect(screen.getByText("Looks like a scam")).toBeInTheDocument();
        expect(screen.getByText("Misleading photo")).toBeInTheDocument();
    });

    it("dismisses the campaign's reports by posting every report id the server gave", () => {
        const {container} = renderWithRouter(<ReportsTab groups={groups}/>);
        const ids = Array.from(container.querySelectorAll('input[name="reportId"]')).map((i) => (i as HTMLInputElement).value);
        expect(ids).toEqual(["r1", "r2"]);
        expect(screen.getByRole("button", {name: "Dismiss reports"})).toHaveAttribute("name", "intent");
        expect(screen.getByRole("button", {name: "Dismiss reports"})).toHaveAttribute("value", "dismiss");
    });

    it("shows an empty state when there are no open reports", () => {
        renderWithRouter(<ReportsTab groups={[]}/>);
        expect(screen.getByText("No open reports.")).toBeInTheDocument();
    });
});
