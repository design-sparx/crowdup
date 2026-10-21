import {describe, expect, it} from "vitest";
import {
    demoBlocksCampaign,
    demoBlocksPasswordChange,
    demoBlocksUserModeration,
    isSeededCampaignId,
} from "./guard";

const demo = {DEMO_MODE: "true"};
const SEEDED = "10000000-0000-4000-8000-000000000003";
const VISITOR = "7b0f3c1e-6a52-4d1b-9a8e-2c1f0d4e5a6b";

describe("demo guard", () => {
    it("recognises seeded campaign ids only", () => {
        expect(isSeededCampaignId(SEEDED)).toBe(true);
        expect(isSeededCampaignId(VISITOR)).toBe(false);
        expect(isSeededCampaignId(null)).toBe(false);
    });

    it("blocks password changes and user moderation only in demo mode", () => {
        expect(demoBlocksPasswordChange(demo)).toBe(true);
        expect(demoBlocksUserModeration(demo)).toBe(true);
        expect(demoBlocksPasswordChange({})).toBe(false);
        expect(demoBlocksUserModeration({})).toBe(false);
    });

    it("protects seeded campaigns but not visitor-created ones, and nothing outside demo mode", () => {
        expect(demoBlocksCampaign(demo, SEEDED)).toBe(true);
        expect(demoBlocksCampaign(demo, VISITOR)).toBe(false);
        expect(demoBlocksCampaign({}, SEEDED)).toBe(false);
    });
});
