import {describe, expect, it} from "vitest";
import {buildBrowseHref, hasActiveFilters, pageCount} from "./browse";

describe("buildBrowseHref", () => {
    it("is the bare list path for page 1 with no filters", () => {
        expect(buildBrowseHref({page: 1}, 1)).toBe("/campaigns");
    });
    it("keeps the keyword and adds the page", () => {
        expect(buildBrowseHref({q: "kitchen", page: 1}, 2)).toBe("/campaigns?q=kitchen&page=2");
    });
    it("keeps every active filter and encodes them", () => {
        expect(buildBrowseHref({q: "a b", category: "Food", country: "GB", page: 3}, 3)).toBe(
            "/campaigns?q=a+b&category=Food&country=GB&page=3",
        );
    });
    it("drops the page parameter when linking to page 1", () => {
        expect(buildBrowseHref({category: "Food", page: 4}, 1)).toBe("/campaigns?category=Food");
    });
});

describe("pageCount", () => {
    it("is at least 1, even with no results", () => {
        expect(pageCount(0, 12)).toBe(1);
    });
    it("rounds up", () => {
        expect(pageCount(12, 12)).toBe(1);
        expect(pageCount(13, 12)).toBe(2);
    });
});

describe("hasActiveFilters", () => {
    it("is true for a keyword, category or country, false otherwise", () => {
        expect(hasActiveFilters({page: 1})).toBe(false);
        expect(hasActiveFilters({page: 2})).toBe(false);
        expect(hasActiveFilters({q: "x", page: 1})).toBe(true);
        expect(hasActiveFilters({category: "Food", page: 1})).toBe(true);
        expect(hasActiveFilters({country: "GB", page: 1})).toBe(true);
    });
});
