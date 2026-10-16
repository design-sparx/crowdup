import {describe, expect, it} from "vitest";
import {bucketDonations, donorLabel, summarize, type DashboardCampaign, type DashboardDonation} from "./dashboard";

const campaigns: DashboardCampaign[] = [
    {id: "c1", slug: "one", title: "One", status: "live", currency: "KES", goalAmount: 100000},
    {id: "c2", slug: "two", title: "Two", status: "draft", currency: "KES", goalAmount: 5000},
    {id: "c3", slug: "three", title: "Three", status: "closed", currency: "GBP", goalAmount: 5000},
];

const donation = (over: Partial<DashboardDonation>): DashboardDonation => ({
    id: "d", campaignId: "c1", amount: 1000, currency: "KES", createdAt: "2026-10-10T10:00:00Z",
    anonymous: false, donorName: "Dana", ...over,
});

describe("donorLabel", () => {
    it("shows the name when the donor chose to be named", () => {
        expect(donorLabel({anonymous: false, donorName: "Dana"})).toBe("Dana");
    });
    it("shows Anonymous when the donor chose anonymity, even if a name is present", () => {
        expect(donorLabel({anonymous: true, donorName: "Leaky Name"})).toBe("Anonymous");
    });
    it("shows Anonymous when no name was given", () => {
        expect(donorLabel({anonymous: false, donorName: null})).toBe("Anonymous");
        expect(donorLabel({anonymous: false, donorName: "  "})).toBe("Anonymous");
    });
});

describe("summarize", () => {
    it("returns zeros for campaigns without donations", () => {
        const s = summarize(campaigns, []);
        expect(s.campaigns.map((c) => [c.raised, c.donors, c.percentFunded])).toEqual([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
        expect(s.totalsByCurrency).toEqual([]);
    });
    it("sums per campaign and per currency and counts donors", () => {
        const s = summarize(campaigns, [
            donation({id: "a", amount: 25000}),
            donation({id: "b", amount: 5000, anonymous: true, donorName: null}),
            donation({id: "c", campaignId: "c3", currency: "GBP", amount: 2500}),
        ]);
        expect(s.campaigns[0]).toMatchObject({raised: 30000, donors: 2, percentFunded: 30});
        expect(s.campaigns[2]).toMatchObject({raised: 2500, donors: 1, percentFunded: 50});
        expect(s.totalsByCurrency).toEqual([
            {currency: "KES", raised: 30000, donors: 2},
            {currency: "GBP", raised: 2500, donors: 1},
        ]);
    });
    it("ignores donations for campaigns that are not the organiser's", () => {
        const s = summarize(campaigns, [donation({campaignId: "someone-elses", amount: 99999})]);
        expect(s.totalsByCurrency).toEqual([]);
    });
    it("caps percent funded at 100", () => {
        const s = summarize(campaigns, [donation({campaignId: "c2", amount: 999999})]);
        expect(s.campaigns[1].percentFunded).toBe(100);
    });
});

describe("bucketDonations", () => {
    const now = new Date("2026-10-16T12:00:00Z");
    it("makes one daily bucket per day, oldest first", () => {
        const b = bucketDonations([], 3, now);
        expect(b.days).toEqual(["2026-10-14", "2026-10-15", "2026-10-16"]);
        expect(b.series).toEqual([]);
    });
    it("sums donations per day and currency (UTC days), zero filled", () => {
        const b = bucketDonations([
            donation({amount: 1000, createdAt: "2026-10-15T23:59:00Z"}),
            donation({amount: 500, createdAt: "2026-10-15T01:00:00Z"}),
            donation({amount: 700, createdAt: "2026-10-16T00:00:00Z", currency: "GBP"}),
            donation({amount: 9999, createdAt: "2026-09-01T00:00:00Z"}),
        ], 3, now);
        expect(b.series).toEqual([
            {currency: "KES", data: [0, 1500, 0]},
            {currency: "GBP", data: [0, 0, 700]},
        ]);
    });
});
