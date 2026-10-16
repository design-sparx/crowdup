import {Alert, Anchor, Button, Container, Paper, Text, TextInput, Title} from '@mantine/core';
import {Form, Link, useActionData, useNavigation} from "react-router";
import type {AuthActionResult} from "../data-access/auth";

const ForgotPasswordPage = () => {
    const result = useActionData<AuthActionResult>();
    const busy = useNavigation().state !== "idle";

    return (
        <>
            <title>Reset password</title>
            <Container size={420} my={40}>
                <Title ta="center" style={{fontWeight: 900}}>Forgot your password?</Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Enter your email and we will send you a reset link.
                </Text>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    {result?.message && <Alert color="green" mb="md">{result.message}</Alert>}
                    <Form method="post">
                        <TextInput label="Email" name="email" type="email" autoComplete="email" required/>
                        <Button type="submit" fullWidth mt="xl" loading={busy}>Send reset link</Button>
                    </Form>
                    <Text ta="center" mt="md">
                        <Anchor component={Link} to="/login" size="sm">Back to login</Anchor>
                    </Text>
                </Paper>
            </Container>
        </>
    );
}

export default ForgotPasswordPage;
