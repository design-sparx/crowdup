import {describe, expect, it} from "vitest";
import {toDonationHistory, type DonationHistoryRow} from "./history";

const row = (over: Partial<DonationHistoryRow> = {}): DonationHistoryRow => ({
    id: "d1",
    amount: 5000,
    currency: "KES",
    created_at: "2026-10-10T10:00:00Z",
    status: "confirmed",
    campaign_title: "Clean water",
    campaign_slug: "clean-water",
    ...over,
});

describe("toDonationHistory", () => {
    it("returns an empty list for no rows", () => {
        expect(toDonationHistory([])).toEqual([]);
    });

    it("maps a row to the view model with the campaign link", () => {
        expect(toDonationHistory([row()])).toEqual([
            {
                id: "d1",
                campaignTitle: "Clean water",
                campaignHref: "/campaigns/clean-water",
                amount: 5000,
                currency: "KES",
                createdAt: "2026-10-10T10:00:00Z",
                status: "confirmed",
            },
        ]);
    });

    it("orders newest first without mutating the input", () => {
        const rows = [
            row({id: "old", created_at: "2026-10-01T00:00:00Z"}),
            row({id: "new", created_at: "2026-10-12T00:00:00Z"}),
        ];
        expect(toDonationHistory(rows).map((d) => d.id)).toEqual(["new", "old"]);
        expect(rows[0].id).toBe("old");
    });

    it("coerces bigint amounts that arrive as strings", () => {
        expect(toDonationHistory([row({amount: "2500" as unknown as number})])[0].amount).toBe(2500);
    });

    it("drops rows that are not confirmed", () => {
        expect(toDonationHistory([row({status: "pending"}), row({id: "ok"})]).map((d) => d.id)).toEqual(["ok"]);
    });
});
