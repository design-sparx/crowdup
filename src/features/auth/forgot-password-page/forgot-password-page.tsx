import {Form, Link} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {AuthLayout} from "@/features/auth/auth-layout";

interface ForgotPasswordPageProps {
    message?: string;
}

/** After submitting, only the server's neutral message is shown, so the form cannot probe for accounts. */
export function ForgotPasswordPage({message}: ForgotPasswordPageProps) {
    if (message) {
        return (
            <AuthLayout title="Reset your password">
                <Alert role="status">
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
                <p className="mt-4 text-sm">
                    <Link to="/login" className="underline underline-offset-4">Back to log in</Link>
                </p>
            </AuthLayout>
        );
    }
    return (
        <AuthLayout title="Reset your password">
            <Form method="post" aria-label="Reset password" className="space-y-5">
                <Field>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input id="forgot-email" name="email" type="email" autoComplete="email" required/>
                </Field>
                <Button type="submit" className="w-full">Send reset link</Button>
            </Form>
            <p className="mt-4 text-sm">
                <Link to="/login" className="underline underline-offset-4">Back to log in</Link>
            </p>
        </AuthLayout>
    );
}
