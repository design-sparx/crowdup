import {describe, expect, it} from "vitest";
import {createRateLimiter} from "./rateLimit";

describe("createRateLimiter", () => {
    it("allows up to the limit within the window, then blocks", () => {
        const limiter = createRateLimiter({limit: 2, windowMs: 1000, now: () => 0});
        expect(limiter.take("a")).toBe(true);
        expect(limiter.take("a")).toBe(true);
        expect(limiter.take("a")).toBe(false);
    });

    it("tracks keys independently", () => {
        const limiter = createRateLimiter({limit: 1, windowMs: 1000, now: () => 0});
        expect(limiter.take("a")).toBe(true);
        expect(limiter.take("b")).toBe(true);
        expect(limiter.take("a")).toBe(false);
    });

    it("allows again once earlier hits leave the window", () => {
        let now = 0;
        const limiter = createRateLimiter({limit: 1, windowMs: 1000, now: () => now});
        expect(limiter.take("a")).toBe(true);
        now = 999;
        expect(limiter.take("a")).toBe(false);
        now = 1000;
        expect(limiter.take("a")).toBe(true);
    });

    it("does not count blocked attempts against the window", () => {
        let now = 0;
        const limiter = createRateLimiter({limit: 1, windowMs: 1000, now: () => now});
        limiter.take("a");
        now = 900;
        limiter.take("a");
        now = 1000;
        expect(limiter.take("a")).toBe(true);
    });
});
