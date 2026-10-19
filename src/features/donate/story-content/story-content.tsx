/**
 * The campaign story. `html` is produced and sanitised on the server from an allow-list of
 * Tiptap nodes (src/lib/campaigns/story.ts), so it is safe to inject. Never pass anything else here.
 */
export function StoryContent({html}: {html: string}) {
    if (!html) return null;
    return (
        <div
            className="max-w-none space-y-4 leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6"
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
}