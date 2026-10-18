import {describe, expect, it} from "vitest";
import {EMPTY_STORY, type StoryDoc} from "./story-doc";
import {EMPTY_STORY as FROM_SERVER_MODULE} from "./story";

describe("story-doc", () => {
    it("defines an empty Tiptap document", () => {
        const empty: StoryDoc = EMPTY_STORY;
        expect(empty).toEqual({type: "doc", content: []});
    });
    it("is the same constant the server module exports, so there is one definition", () => {
        expect(FROM_SERVER_MODULE).toBe(EMPTY_STORY);
    });
});
