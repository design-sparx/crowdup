import {Form, Link} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {AuthLayout} from "@/features/auth/auth-layout";
import {GoogleButton} from "@/features/auth/google-button";
import {PasswordField} from "@/features/auth/password-field";
import {SignupConsent} from "@/features/auth/signup-consent";

interface SignupPageProps {
    next: string;
    googleEnabled: boolean;
    error?: string;
    message?: string;
}

export function SignupPage({next, googleEnabled, error, message}: SignupPageProps) {
    return (
        <AuthLayout
            title="Create your account"
            description={
                <>
                    Already have an account?{" "}
                    <Link to={`/login?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
                        Log in
                    </Link>
                </>
            }
        >
            {error ? (
                <Alert variant="destructive" role="alert" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}
            {message ? (
                <Alert role="status" className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            ) : null}
            <Form method="post" aria-label="Sign up" className="space-y-5">
                <input type="hidden" name="next" value={next}/>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                        <Input id="signup-name" name="name" autoComplete="name"/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                        <Input id="signup-email" name="email" type="email" autoComplete="email" required/>
                    </Field>
                    <PasswordField name="password" label="Password" autoComplete="new-password"/>
                </FieldGroup>
                <SignupConsent/>
                <Button type="submit" className="w-full">Sign up</Button>
                {googleEnabled ? <GoogleButton/> : null}
            </Form>
        </AuthLayout>
    );
}
