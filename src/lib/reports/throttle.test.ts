import {describe, expect, it} from "vitest";
import {createReportThrottle} from "./throttle";

describe("createReportThrottle", () => {
    it("lets a client look up many slugs without spending its report quota", () => {
        const t = createReportThrottle();
        for (let i = 0; i < 10; i++) expect(t.attempt("ip:1")).toBe(true);
        for (let i = 0; i < 5; i++) expect(t.report("ip:1")).toBe(true);
        expect(t.report("ip:1")).toBe(false);
    });
    it("caps lookups too, so random slugs cannot hammer the database", () => {
        const t = createReportThrottle();
        for (let i = 0; i < 30; i++) expect(t.attempt("ip:1"), String(i)).toBe(true);
        expect(t.attempt("ip:1")).toBe(false);
    });
    it("keeps clients apart", () => {
        const t = createReportThrottle();
        for (let i = 0; i < 30; i++) t.attempt("ip:1");
        expect(t.attempt("ip:2")).toBe(true);
    });
    it("frees quota after the window", () => {
        let now = 0;
        const t = createReportThrottle(() => now);
        for (let i = 0; i < 5; i++) t.report("ip:1");
        expect(t.report("ip:1")).toBe(false);
        now = 60 * 60 * 1000 + 1;
        expect(t.report("ip:1")).toBe(true);
    });
});
