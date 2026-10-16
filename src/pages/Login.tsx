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

const LoginPage = () => {
    const {googleEnabled} = useLoaderData<{googleEnabled: boolean}>();
    const result = useActionData<AuthActionResult>();
    const [params] = useSearchParams();
    const next = params.get("next") ?? "";
    const busy = useNavigation().state !== "idle";

    return (
        <>
            <title>Login</title>
            <Container size={420} my={40}>
                <Title ta="center" style={{fontWeight: 900}}>
                    Welcome back!
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Do not have an account yet?{' '}
                    <Anchor size="sm" component={Link} to="/signup">
                        Create account
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
                    {params.get("error") === "callback" && (
                        <Alert color="red" mb="md">Sign-in link is invalid or expired.</Alert>
                    )}
                    {result?.error && <Alert color="red" mb="md">{result.error}</Alert>}
                    <Form method="post">
                        <input type="hidden" name="next" value={next}/>
                        <TextInput label="Email" name="email" type="email" autoComplete="email" required/>
                        <PasswordInput label="Password" name="password" autoComplete="current-password" required mt="md"/>
                        <Text ta="right" mt="sm">
                            <Anchor component={Link} to="/forgot-password" size="sm">Forgot password?</Anchor>
                        </Text>
                        <Button type="submit" name="intent" value="password" fullWidth mt="xl" loading={busy}>
                            Sign in
                        </Button>
                    </Form>
                </Paper>
            </Container>
        </>
    );
}

export default LoginPage;
