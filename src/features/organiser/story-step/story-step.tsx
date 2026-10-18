import {CoverUpload} from "@/features/organiser/cover-upload";
import {StoryEditor} from "@/features/organiser/story-editor";
import type {StoryDoc} from "@/lib/campaigns/story";

interface StoryStepProps {
    errors: Record<string, string | undefined>;
    defaults: {story?: StoryDoc; coverUrl?: string};
}

/** Second step: the story (rich text) and an optional cover image. Both post into the one campaign form. */
export function StoryStep({errors, defaults}: StoryStepProps) {
    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h2 className="text-lg font-semibold">Story</h2>
                <StoryEditor name="story" defaultValue={defaults.story} error={errors.story}/>
            </section>
            <section className="space-y-2">
                <h2 className="text-lg font-semibold">Cover image</h2>
                <CoverUpload name="cover" defaultUrl={defaults.coverUrl} error={errors.cover}/>
            </section>
        </div>
    );
}
