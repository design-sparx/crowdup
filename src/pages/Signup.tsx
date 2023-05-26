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
import {Helmet} from "react-helmet";
import {IconBrandFacebook, IconBrandGoogle} from "@tabler/icons-react";

const SignupPage = () => {
    return (
        <>
            <Helmet>
                <title>Signup</title>
            </Helmet>
            <Container size={420} my={40}>
                <Title
                    align="center"
                    sx={() => ({fontWeight: 900})}
                >
                    Welcome back!
                </Title>
                <Text color="dimmed" size="sm" align="center" mt={5}>
                    Already have an account?{' '}
                    <Anchor size="sm" component="button">
                        Login
                    </Anchor>
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <Group grow mb="md" mt="md">
                        <Button radius="xl" leftIcon={<IconBrandFacebook size={18}/>}>Facebook</Button>
                        <Button radius="xl" leftIcon={<IconBrandGoogle size={18}/>}>Google</Button>
                    </Group>
                    <Divider label="Or continue with email" labelPosition="center" my="lg" />
                    <TextInput label="Name" placeholder="your name" required/>
                    <TextInput label="Email" placeholder="your email" required mt="md"/>
                    <PasswordInput label="Password" placeholder="your password" required mt="md"/>
                    <Group position="apart" mt="lg">
                        <Checkbox label="Remember me"/>
                        <Anchor component="button" size="sm">
                            Forgot password?
                        </Anchor>
                    </Group>
                    <Button fullWidth mt="xl">
                        Sign Up
                    </Button>
                </Paper>
            </Container>
        </>
    );
}

export default SignupPage;
