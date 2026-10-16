import {describe, expect, it} from "vitest";
import {buildDonationMetadata, parseDonationMetadata} from "./metadata";

describe("donation metadata", () => {
    const base = {campaignId: "c1", anonymous: true, donorName: "Ada", message: "Hi", userId: "u1", fee: 50};
    it("round-trips", () => {
        expect(parseDonationMetadata(buildDonationMetadata(base))).toEqual({
            campaignId: "c1", anonymous: true, donorName: "Ada", message: "Hi", userId: "u1", fee: 50,
        });
    });
    it("omits empty fields and stays within Stripe limits", () => {
        const m = buildDonationMetadata({...base, donorName: null, message: "x".repeat(900), userId: null});
        expect(Object.keys(m).length).toBeLessThanOrEqual(50);
        for (const v of Object.values(m)) expect(Array.from(v).length).toBeLessThanOrEqual(500);
        expect(m.crowdup_donor_name).toBeUndefined();
        expect(m.crowdup_user_id).toBeUndefined();
    });
    it("truncates on characters without splitting surrogate pairs", () => {
        const m = buildDonationMetadata({...base, message: "😀".repeat(600)});
        expect(Array.from(m.crowdup_message)).toHaveLength(500);
        expect(m.crowdup_message).not.toMatch(/[\ud800-\udbff]$/);
    });
    it("returns null when the campaign id is missing", () => {
        expect(parseDonationMetadata({})).toBeNull();
        expect(parseDonationMetadata(null)).toBeNull();
    });
    it("tolerates a bad fee value", () => {
        expect(parseDonationMetadata({crowdup_campaign_id: "c1", crowdup_fee: "abc"})?.fee).toBe(0);
        expect(parseDonationMetadata({crowdup_campaign_id: "c1", crowdup_fee: "-4"})?.fee).toBe(0);
    });
});
