import {generateHTML} from "@tiptap/html/server";
import {storyExtensions} from "./storyExtensions";

export type StoryDoc = {type: "doc"; content: unknown[]};

export const EMPTY_STORY: StoryDoc = {type: "doc", content: []};

/** Serialised size cap for a stored story. */
export const MAX_STORY_BYTES = 200_000;

type Json = Record<string, unknown>;

const NODES = new Set([
    "paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote",
    "horizontalRule", "hardBreak", "codeBlock", "text",
]);
const MARKS = new Set([
    "bold", "italic", "underline", "strike", "code", "highlight", "superscript", "subscript", "link",
]);
const ALIGNMENTS = new Set(["left", "center", "right", "justify"]);
const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

function safeHref(value: unknown): string | null {
    if (typeof value !== "string" || value.length > 2048) return null;
    try {
        const url = new URL(value.trim());
        return LINK_PROTOCOLS.has(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function cleanMark(raw: unknown): Json | null {
    if (!isObject(raw) || typeof raw.type !== "string" || !MARKS.has(raw.type)) return null;
    if (raw.type !== "link") return {type: raw.type};
    const href = safeHref(isObject(raw.attrs) ? raw.attrs.href : undefined);
    return href ? {type: "link", attrs: {href}} : null;
}

function cleanAttrs(type: string, raw: unknown): Json | undefined {
    const attrs = isObject(raw) ? raw : {};
    const out: Json = {};
    if (type === "heading") {
        const level = Number(attrs.level);
        out.level = Number.isInteger(level) && level >= 1 && level <= 4 ? level : 2;
    }
    if (type === "paragraph" || type === "heading") {
        if (typeof attrs.textAlign === "string" && ALIGNMENTS.has(attrs.textAlign)) {
            out.textAlign = attrs.textAlign;
        }
    }
    if (type === "orderedList") {
        const start = Number(attrs.start);
        if (Number.isInteger(start) && start >= 1 && start <= 9999) out.start = start;
    }
    return Object.keys(out).length ? out : undefined;
}

function cleanNode(raw: unknown, depth: number): Json | null {
    if (depth > 20 || !isObject(raw) || typeof raw.type !== "string" || !NODES.has(raw.type)) return null;
    const type = raw.type;

    if (type === "text") {
        if (typeof raw.text !== "string" || raw.text === "") return null;
        const marks = (Array.isArray(raw.marks) ? raw.marks : [])
            .map(cleanMark)
            .filter((m): m is Json => m !== null);
        return marks.length ? {type, text: raw.text, marks} : {type, text: raw.text};
    }

    const node: Json = {type};
    const attrs = cleanAttrs(type, raw.attrs);
    if (attrs) node.attrs = attrs;
    if (Array.isArray(raw.content) && type !== "horizontalRule" && type !== "hardBreak") {
        node.content = raw.content
            .map((child) => cleanNode(child, depth + 1))
            .filter((c): c is Json => c !== null);
    }
    return node;
}

/**
 * Copies a story keeping only allowed node types, marks and attributes, and only
 * http(s)/mailto links. Anything else is dropped. Returns the empty story for non-docs and
 * for stories over MAX_STORY_BYTES. Apply before storing and before rendering.
 */
export function sanitizeStory(input: unknown): StoryDoc {
    if (!isObject(input) || input.type !== "doc" || !Array.isArray(input.content)) return EMPTY_STORY;
    if (JSON.stringify(input).length > MAX_STORY_BYTES) return EMPTY_STORY;
    const content = input.content
        .map((n) => cleanNode(n, 0))
        .filter((n): n is Json => n !== null);
    return {type: "doc", content};
}

/** Renders a stored story to HTML on the server. Safe to inject as HTML. */
export function renderStoryHtml(input: unknown): string {
    const story = sanitizeStory(input);
    if (story.content.length === 0) return "";
    try {
        return generateHTML(story as Parameters<typeof generateHTML>[0], storyExtensions);
    } catch {
        return "";
    }
}
