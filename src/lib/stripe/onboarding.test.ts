import {describe, expect, it} from "vitest";
import {
    accountCurrency,
    isOnboardingComplete,
    onboardingStatus,
    ONBOARDING_LABELS,
    pickCampaignCurrency,
} from "./onboarding";

const done = {detailsSubmitted: true, chargesEnabled: true, defaultCurrency: "kes"};

describe("isOnboardingComplete", () => {
    it("needs details submitted, charges enabled and a currency", () => {
        expect(isOnboardingComplete(done)).toBe(true);
        expect(isOnboardingComplete({...done, detailsSubmitted: false})).toBe(false);
        expect(isOnboardingComplete({...done, chargesEnabled: false})).toBe(false);
        expect(isOnboardingComplete({...done, defaultCurrency: null})).toBe(false);
    });
});

describe("accountCurrency", () => {
    it("upper-cases a valid ISO code and rejects anything else", () => {
        expect(accountCurrency("kes")).toBe("KES");
        expect(accountCurrency("USD")).toBe("USD");
        expect(accountCurrency("us")).toBeNull();
        expect(accountCurrency("")).toBeNull();
        expect(accountCurrency(null)).toBeNull();
    });
});

describe("onboardingStatus", () => {
    it("is not_started without an account", () => {
        expect(onboardingStatus({accountId: null, complete: false})).toBe("not_started");
    });
    it("is incomplete with an account that has not finished", () => {
        expect(onboardingStatus({accountId: "acct_1", complete: false})).toBe("incomplete");
    });
    it("is connected once complete", () => {
        expect(onboardingStatus({accountId: "acct_1", complete: true})).toBe("connected");
    });
    it("has a label for each status", () => {
        expect(ONBOARDING_LABELS).toEqual({
            not_started: "Not started",
            incomplete: "Incomplete",
            connected: "Connected",
        });
    });
});

describe("pickCampaignCurrency", () => {
    it("returns the account currency only when onboarding is complete", () => {
        expect(pickCampaignCurrency({complete: true, currency: "KES"})).toBe("KES");
        expect(pickCampaignCurrency({complete: false, currency: "KES"})).toBeNull();
        expect(pickCampaignCurrency({complete: true, currency: null})).toBeNull();
    });
});
