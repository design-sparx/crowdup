import {describe, expect, it} from "vitest";
import {nextStep} from "./next-step";

const draft = {id: "d", slug: "d", title: "D", status: "draft", currency: null, goalAmount: 1000};
const live = {id: "l", slug: "clean-water", title: "L", status: "live", currency: "GBP", goalAmount: 1000};

describe("nextStep", () => {
    it("asks an organiser with no Stripe account to connect Stripe first", () => {
        expect(nextStep({stripeStatus: "not_started", campaigns: []})).toEqual({kind: "connect_stripe"});
    });
    it("asks an unfinished Stripe setup to finish it", () => {
        expect(nextStep({stripeStatus: "incomplete", campaigns: [draft]})).toEqual({kind: "connect_stripe"});
    });
    it("asks a connected organiser with a draft to publish it", () => {
        expect(nextStep({stripeStatus: "connected", campaigns: [draft]})).toEqual({kind: "publish", campaignId: "d"});
    });
    it("asks a connected organiser with a live campaign to share it", () => {
        expect(nextStep({stripeStatus: "connected", campaigns: [live]})).toEqual({kind: "share", slug: "clean-water"});
    });
    it("prefers sharing a live campaign over publishing a draft", () => {
        expect(nextStep({stripeStatus: "connected", campaigns: [draft, live]})).toEqual({kind: "share", slug: "clean-water"});
    });
    it("has no step for a connected organiser with nothing to do", () => {
        expect(nextStep({stripeStatus: "connected", campaigns: []})).toEqual({kind: "none"});
    });
});
