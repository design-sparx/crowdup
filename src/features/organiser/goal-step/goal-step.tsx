import {useId} from "react";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

interface GoalStepProps {
    errors: Record<string, string | undefined>;
    defaults: {goal?: string; endDate?: string};
    /** The campaign's currency, from the organiser's Stripe account. Null until Stripe is connected. */
    currency: string | null;
}

/**
 * Third step: the funding goal and an optional end date. The currency is read-only and is not
 * posted; the server takes it from the organiser's Stripe account and parses the goal in it.
 */
export function GoalStep({errors, defaults, currency}: GoalStepProps) {
    const ids = {goal: useId(), currency: useId(), endDate: useId()};
    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor={ids.goal}>Goal amount</FieldLabel>
                <Input
                    id={ids.goal}
                    name="goal"
                    inputMode="decimal"
                    defaultValue={defaults.goal}
                    required
                    aria-invalid={errors.goal ? true : undefined}
                />
                {errors.goal ? <FieldError>{errors.goal}</FieldError> : null}
            </Field>
            <Field>
                <FieldLabel htmlFor={ids.currency}>Currency</FieldLabel>
                <Input
                    id={ids.currency}
                    value={currency ?? "Set when you connect Stripe"}
                    disabled
                    readOnly
                />
                <FieldDescription>Set by your Stripe account. Donations arrive in this currency.</FieldDescription>
            </Field>
            <Field>
                <FieldLabel htmlFor={ids.endDate}>End date</FieldLabel>
                <FieldDescription>Optional. Leave empty for an open-ended campaign.</FieldDescription>
                <Input
                    id={ids.endDate}
                    name="endDate"
                    type="date"
                    defaultValue={defaults.endDate}
                    aria-invalid={errors.endDate ? true : undefined}
                />
                {errors.endDate ? <FieldError>{errors.endDate}</FieldError> : null}
            </Field>
        </FieldGroup>
    );
}
