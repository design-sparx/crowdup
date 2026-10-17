import {describe, expect, it} from "vitest";
import {canAcceptDonations, effectiveStatus} from "./lifecycle";

const now = new Date("2026-06-15T12:00:00Z");
const past = "2026-06-15T11:59:59Z";
const future = "2026-06-15T12:00:01Z";

describe("canAcceptDonations", () => {
    it("accepts a live campaign with no end date", () => {
        expect(canAcceptDonations({status: "live", endDate: null}, now)).toBe(true);
    });
    it("accepts a live campaign before its end date", () => {
        expect(canAcceptDonations({status: "live", endDate: future}, now)).toBe(true);
    });
    it("rejects a live campaign past its end date", () => {
        expect(canAcceptDonations({status: "live", endDate: past}, now)).toBe(false);
    });
    it("rejects a live campaign exactly at its end date", () => {
        expect(canAcceptDonations({status: "live", endDate: now.toISOString()}, now)).toBe(false);
    });
    it.each(["draft", "closed", "suspended", "ended", "unknown", ""])("rejects status %s", (status) => {
        expect(canAcceptDonations({status, endDate: null}, now)).toBe(false);
        expect(canAcceptDonations({status, endDate: future}, now)).toBe(false);
    });
    it("rejects an unparseable end date rather than accepting", () => {
        expect(canAcceptDonations({status: "live", endDate: "garbage"}, now)).toBe(false);
    });
    it("does not cap at the goal", () => {
        const c = {status: "live", endDate: null, goalAmount: 100, raisedAmount: 500};
        expect(canAcceptDonations(c, now)).toBe(true);
    });
});

describe("effectiveStatus", () => {
    it("is ended for a live campaign past its end date", () => {
        expect(effectiveStatus({status: "live", endDate: past}, now)).toBe("ended");
    });
    it("is live before the end date or without one", () => {
        expect(effectiveStatus({status: "live", endDate: future}, now)).toBe("live");
        expect(effectiveStatus({status: "live", endDate: null}, now)).toBe("live");
    });
    it.each(["draft", "closed", "suspended"])("keeps %s even past the end date", (status) => {
        expect(effectiveStatus({status, endDate: past}, now)).toBe(status);
    });
});

describe("moderation statuses", () => {
    it("never accept donations and are not rewritten by the end date", () => {
        for (const status of ["pending_approval", "rejected", "draft", "suspended", "closed"]) {
            expect(canAcceptDonations({status, endDate: future}, now)).toBe(false);
            expect(effectiveStatus({status, endDate: past}, now)).toBe(status);
        }
    });
});
