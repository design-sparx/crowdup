import {useState} from "react";
import {
    Alert,
    Button,
    Checkbox,
    Container,
    Drawer,
    DrawerProps,
    Flex,
    Group,
    Image,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import {Form, useActionData, useNavigation} from "react-router";
import type {Campaign} from "../lib/campaigns/types";
import {formatMinor, minorUnitExponent, presetsMinor} from "../lib/donations/amount";
import {MAX_MESSAGE, MAX_NAME} from "../lib/donations/donor";

interface IProps extends Pick<DrawerProps, "opened" | "onClose" | "size"> {
    campaign?: Campaign;
    acceptingDonations?: boolean;
}

/**
 * Donation form. Posts `intent=donate` to the campaign route's action, which re-validates
 * everything on the server and redirects to Stripe Checkout. The disabled state here is
 * only a convenience: the server refuses donations to campaigns that cannot accept them.
 */
const DonationDrawer = ({campaign, acceptingDonations = true, ...others}: IProps) => {
    const actionData = useActionData() as {error?: string} | undefined;
    const navigation = useNavigation();
    const submitting = navigation.state !== "idle" && navigation.formData?.get("intent") === "donate";
    const currency = campaign?.currency ?? "USD";
    const exp = minorUnitExponent(currency);
    const presets = presetsMinor(currency);
    const [amount, setAmount] = useState(String(presets[1] / 10 ** exp));

    return (
        <Drawer position="bottom" title="Make a Donation" size="100%" {...others}>
            <Container>
                <Form method="post">
                    <input type="hidden" name="intent" value="donate"/>
                    <Stack>
                        <Flex gap="xs" align="center">
                            <Image src={campaign?.imageUrl} height={96} width={120} fit="contain" radius="sm"/>
                            <Text>You&apos;re supporting <b>{campaign?.title}</b></Text>
                        </Flex>
                        <Group gap="xs" role="group" aria-label="Preset amounts">
                            {presets.map((p) => (
                                <Button
                                    key={p}
                                    type="button"
                                    variant={amount === String(p / 10 ** exp) ? "filled" : "outline"}
                                    onClick={() => setAmount(String(p / 10 ** exp))}
                                >
                                    {formatMinor(p, currency)}
                                </Button>
                            ))}
                        </Group>
                        <TextInput
                            name="amount"
                            label={`Amount (${currency})`}
                            description="Or enter your own amount."
                            inputMode="decimal"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.currentTarget.value)}
                        />
                        <TextInput name="name" label="Your name (optional)" maxLength={MAX_NAME}/>
                        <TextInput name="email" type="email" label="Email for your receipt (optional)"/>
                        <Textarea name="message" label="Message (optional)" autosize minRows={2} maxLength={MAX_MESSAGE}/>
                        <Checkbox name="anonymous" label="Don't display my name publicly on the fundraiser."/>
                        {actionData?.error && <Alert color="red" role="alert">{actionData.error}</Alert>}
                        {!acceptingDonations && (
                            <Alert color="gray">This campaign is not accepting donations.</Alert>
                        )}
                        <Button type="submit" size="lg" disabled={!acceptingDonations} loading={submitting}>
                            {acceptingDonations ? "Donate now" : "Donations closed"}
                        </Button>
                        <Text size="xs" c="dimmed">
                            You will be redirected to Stripe to pay securely. Your payment goes directly to the organiser.
                        </Text>
                    </Stack>
                </Form>
            </Container>
        </Drawer>
    );
};

export default DonationDrawer;
