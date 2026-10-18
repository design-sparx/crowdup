import {useId} from "react";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {Textarea} from "@/components/ui/textarea";
import {CAMPAIGN_CATEGORIES} from "@/lib/campaigns/wizard";
import countries from "@/data/Countries.json";

interface BasicsStepProps {
    errors: Record<string, string | undefined>;
    defaults: {title?: string; category?: string; country?: string; description?: string};
}

const COUNTRY_OPTIONS = countries.data.map((c) => ({code: c.code, name: c.name}));

/** First step: what the campaign is called, what it is for, and where it runs. Posts into the one campaign form. */
export function BasicsStep({errors, defaults}: BasicsStepProps) {
    const ids = {title: useId(), category: useId(), country: useId(), description: useId()};
    return (
        <FieldGroup>
            <Field data-invalid={errors.title ? true : undefined}>
                <FieldLabel htmlFor={ids.title}>Title</FieldLabel>
                <Input
                    id={ids.title}
                    name="title"
                    defaultValue={defaults.title}
                    required
                    minLength={3}
                    maxLength={140}
                    aria-invalid={errors.title ? true : undefined}
                />
                {errors.title ? <FieldError>{errors.title}</FieldError> : null}
            </Field>
            <Field>
                <FieldLabel htmlFor={ids.category}>Category</FieldLabel>
                <NativeSelect
                    id={ids.category}
                    name="category"
                    defaultValue={defaults.category ?? ""}
                    required
                    aria-invalid={errors.category ? true : undefined}
                >
                    <NativeSelectOption value="" disabled>Choose a category</NativeSelectOption>
                    {CAMPAIGN_CATEGORIES.map((c) => (
                        <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                    ))}
                </NativeSelect>
                {errors.category ? <FieldError>{errors.category}</FieldError> : null}
            </Field>
            <Field>
                <FieldLabel htmlFor={ids.country}>Country</FieldLabel>
                <NativeSelect
                    id={ids.country}
                    name="country"
                    defaultValue={defaults.country ?? ""}
                    required
                    aria-invalid={errors.country ? true : undefined}
                >
                    <NativeSelectOption value="" disabled>Choose a country</NativeSelectOption>
                    {COUNTRY_OPTIONS.map((c) => (
                        <NativeSelectOption key={c.code} value={c.code}>{c.name}</NativeSelectOption>
                    ))}
                </NativeSelect>
                {errors.country ? <FieldError>{errors.country}</FieldError> : null}
            </Field>
            <Field>
                <FieldLabel htmlFor={ids.description}>Summary</FieldLabel>
                <FieldDescription>Shown on cards in the campaign list. Up to 300 characters.</FieldDescription>
                <Textarea
                    id={ids.description}
                    name="description"
                    defaultValue={defaults.description}
                    maxLength={300}
                    aria-invalid={errors.description ? true : undefined}
                />
                {errors.description ? <FieldError>{errors.description}</FieldError> : null}
            </Field>
        </FieldGroup>
    );
}
