import {describe, expect, it} from "vitest";
import {demoBannerState, isDemoMode, stripeKeyMode} from "./demo";

describe("isDemoMode", () => {
    it("is off by default", () => {
        expect(isDemoMode({})).toBe(false);
        expect(isDemoMode({DEMO_MODE: ""})).toBe(false);
    });
    it("accepts true and 1, case-insensitively and trimmed", () => {
        expect(isDemoMode({DEMO_MODE: "true"})).toBe(true);
        expect(isDemoMode({DEMO_MODE: " TRUE "})).toBe(true);
        expect(isDemoMode({DEMO_MODE: "1"})).toBe(true);
    });
    it("treats anything else as off", () => {
        expect(isDemoMode({DEMO_MODE: "false"})).toBe(false);
        expect(isDemoMode({DEMO_MODE: "yes"})).toBe(false);
    });
});

describe("stripeKeyMode", () => {
    it("detects test, live and unknown keys", () => {
        expect(stripeKeyMode("sk_test_abc")).toBe("test");
        expect(stripeKeyMode(" sk_test_abc ")).toBe("test");
        expect(stripeKeyMode("rk_test_abc")).toBe("test");
        expect(stripeKeyMode("sk_live_abc")).toBe("live");
        expect(stripeKeyMode("rk_live_abc")).toBe("live");
        expect(stripeKeyMode("")).toBe("unknown");
        expect(stripeKeyMode(undefined)).toBe("unknown");
        expect(stripeKeyMode("garbage")).toBe("unknown");
    });
});

describe("demoBannerState", () => {
    it("is hidden when demo mode is off, whatever the key", () => {
        expect(demoBannerState({})).toBe("hidden");
        expect(demoBannerState({STRIPE_SECRET_KEY: "sk_live_x"})).toBe("hidden");
    });
    it("shows the demo banner only with a test key", () => {
        expect(demoBannerState({DEMO_MODE: "true", STRIPE_SECRET_KEY: "sk_test_x"})).toBe("demo");
    });
    it("warns for a live key", () => {
        expect(demoBannerState({DEMO_MODE: "true", STRIPE_SECRET_KEY: "sk_live_x"})).toBe("live-key-warning");
    });
    it("warns when the key is missing or unrecognised", () => {
        expect(demoBannerState({DEMO_MODE: "true"})).toBe("live-key-warning");
        expect(demoBannerState({DEMO_MODE: "true", STRIPE_SECRET_KEY: "nope"})).toBe("live-key-warning");
    });
});
