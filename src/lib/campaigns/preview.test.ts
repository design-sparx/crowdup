import {describe, expect, it} from "vitest";
import {renderStoryPreview} from "./preview";

describe("renderStoryPreview", () => {
    it("renders the posted story with the same renderer the campaign page uses", () => {
        const story = JSON.stringify({
            type: "doc",
            content: [{type: "paragraph", content: [{type: "text", text: "Our story"}]}],
        });
        expect(renderStoryPreview(story)).toBe("<p>Our story</p>");
    });
    it("treats a missing or unreadable story as empty", () => {
        expect(renderStoryPreview(undefined)).toBe("");
        expect(renderStoryPreview("{not json")).toBe("");
    });
    it("drops disallowed content, exactly as the published page does", () => {
        const story = JSON.stringify({
            type: "doc",
            content: [{type: "paragraph", content: [{type: "text", text: "x", marks: [{type: "link", attrs: {href: "javascript:alert(1)"}}]}]}],
        });
        expect(renderStoryPreview(story)).not.toContain("javascript:");
    });
});
