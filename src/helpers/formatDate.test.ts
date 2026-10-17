import {describe, expect, it} from "vitest";
import {formatDate} from "./formatDate";

describe("formatDate", () => {
    it("formats as day, short month, year", () => {
        expect(formatDate("2026-03-05T10:00:00Z")).toBe("5 Mar 2026");
        expect(formatDate("2026-09-01T10:00:00Z")).toBe("1 Sep 2026");
    });
    // The server renders in UTC and the browser in the visitor's timezone; the text must match
    // or React reports a hydration mismatch. The test runner is run in two timezones in CI-style
    // checks (TZ=Pacific/Auckland and TZ=America/Los_Angeles) to prove it.
    it("uses the UTC calendar day, not the local one", () => {
        expect(formatDate("2026-03-05T23:30:00Z")).toBe("5 Mar 2026");
        expect(formatDate("2026-03-06T00:30:00Z")).toBe("6 Mar 2026");
    });
});
