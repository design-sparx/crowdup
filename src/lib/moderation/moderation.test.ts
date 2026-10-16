import {describe, expect, it} from "vitest";
import {
    campaignSuspensionNotice,
    canSuspendCampaign,
    mapModerationError,
    parseModerationReason,
    restoreStatus,
    userSuspensionNotice,
} from "./moderation";

describe("parseModerationReason", () => {
    it("trims and accepts 3 to 1000 characters", () => {
        expect(parseModerationReason("  Fraud  ")).toEqual({ok: true, reason: "Fraud"});
        expect(parseModerationReason("a".repeat(1000)).ok).toBe(true);
    });
    it("requires a reason", () => {
        for (const v of [null, undefined, "", "  ", "ab", "a".repeat(1001), 5]) {
            expect(parseModerationReason(v).ok).toBe(false);
        }
    });
});

describe("restoreStatus", () => {
    it("restores to the stored prior status", () => {
        expect(restoreStatus("live")).toBe("live");
        expect(restoreStatus("closed")).toBe("closed");
    });
    it("falls back to closed (never live) when the prior status is unknown", () => {
        for (const v of [null, undefined, "", "draft", "suspended", "bogus"]) {
            expect(restoreStatus(v)).toBe("closed");
        }
    });
});

describe("canSuspendCampaign", () => {
    it("allows only live and closed campaigns", () => {
        expect(canSuspendCampaign("live")).toBe(true);
        expect(canSuspendCampaign("closed")).toBe(true);
        expect(canSuspendCampaign("draft")).toBe(false);
        expect(canSuspendCampaign("suspended")).toBe(false);
    });
});

describe("campaignSuspensionNotice", () => {
    it("includes the reason for a suspended campaign", () => {
        expect(campaignSuspensionNotice("suspended", "Misleading claims")).toContain("Misleading claims");
    });
    it("handles a missing reason", () => {
        expect(campaignSuspensionNotice("suspended", null)).toMatch(/suspended/i);
    });
    it("returns null for any other status", () => {
        expect(campaignSuspensionNotice("live", "x")).toBeNull();
    });
});

describe("userSuspensionNotice", () => {
    it("explains with the reason", () => {
        expect(userSuspensionNotice(true, "Spam")).toContain("Spam");
    });
    it("is null when not suspended", () => {
        expect(userSuspensionNotice(false, "Spam")).toBeNull();
    });
});

describe("mapModerationError", () => {
    it("maps database codes to messages", () => {
        expect(mapModerationError("42501")).toMatch(/not allowed/i);
        expect(mapModerationError("23514")).toMatch(/cannot|reason/i);
        expect(mapModerationError("P0002")).toMatch(/not found/i);
        expect(mapModerationError(undefined)).toMatch(/could not/i);
    });
});
