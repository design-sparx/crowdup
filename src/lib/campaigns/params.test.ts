import {describe, expect, it} from "vitest";
import {buildKeywordFilter, parseCampaignSearch} from "./params";

describe("parseCampaignSearch", () => {
    it("returns defaults for an empty query string", () => {
        expect(parseCampaignSearch(new URLSearchParams())).toEqual({page: 1});
    });

    it("reads and trims keyword and category", () => {
        const p = new URLSearchParams("q=%20water%20&category=Community");
        expect(parseCampaignSearch(p)).toEqual({q: "water", category: "Community", page: 1});
    });

    it("upper-cases a valid country code and drops invalid ones", () => {
        expect(parseCampaignSearch(new URLSearchParams("country=ke")).country).toBe("KE");
        expect(parseCampaignSearch(new URLSearchParams("country=Kenya")).country).toBeUndefined();
    });

    it("treats blank values as absent", () => {
        expect(parseCampaignSearch(new URLSearchParams("q=%20&category="))).toEqual({page: 1});
    });

    it("falls back to page 1 for invalid pages", () => {
        for (const v of ["0", "-3", "abc", "1.5"]) {
            expect(parseCampaignSearch(new URLSearchParams(`page=${v}`)).page).toBe(1);
        }
        expect(parseCampaignSearch(new URLSearchParams("page=4")).page).toBe(4);
    });

    it("caps keyword length", () => {
        const long = "a".repeat(500);
        expect(parseCampaignSearch(new URLSearchParams(`q=${long}`)).q).toHaveLength(100);
    });
});

describe("buildKeywordFilter", () => {
    it("matches title or description case-insensitively", () => {
        expect(buildKeywordFilter("water")).toBe("title.ilike.*water*,description.ilike.*water*");
    });

    it("neutralises characters that would break the filter grammar", () => {
        expect(buildKeywordFilter('a,b(c)%_*\\"d')).toBe(
            "title.ilike.*a b c d*,description.ilike.*a b c d*",
        );
    });
});
