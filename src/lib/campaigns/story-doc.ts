/**
 * The campaign story document and its empty value. Kept free of server-only imports so the browser
 * story editor can use them. The server renderer lives in `story.ts`, which re-exports these.
 */
export type StoryDoc = {type: "doc"; content: unknown[]};

export const EMPTY_STORY: StoryDoc = {type: "doc", content: []};
