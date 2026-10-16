import {describe, expect, it} from "vitest";
import {slugify, withSuffix} from "./slug";

describe("slugify", () => {
    it("lowercases and joins words with hyphens", () => {
        expect(slugify("Clean Water For Kibera")).toBe("clean-water-for-kibera");
    });
    it("strips accents and punctuation", () => {
        expect(slugify("Café & Crêpes: école!")).toBe("cafe-crepes-ecole");
    });
    it("collapses repeated separators and trims them", () => {
        expect(slugify("  --Hello___World--  ")).toBe("hello-world");
    });
    it("produces only characters the database check allows", () => {
        expect(slugify("<script>alert(1)</script> 100%")).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
    it("falls back to 'campaign' when nothing usable remains", () => {
        expect(slugify("!!!")).toBe("campaign");
        expect(slugify("日本語")).toBe("campaign");
    });
    it("limits length without leaving a trailing hyphen", () => {
        const slug = slugify("word ".repeat(40));
        expect(slug.length).toBeLessThanOrEqual(60);
        expect(slug.endsWith("-")).toBe(false);
    });
});

describe("withSuffix", () => {
    it("appends the suffix and still matches the allowed pattern", () => {
        const slug = withSuffix(slugify("word ".repeat(40)), "a1b2");
        expect(slug.endsWith("-a1b2")).toBe(true);
        expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
});
