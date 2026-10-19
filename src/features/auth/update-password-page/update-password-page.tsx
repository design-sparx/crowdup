import {Form} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {AuthLayout} from "@/features/auth/auth-layout";
import {PasswordField} from "@/features/auth/password-field";

interface UpdatePasswordPageProps {
    error?: string;
}

export function UpdatePasswordPage({error}: UpdatePasswordPageProps) {
    return (
        <AuthLayout title="Choose a new password">
            {error ? (
                <Alert variant="destructive" role="alert" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}
            <Form method="post" aria-label="Update password" className="space-y-5">
                <PasswordField name="password" label="New password" autoComplete="new-password"/>
                <Button type="submit" className="w-full">Update password</Button>
            </Form>
        </AuthLayout>
    );
}
