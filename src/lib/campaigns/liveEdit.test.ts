import {describe, expect, it} from "vitest";
import {liveEditPlan, type EditableContent} from "./liveEdit";

const base: EditableContent = {
    title: "Clean water",
    category: "Community",
    country: "KE",
    description: "Taps for six schools.",
    story: {type: "doc", content: [{type: "paragraph", content: [{type: "text", text: "Hi"}]}]},
    coverImageUrl: "https://x/c.png",
};

describe("liveEditPlan", () => {
    it("does not need review when only the goal or end date changed", () => {
        expect(liveEditPlan(base, {...base}, "approval")).toEqual({contentChanged: false, nextStatus: "live"});
    });
    it("sends changed content back to review in approval mode", () => {
        for (const change of [
            {title: "Other"},
            {category: "Health"},
            {country: "UG"},
            {description: "New"},
            {coverImageUrl: "https://x/d.png"},
            {story: {type: "doc", content: []}},
        ] as Partial<EditableContent>[]) {
            expect(liveEditPlan(base, {...base, ...change}, "approval"), JSON.stringify(change)).toEqual({
                contentChanged: true,
                nextStatus: "pending_approval",
            });
        }
    });
    it("keeps the campaign live in auto mode", () => {
        expect(liveEditPlan(base, {...base, title: "Other"}, "auto")).toEqual({contentChanged: true, nextStatus: "live"});
    });
    it("ignores story key order (the database stores jsonb, which reorders keys)", () => {
        const reordered = {content: [{content: [{text: "Hi", type: "text"}], type: "paragraph"}], type: "doc"};
        expect(liveEditPlan(base, {...base, story: reordered}, "approval").contentChanged).toBe(false);
    });
    it("treats an unchanged cover as no change when no new file was uploaded", () => {
        expect(liveEditPlan(base, {...base, coverImageUrl: undefined}, "approval").contentChanged).toBe(false);
    });
});
