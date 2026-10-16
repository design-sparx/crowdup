import {describe, expect, it} from "vitest";
import {clientKey, groupOpenReports, parseReason} from "./reports";

describe("parseReason", () => {
    it("trims and accepts 3 to 1000 characters", () => {
        expect(parseReason("  spam  ")).toEqual({ok: true, reason: "spam"});
        expect(parseReason("a".repeat(1000))).toEqual({ok: true, reason: "a".repeat(1000)});
    });
    it("rejects too short, too long and non-strings", () => {
        expect(parseReason(" ab ").ok).toBe(false);
        expect(parseReason("a".repeat(1001)).ok).toBe(false);
        expect(parseReason(null).ok).toBe(false);
    });
});

describe("clientKey", () => {
    it("prefers the signed-in user id", () => {
        expect(clientKey("user-1", new Headers({"x-forwarded-for": "1.2.3.4"}))).toBe("user:user-1");
    });
    it("uses the first forwarded address for guests", () => {
        expect(clientKey(null, new Headers({"x-forwarded-for": "1.2.3.4, 10.0.0.1"}))).toBe("ip:1.2.3.4");
    });
    it("falls back to a shared bucket when no address is known", () => {
        expect(clientKey(null, new Headers())).toBe("ip:unknown");
    });
});

describe("groupOpenReports", () => {
    const rows = [
        {id: "r1", campaign_id: "c1", reason: "Scam", reporter_id: "u1", created_at: "2026-01-01T00:00:00Z", campaign: {title: "One", slug: "one"}},
        {id: "r2", campaign_id: "c2", reason: "Spam", reporter_id: null, created_at: "2026-01-02T00:00:00Z", campaign: {title: "Two", slug: "two"}},
        {id: "r3", campaign_id: "c1", reason: "Fake photos", reporter_id: null, created_at: "2026-01-03T00:00:00Z", campaign: {title: "One", slug: "one"}},
    ];
    it("groups per campaign with reasons and report count, most reported first", () => {
        const groups = groupOpenReports(rows);
        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({campaignId: "c1", title: "One", slug: "one", reportCount: 2});
        expect(groups[0].reasons).toEqual(["Fake photos", "Scam"]);
        expect(groups[0].reportIds).toEqual(["r1", "r3"]);
        expect(groups[1]).toMatchObject({campaignId: "c2", reportCount: 1});
    });
    it("skips reports whose campaign is not readable", () => {
        expect(groupOpenReports([{...rows[0], campaign: null}])).toEqual([]);
    });
});
