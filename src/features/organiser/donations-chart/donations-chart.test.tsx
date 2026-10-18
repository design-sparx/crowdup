// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {DonationsChart} from "./donations-chart";

const series = {days: ["2026-10-16", "2026-10-17"], series: [{currency: "KES", data: [0, 5000]}]};

describe("DonationsChart", () => {
    it("is labelled for screen readers and names the period", () => {
        render(<DonationsChart series={series}/>);
        expect(screen.getByRole("img", {name: /Donations per day, last 2 days/})).toBeInTheDocument();
    });

    it("says so when nothing has been donated in the period", () => {
        render(<DonationsChart series={{days: ["2026-10-16"], series: []}}/>);
        expect(screen.getByText("No donations in this period yet.")).toBeInTheDocument();
    });

    it("charts every currency, not only the first, because an organiser can have campaigns in several", () => {
        const both = {days: ["2026-10-16", "2026-10-17"], series: [
            {currency: "KES", data: [0, 5000]},
            {currency: "GBP", data: [1200, 0]},
        ]};
        render(<DonationsChart series={both}/>);
        expect(screen.getByRole("img", {name: /Donations per day, last 2 days, in KES, GBP/})).toBeInTheDocument();
    });
});
