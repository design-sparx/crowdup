import {Form, Link} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {AuthLayout} from "@/features/auth/auth-layout";
import {GoogleButton} from "@/features/auth/google-button";
import {PasswordField} from "@/features/auth/password-field";

interface LoginPageProps {
    next: string;
    googleEnabled: boolean;
    error?: string;
}

export function LoginPage({next, googleEnabled, error}: LoginPageProps) {
    return (
        <AuthLayout
            title="Log in"
            description={
                <>
                    No account yet?{" "}
                    <Link to={`/signup?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">
                        Create an account
                    </Link>
                </>
            }
        >
            {error ? (
                <Alert variant="destructive" role="alert" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}
            <Form method="post" aria-label="Log in" className="space-y-5">
                <input type="hidden" name="next" value={next}/>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="login-email">Email</FieldLabel>
                        <Input id="login-email" name="email" type="email" autoComplete="email" required/>
                    </Field>
                    <PasswordField name="password" label="Password" autoComplete="current-password"/>
                </FieldGroup>
                <Button type="submit" className="w-full">Sign in</Button>
                {googleEnabled ? <GoogleButton/> : null}
            </Form>
            <p className="mt-4 text-sm">
                <Link to="/forgot-password" className="underline underline-offset-4">Forgot password?</Link>
            </p>
        </AuthLayout>
    );
}
