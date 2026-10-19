import {StoryContent} from "@/features/donate/story-content";

interface PreviewStepProps {
    title: string;
    description: string;
    /** Rendered on the server by the preview action, with the same renderer the published page uses. */
    storyHtml: string;
}

/** Last step: how the campaign will look. Nothing here is saved; the story comes from the server render. */
export function PreviewStep({title, description, storyHtml}: PreviewStepProps) {
    return (
        <article className="space-y-4 rounded-xl border p-6">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {description ? <p className="text-muted-foreground">{description}</p> : null}
            {storyHtml ? <StoryContent html={storyHtml}/> : <p className="text-sm text-muted-foreground">No story yet.</p>}
        </article>
    );
}
