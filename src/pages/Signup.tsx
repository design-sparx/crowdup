import {
    Alert,
    Anchor,
    Button,
    Container,
    Divider,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconBrandGoogle} from "@tabler/icons-react";
import {Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams} from "react-router";
import type {AuthActionResult} from "../data-access/auth";

const SignupPage = () => {
    const {googleEnabled} = useLoaderData<{googleEnabled: boolean}>();
    const result = useActionData<AuthActionResult>();
    const next = useSearchParams()[0].get("next") ?? "";
    const busy = useNavigation().state !== "idle";

    return (
        <>
            <title>Signup</title>
            <Container size={420} my={40}>
                <Title ta="center" style={{fontWeight: 900}}>
                    Create your account
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Already have an account?{' '}
                    <Anchor size="sm" component={Link} to="/login">
                        Login
                    </Anchor>
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    {googleEnabled && (
                        <>
                            <Form method="post">
                                <input type="hidden" name="next" value={next}/>
                                <Button type="submit" name="intent" value="google" fullWidth radius="xl"
                                        leftSection={<IconBrandGoogle size={18}/>}>
                                    Continue with Google
                                </Button>
                            </Form>
                            <Divider label="Or continue with email" labelPosition="center" my="lg"/>
                        </>
                    )}
                    {result?.error && <Alert color="red" mb="md">{result.error}</Alert>}
                    {result?.message && <Alert color="green" mb="md">{result.message}</Alert>}
                    <Form method="post">
                        <input type="hidden" name="next" value={next}/>
                        <TextInput label="Name" name="name" autoComplete="name" required/>
                        <TextInput label="Email" name="email" type="email" autoComplete="email" required mt="md"/>
                        <PasswordInput label="Password" name="password" autoComplete="new-password"
                                       description="At least 8 characters" minLength={8} required mt="md"/>
                        <Button type="submit" name="intent" value="password" fullWidth mt="xl" loading={busy}>
                            Sign up
                        </Button>
                    </Form>
                </Paper>
            </Container>
        </>
    );
}

export default SignupPage;
