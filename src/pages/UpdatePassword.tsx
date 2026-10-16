import {Alert, Button, Container, Paper, PasswordInput, Title} from '@mantine/core';
import {Form, useActionData, useNavigation} from "react-router";
import type {AuthActionResult} from "../data-access/auth";

const UpdatePasswordPage = () => {
    const result = useActionData<AuthActionResult>();
    const busy = useNavigation().state !== "idle";

    return (
        <>
            <title>Choose a new password</title>
            <Container size={420} my={40}>
                <Title ta="center" style={{fontWeight: 900}}>Choose a new password</Title>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    {result?.error && <Alert color="red" mb="md">{result.error}</Alert>}
                    <Form method="post">
                        <PasswordInput label="New password" name="password" autoComplete="new-password"
                                       description="At least 8 characters" minLength={8} required/>
                        <Button type="submit" fullWidth mt="xl" loading={busy}>Update password</Button>
                    </Form>
                </Paper>
            </Container>
        </>
    );
}

export default UpdatePasswordPage;
