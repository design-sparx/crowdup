import {describe, expect, it} from "vitest";
import {EMPTY_STORY, renderStoryHtml, sanitizeStory} from "./story";

const doc = (...content: unknown[]) => ({type: "doc", content});
const p = (...content: unknown[]) => ({type: "paragraph", content});
const text = (t: string, marks?: unknown[]) => ({type: "text", text: t, ...(marks ? {marks} : {})});

describe("renderStoryHtml: allowed content", () => {
    it("renders formatting, headings, lists and links", () => {
        const html = renderStoryHtml(
            doc(
                {type: "heading", attrs: {level: 2}, content: [text("Why")]},
                p(text("Hello "), text("world", [{type: "bold"}]), text(" "), text("site", [
                    {type: "link", attrs: {href: "https://example.com/a?b=1"}},
                ])),
                {type: "bulletList", content: [{type: "listItem", content: [p(text("one"))]}]},
            ),
        );
        expect(html).toContain("<h2>Why</h2>");
        expect(html).toContain("<strong>world</strong>");
        expect(html).toContain('href="https://example.com/a?b=1"');
        expect(html).toContain("<li><p>one</p></li>");
    });

    it("adds rel=noopener noreferrer to links", () => {
        const html = renderStoryHtml(doc(p(text("x", [{type: "link", attrs: {href: "https://example.com"}}]))));
        expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
    });

    it("renders an empty or missing story as an empty string", () => {
        expect(renderStoryHtml(EMPTY_STORY)).toBe("");
        expect(renderStoryHtml(null)).toBe("");
        expect(renderStoryHtml("not a doc")).toBe("");
    });
});

describe("renderStoryHtml: hostile input", () => {
    it("escapes script text instead of emitting a tag", () => {
        const html = renderStoryHtml(doc(p(text("<script>alert(1)</script>"))));
        expect(html).not.toContain("<script");
        expect(html).toContain("&lt;script&gt;");
    });

    it("drops unknown node types such as script and iframe nodes", () => {
        const html = renderStoryHtml(
            doc(
                {type: "script", content: [text("alert(1)")]},
                {type: "iframe", attrs: {src: "https://evil.example"}},
                p(text("kept")),
            ),
        );
        expect(html).not.toMatch(/<script|<iframe|evil\.example/);
        expect(html).toContain("<p>kept</p>");
    });

    it("drops unknown marks", () => {
        const html = renderStoryHtml(doc(p(text("x", [{type: "onclick", attrs: {js: "alert(1)"}}]))));
        expect(html).toBe("<p>x</p>");
    });

    it("never emits event handler attributes", () => {
        const html = renderStoryHtml(
            doc(
                {type: "paragraph", attrs: {onerror: "alert(1)", onclick: "alert(1)"}, content: [text("x")]},
                {type: "image", attrs: {src: "x", onerror: "alert(1)"}},
            ),
        );
        expect(html).not.toMatch(/onerror|onclick|<img/i);
    });

    it("removes javascript: and other unsafe link protocols", () => {
        for (const href of [
            "javascript:alert(1)",
            "JaVaScRiPt:alert(1)",
            " javascript:alert(1)",
            "java\nscript:alert(1)",
            "data:text/html,<script>alert(1)</script>",
            "vbscript:msgbox(1)",
        ]) {
            const html = renderStoryHtml(doc(p(text("click", [{type: "link", attrs: {href}}]))));
            expect(html, href).not.toMatch(/href=|javascript|data:|vbscript/i);
            expect(html, href).toContain("click");
        }
    });

    it("cannot break out of attributes through the link href or text-align", () => {
        const html = renderStoryHtml(
            doc(
                p(text("a", [{type: "link", attrs: {href: 'https://x.example/" onmouseover="alert(1)'}}])),
                {type: "paragraph", attrs: {textAlign: 'left" onmouseover="alert(1)'}, content: [text("b")]},
                {type: "paragraph", attrs: {textAlign: "left; background:url(javascript:alert(1))"}, content: [text("c")]},
            ),
        );
        expect(html).not.toMatch(/\sonmouseover=|url\(/i);
    });

    it("never throws on malformed documents", () => {
        for (const bad of [
            {type: "doc", content: "oops"},
            {type: "doc", content: [null, 1, "x", []]},
            {type: "paragraph"},
            {type: "doc", content: [{type: "heading", attrs: {level: 99}, content: [text("x")]}]},
            {type: "doc", content: [{type: "text"}]},
            undefined,
        ]) {
            expect(() => renderStoryHtml(bad)).not.toThrow();
        }
    });
});

describe("sanitizeStory (applied before storing)", () => {
    it("keeps allowed content unchanged", () => {
        const input = doc(p(text("hi", [{type: "bold"}])));
        expect(sanitizeStory(input)).toEqual(input);
    });

    it("strips unknown nodes, marks, attributes and unsafe hrefs", () => {
        const out = sanitizeStory(
            doc(
                {type: "script", content: [text("alert(1)")]},
                {type: "paragraph", attrs: {onclick: "x"}, content: [
                    text("a", [{type: "link", attrs: {href: "javascript:alert(1)", onclick: "x"}}]),
                    text("b", [{type: "evil"}]),
                ]},
            ),
        );
        expect(JSON.stringify(out)).not.toMatch(/script|onclick|javascript|evil/);
    });

    it("returns the empty story for anything that is not a doc", () => {
        expect(sanitizeStory("x")).toEqual(EMPTY_STORY);
        expect(sanitizeStory(null)).toEqual(EMPTY_STORY);
        expect(sanitizeStory({type: "paragraph"})).toEqual(EMPTY_STORY);
    });

    it("rejects stories over the size limit", () => {
        const big = doc(...Array.from({length: 5000}, () => p(text("x".repeat(100)))));
        expect(sanitizeStory(big)).toEqual(EMPTY_STORY);
    });
});
