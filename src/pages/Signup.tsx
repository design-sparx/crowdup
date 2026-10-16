import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconBrandFacebook, IconBrandGoogle} from "@tabler/icons-react";
import {SignupConsent} from "../components";

const SignupPage = () => {
    return (
        <>
            <title>Signup</title>
            <Container size={420} my={40}>
                <Title
                    ta="center"
                    style={{fontWeight: 900}}
                >
                    Welcome back!
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Already have an account?{' '}
                    <Anchor size="sm" component="button">
                        Login
                    </Anchor>
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <Group grow mb="md" mt="md">
                        <Button radius="xl" leftSection={<IconBrandFacebook size={18}/>}>Facebook</Button>
                        <Button radius="xl" leftSection={<IconBrandGoogle size={18}/>}>Google</Button>
                    </Group>
                    <Divider label="Or continue with email" labelPosition="center" my="lg" />
                    <TextInput label="Name" placeholder="your name" required/>
                    <TextInput label="Email" placeholder="your email" required mt="md"/>
                    <PasswordInput label="Password" placeholder="your password" required mt="md"/>
                    <Group justify="space-between" mt="lg">
                        <Checkbox label="Remember me"/>
                        <Anchor component="button" size="sm">
                            Forgot password?
                        </Anchor>
                    </Group>
                    <SignupConsent/>
                    <Button fullWidth mt="xl">
                        Sign Up
                    </Button>
                </Paper>
            </Container>
        </>
    );
}

export default SignupPage;
