import {describe, expect, it} from "vitest";
import {
    CAMPAIGN_STATUSES,
    canTransition,
    parseRejectionReason,
    statusLabel,
    type CampaignActor,
    type CampaignStatus,
} from "./transitions";

const allowed = (actor: CampaignActor) =>
    CAMPAIGN_STATUSES.flatMap((from) =>
        CAMPAIGN_STATUSES.filter((to) => from !== to && canTransition(actor, from, to)).map((to) => `${from}>${to}`),
    ).sort();

describe("canTransition", () => {
    it("lets owners only close live campaigns and reopen rejected ones as drafts", () => {
        expect(allowed("owner")).toEqual(["live>closed", "rejected>draft"]);
    });
    it("never lets an owner reach live, pending_approval or suspended", () => {
        for (const from of CAMPAIGN_STATUSES) {
            for (const to of ["live", "pending_approval", "suspended", "rejected"] as CampaignStatus[]) {
                if (from !== to) expect(canTransition("owner", from, to)).toBe(false);
            }
        }
    });
    it("lets the server submit a draft and decide on a pending campaign", () => {
        expect(canTransition("server", "draft", "pending_approval")).toBe(true);
        expect(canTransition("server", "pending_approval", "live")).toBe(true);
        expect(canTransition("server", "pending_approval", "rejected")).toBe(true);
        expect(canTransition("server", "draft", "live")).toBe(true);
    });
    it("only enters pending_approval from draft and rejected from pending_approval", () => {
        for (const from of CAMPAIGN_STATUSES.filter((s) => s !== "draft" && s !== "pending_approval")) {
            expect(canTransition("server", from, "pending_approval")).toBe(false);
        }
        for (const from of CAMPAIGN_STATUSES.filter((s) => s !== "pending_approval" && s !== "rejected")) {
            expect(canTransition("server", from, "rejected")).toBe(false);
        }
    });
    it("treats staying in the same status as allowed", () => {
        expect(canTransition("owner", "pending_approval", "pending_approval")).toBe(true);
    });
    it("rejects unknown statuses", () => {
        expect(canTransition("server", "draft", "bogus")).toBe(false);
    });
});

describe("statusLabel", () => {
    it("labels the new statuses", () => {
        expect(statusLabel("pending_approval")).toBe("Pending approval");
        expect(statusLabel("rejected")).toBe("Rejected");
        expect(statusLabel("weird")).toBe("weird");
    });
});

describe("parseRejectionReason", () => {
    it("requires a reason and trims it", () => {
        expect(parseRejectionReason("  Not enough detail  ")).toEqual({ok: true, reason: "Not enough detail"});
        expect(parseRejectionReason("")).toMatchObject({ok: false});
        expect(parseRejectionReason("  ab ")).toMatchObject({ok: false});
        expect(parseRejectionReason(null)).toMatchObject({ok: false});
        expect(parseRejectionReason("x".repeat(1001))).toMatchObject({ok: false});
        expect(parseRejectionReason("x".repeat(1000))).toMatchObject({ok: true});
    });
});
