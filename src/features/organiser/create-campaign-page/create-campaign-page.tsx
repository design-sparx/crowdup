import {useEffect, useRef, useState} from "react";
import {Form, useFetcher} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {BasicsStep} from "@/features/organiser/basics-step";
import {GoalStep} from "@/features/organiser/goal-step";
import {PreviewStep} from "@/features/organiser/preview-step";
import {StepIndicator} from "@/features/organiser/step-indicator";
import {StoryStep} from "@/features/organiser/story-step";
import {firstStepWithError, WIZARD_STEPS} from "@/lib/campaigns/wizard";
import type {StoryDoc} from "@/lib/campaigns/story-doc";

interface CreateCampaignPageProps {
    /** Campaign currency from the organiser's Stripe account, or null until connected. */
    currency: string | null;
    /** Field errors from the last save; the page opens on the step that holds the first one. */
    errors: Record<string, string | undefined>;
    defaults: {
        title?: string; category?: string; country?: string; description?: string;
        goal?: string; endDate?: string; story?: StoryDoc; coverUrl?: string;
    };
    /** Preview HTML from the server for the story the organiser typed (the initial render has none). */
    storyHtml: string;
    notice: string | null;
}

/**
 * The guided new-campaign form. Every step is a panel inside ONE <Form>, so the final submit posts
 * every field once and the server stays the source of truth. Next and Back only move between panels.
 */
export function CreateCampaignPage({currency, errors, defaults, storyHtml, notice}: CreateCampaignPageProps) {
    const firstError = firstStepWithError(errors);
    const [step, setStep] = useState(firstError ?? 0);
    // A failed save returns new errors to this already-mounted page. When the step holding the first
    // error changes, move to it during render (not in an effect), so the organiser lands on it at once.
    const [seenError, setSeenError] = useState(firstError);
    if (firstError !== seenError) {
        setSeenError(firstError);
        if (firstError !== null) setStep(firstError);
    }
    const preview = useFetcher<{html: string}>();
    const isPreview = WIZARD_STEPS[step].id === "preview";
    const last = WIZARD_STEPS.length - 1;

    const formRef = useRef<HTMLFormElement>(null);
    // What the organiser typed in the basics step, read from the form when the Preview step opens.
    const [typed, setTyped] = useState({title: defaults.title ?? "", description: defaults.description ?? ""});

    // When the Preview step opens, ask the server to render the story exactly as the editor holds it.
    // The story lives in the form's hidden `story` input, so read it from the form, not from state.
    useEffect(() => {
        if (!isPreview || !formRef.current) return;
        const data = new FormData(formRef.current);
        const text = (name: string) => {
            const v = data.get(name);
            return typeof v === "string" ? v : "";
        };
        setTyped({title: text("title"), description: text("description")});
        preview.submit({intent: "preview", story: text("story")}, {method: "post"});
        // Only a step change should trigger a render; the fetcher is stable for the page's lifetime.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPreview]);

    return (
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
            <header className="space-y-4">
                <h1 className="text-3xl font-semibold">Create a campaign</h1>
                <StepIndicator steps={WIZARD_STEPS.map((s) => s.label)} current={step}/>
            </header>
            {notice ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{notice}</AlertDescription>
                </Alert>
            ) : null}
            <Form ref={formRef} method="post" encType="multipart/form-data" aria-label="Create a campaign" className="space-y-8">
                <div hidden={step !== 0}>
                    <BasicsStep
                        errors={errors}
                        defaults={{
                            title: defaults.title, category: defaults.category, country: defaults.country,
                            description: defaults.description,
                        }}
                    />
                </div>
                <div hidden={step !== 1}>
                    <StoryStep errors={errors} defaults={{story: defaults.story, coverUrl: defaults.coverUrl}}/>
                </div>
                <div hidden={step !== 2}>
                    <GoalStep errors={errors} defaults={{goal: defaults.goal, endDate: defaults.endDate}} currency={currency}/>
                </div>
                <div hidden={step !== 3}>
                    <PreviewStep title={typed.title} description={typed.description} storyHtml={preview.data?.html ?? storyHtml}/>
                </div>
                {errors.form ? (
                    <Alert variant="destructive" role="alert">
                        <AlertDescription>{errors.form}</AlertDescription>
                    </Alert>
                ) : null}
                <div className="flex justify-between gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                        Back
                    </Button>
                    {step < last ? (
                        <Button type="button" onClick={() => setStep((s) => Math.min(last, s + 1))}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" name="intent" value="save">
                            Save draft
                        </Button>
                    )}
                </div>
            </Form>
        </div>
    );
}
