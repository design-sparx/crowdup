import {describe, expect, it} from "vitest";
import {parseCampaignForm} from "./form";

function form(entries: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) f.set(k, v);
    return f;
}

const valid = {
    title: "Clean water for schools",
    category: "Community",
    country: "KE",
    goal: "5000.50",
    description: "Taps for six schools.",
    endDate: "",
    story: JSON.stringify({type: "doc", content: [{type: "paragraph", content: [{type: "text", text: "Hi"}]}]}),
};

describe("parseCampaignForm", () => {
    it("parses valid input, converting the goal to minor units", () => {
        const r = parseCampaignForm(form(valid), {now: new Date("2026-01-01")});
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.values).toMatchObject({
            title: "Clean water for schools",
            category: "Community",
            country: "KE",
            goalAmount: 500050,
            endDate: null,
        });
        expect(r.values.story.content).toHaveLength(1);
    });

    it("accepts a future end date and rejects a past one", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const ok = parseCampaignForm(form({...valid, endDate: "2026-03-01"}), {now});
        expect(ok.ok && ok.values.endDate).toBe("2026-03-01T00:00:00.000Z");
        const bad = parseCampaignForm(form({...valid, endDate: "2025-12-31"}), {now});
        expect(!bad.ok && bad.errors.endDate).toBeTruthy();
    });

    it("reports a field error for each invalid field", () => {
        const r = parseCampaignForm(
            form({title: "ab", category: "  ", country: "Kenya", goal: "-5", description: "x".repeat(301), endDate: "garbage", story: "{"}),
            {now: new Date()},
        );
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(Object.keys(r.errors).sort()).toEqual(
            ["category", "country", "description", "endDate", "goal", "story", "title"],
        );
    });

    it("rejects goals that are zero, non-numeric, have more than 2 decimals or are absurdly large", () => {
        for (const goal of ["0", "abc", "", "10.999", "1e9", "99999999999"]) {
            const r = parseCampaignForm(form({...valid, goal}), {now: new Date()});
            expect(r.ok, goal).toBe(false);
        }
    });

    it("sanitises the story so hostile content never reaches storage", () => {
        const story = JSON.stringify({
            type: "doc",
            content: [{type: "script", content: [{type: "text", text: "alert(1)"}]}],
        });
        const r = parseCampaignForm(form({...valid, story}), {now: new Date()});
        expect(r.ok && JSON.stringify(r.values.story)).not.toMatch(/script/);
    });

    it("trims the title", () => {
        const r = parseCampaignForm(form({...valid, title: "  Hello there  "}), {now: new Date()});
        expect(r.ok && r.values.title).toBe("Hello there");
    });

    it("ignores any submitted currency (it comes from the Stripe account)", () => {
        const r = parseCampaignForm(form({...valid, currency: "EUR"}), {now: new Date()});
        expect(r.ok && "currency" in r.values).toBe(false);
    });

});
