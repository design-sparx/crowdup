import {Anchor, Text} from "@mantine/core";
import {Link} from "react-router";

const SignupConsent = () => (
    <Text size="xs" c="dimmed" mt="md">
        By creating an account you agree to our{" "}
        <Anchor component={Link} to="/terms" size="xs">Terms of Service</Anchor>
        {" "}and acknowledge our{" "}
        <Anchor component={Link} to="/privacy" size="xs">Privacy Policy</Anchor>.
    </Text>
);

export default SignupConsent;
