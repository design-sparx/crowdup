import {describe, expect, it} from "vitest";
import {buildMeta} from "./buildMeta";

describe("buildMeta", () => {
    it("builds title, description and og tags", () => {
        const tags = buildMeta({title: "Home", description: "Fund it", image: "/a.png"});
        expect(tags).toContainEqual({title: "Home | CrowdUp"});
        expect(tags).toContainEqual({name: "description", content: "Fund it"});
        expect(tags).toContainEqual({property: "og:title", content: "Home | CrowdUp"});
        expect(tags).toContainEqual({property: "og:description", content: "Fund it"});
        expect(tags).toContainEqual({property: "og:image", content: "/a.png"});
    });

    it("omits og:image when no image is given", () => {
        const tags = buildMeta({title: "Home", description: "Fund it"});
        expect(tags.some((t) => "property" in t && t.property === "og:image")).toBe(false);
    });
});
