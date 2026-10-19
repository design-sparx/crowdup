import {useState} from "react";
import {Form, useActionData, useNavigation} from "react-router";
import {IconLock} from "@tabler/icons-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {presetOptions, selectedPreset} from "@/lib/donations/panel";
import {MAX_EMAIL, MAX_MESSAGE, MAX_NAME} from "@/lib/donations/donor";
import {cn} from "@/lib/utils";

interface DonatePanelProps {
    currency: string;
    acceptingDonations: boolean;
    /** Shown above the form, e.g. after returning from a cancelled payment. */
    notice?: string | null;
}

export function DonatePanel({currency, acceptingDonations, notice = null}: DonatePanelProps) {
    const actionData = useActionData() as {error?: string} | undefined;
    const navigation = useNavigation();
    const submitting = navigation.state !== "idle" && navigation.formData?.get("intent") === "donate";
    const presets = presetOptions(currency);
    const [amount, setAmount] = useState(presets[1]?.value ?? "");
    const active = selectedPreset(amount, currency);

    if (!acceptingDonations) {
        return (
            <Alert>
                <AlertDescription>This campaign is not accepting donations.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Form method="post" className="space-y-5" aria-label="Donate">
            <input type="hidden" name="intent" value="donate"/>
            {notice ? (
                <Alert role="status">
                    <AlertDescription>{notice}</AlertDescription>
                </Alert>
            ) : null}
            <FieldGroup>
                <div role="group" aria-label="Preset amounts" className="grid grid-cols-4 gap-2">
                    {presets.map((preset) => (
                        <Button
                            key={preset.value}
                            type="button"
                            variant={active === preset.value ? "default" : "outline"}
                            aria-pressed={active === preset.value}
                            onClick={() => setAmount(preset.value)}
                            className={cn("px-0")}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
                <Field>
                    <FieldLabel htmlFor="donation-amount">Amount ({currency})</FieldLabel>
                    <Input
                        id="donation-amount"
                        name="amount"
                        inputMode="decimal"
                        required
                        autoComplete="off"
                        value={amount}
                        onChange={(event) => setAmount(event.currentTarget.value)}
                    />
                    <FieldDescription>Or type your own amount.</FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-name">Your name (optional)</FieldLabel>
                    <Input id="donation-name" name="name" maxLength={MAX_NAME} autoComplete="name"/>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-email">Email for your receipt (optional)</FieldLabel>
                    <Input id="donation-email" name="email" type="email" maxLength={MAX_EMAIL} autoComplete="email"/>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-message">Message (optional)</FieldLabel>
                    <Textarea id="donation-message" name="message" rows={3} maxLength={MAX_MESSAGE}/>
                </Field>
                <Field orientation="horizontal">
                    <Checkbox id="donation-anonymous" name="anonymous"/>
                    <FieldLabel htmlFor="donation-anonymous">Don&apos;t show my name publicly</FieldLabel>
                </Field>
            </FieldGroup>
            {actionData?.error ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Redirecting to payment..." : "Donate now"}
            </Button>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <IconLock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true"/>
                You will be sent to Stripe to pay securely. Your payment goes directly to the organiser.
            </p>
        </Form>
    );
}