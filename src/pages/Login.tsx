import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button, Divider,
} from '@mantine/core';
import {IconBrandFacebook, IconBrandGoogle} from "@tabler/icons-react";

const LoginPage = () => {
    return (
        <>
            <title>Login</title>
            <Container size={420} my={40}>
                <Title
                    ta="center"
                    style={{fontWeight: 900 }}
                >
                    Welcome back!
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Do not have an account yet?{' '}
                    <Anchor size="sm" component="button">
                        Create account
                    </Anchor>
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <Group grow mb="md" mt="md">
                        <Button radius="xl" leftSection={<IconBrandFacebook size={18}/>}>Facebook</Button>
                        <Button radius="xl" leftSection={<IconBrandGoogle size={18}/>}>Google</Button>
                    </Group>
                    <Divider label="Or continue with email" labelPosition="center" my="lg" />
                    <TextInput label="Email" placeholder="you@mantine.dev" required />
                    <PasswordInput label="Password" placeholder="Your password" required mt="md" />
                    <Group justify="space-between" mt="lg">
                        <Checkbox label="Remember me" />
                        <Anchor component="button" size="sm">
                            Forgot password?
                        </Anchor>
                    </Group>
                    <Button fullWidth mt="xl">
                        Sign in
                    </Button>
                </Paper>
            </Container>
        </>
    );
}

export default LoginPage;
