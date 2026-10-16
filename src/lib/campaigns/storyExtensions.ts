import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";

/**
 * The only Tiptap extensions a campaign story may use. The editor and the server renderer
 * both import this list, so what can be written is exactly what can be rendered. Keep it in
 * sync with the allowlists in `story.ts` (they are checked by tests with hostile input).
 * StarterKit v3 already bundles Link and Underline.
 */
export const storyExtensions = [
    StarterKit.configure({
        heading: {levels: [1, 2, 3, 4]},
        link: {
            openOnClick: false,
            autolink: false,
            protocols: ["mailto"],
            HTMLAttributes: {rel: "noopener noreferrer nofollow ugc", target: "_blank"},
        },
    }),
    Highlight,
    Superscript,
    Subscript,
    TextAlign.configure({types: ["heading", "paragraph"]}),
];
