import {describe, expect, it} from "vitest";
import {isNewIdentity} from "./auth.server";

describe("isNewIdentity", () => {
    const now = Date.parse("2026-10-20T12:00:00Z");

    it("is true for an identity created moments ago (this sign-in created the account)", () => {
        expect(isNewIdentity("2026-10-20T11:59:30Z", now)).toBe(true);
        expect(isNewIdentity("2026-10-20T12:00:00Z", now)).toBe(true);
    });

    it("is false for an identity older than five minutes (existing account)", () => {
        expect(isNewIdentity("2026-10-20T11:54:59Z", now)).toBe(false);
        expect(isNewIdentity("2026-10-19T12:00:00Z", now)).toBe(false);
    });

    it("is false for a missing or unparseable timestamp", () => {
        expect(isNewIdentity(undefined, now)).toBe(false);
        expect(isNewIdentity("not-a-date", now)).toBe(false);
    });
});
