import {describe, expect, it} from "vitest";
import {campaignLiveExplanation, goLiveDecision, parsePublishingMode} from "./publishing";

const base = {onboardingComplete: true, mode: "auto", campaignStatus: "draft", ownerSuspended: false} as const;

describe("parsePublishingMode", () => {
    it("defaults to auto", () => {
        expect(parsePublishingMode(undefined)).toBe("auto");
        expect(parsePublishingMode("")).toBe("auto");
    });
    it("accepts auto and approval, ignoring case and spaces", () => {
        expect(parsePublishingMode(" Approval ")).toBe("approval");
        expect(parsePublishingMode("AUTO")).toBe("auto");
    });
    it("rejects unknown values loudly", () => {
        expect(() => parsePublishingMode("manual")).toThrow(/PUBLISHING_MODE/);
    });
});

describe("goLiveDecision", () => {
    it("takes a draft live in auto mode once onboarding is complete", () => {
        expect(goLiveDecision(base)).toBe("go_live");
    });
    it("holds the draft for approval in approval mode", () => {
        expect(goLiveDecision({...base, mode: "approval"})).toBe("await_approval");
    });
    it("does nothing before onboarding completes", () => {
        expect(goLiveDecision({...base, onboardingComplete: false})).toBe("none");
        expect(goLiveDecision({...base, onboardingComplete: false, mode: "approval"})).toBe("none");
    });
    it("only ever acts on drafts", () => {
        for (const campaignStatus of ["live", "closed", "suspended"] as const) {
            expect(goLiveDecision({...base, campaignStatus})).toBe("none");
        }
    });
    it("never publishes for a suspended owner", () => {
        expect(goLiveDecision({...base, ownerSuspended: true})).toBe("none");
    });
});

describe("campaignLiveExplanation", () => {
    it("explains each state", () => {
        expect(campaignLiveExplanation({status: "live", onboarding: "connected", mode: "auto"})).toMatch(/live/i);
        expect(campaignLiveExplanation({status: "draft", onboarding: "not_started", mode: "auto"})).toMatch(/connect/i);
        expect(campaignLiveExplanation({status: "draft", onboarding: "incomplete", mode: "auto"})).toMatch(/finish/i);
        expect(campaignLiveExplanation({status: "draft", onboarding: "connected", mode: "approval"})).toMatch(/approval/i);
        expect(campaignLiveExplanation({status: "draft", onboarding: "connected", mode: "auto"})).toMatch(/automatically/i);
        expect(campaignLiveExplanation({status: "suspended", onboarding: "connected", mode: "auto"})).toMatch(/suspended/i);
        expect(campaignLiveExplanation({status: "closed", onboarding: "connected", mode: "auto"})).toMatch(/closed/i);
    });
});
