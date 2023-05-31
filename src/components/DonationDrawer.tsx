import {useState} from 'react';
import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Drawer,
    DrawerProps,
    Flex,
    Group,
    Image,
    NumberInput,
    Paper,
    Popover,
    Radio,
    ScrollArea,
    Slider,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Transition
} from "@mantine/core";
import {
    IconBrandApple,
    IconBrandGoogle,
    IconCreditCard,
    IconCurrencyDollar,
    IconInfoCircleFilled,
    IconShieldCheckFilled
} from "@tabler/icons-react";
import {CountrySelect} from "./index";
import {ICampaign} from "../types";

interface IProps extends Pick<DrawerProps, 'opened' | 'onClose' | 'size'> {
    campaign?: ICampaign
    iconSize: number
}

const DonationDrawer = ({campaign, iconSize, ...others}: IProps) => {
    const [payment, setPayment] = useState('');

    return (
        <Drawer position="bottom" title="Make a Donation" size="100%" scrollAreaComponent={ScrollArea.Autosize}
                {...others}>
            <Container>
                <Stack>
                    <Flex gap="xs" align="center">
                        <Image src={campaign?.mainImage} height={96} width={120} fit="contain" radius="sm"/>
                        <Text>You&apos;re supporting <b>{campaign?.title}</b></Text>
                    </Flex>
                    <NumberInput
                        size="md"
                        label="Enter your donation"
                        precision={2}
                        rightSection={<IconCurrencyDollar size={iconSize}/>}
                    />
                    <Box>
                        <Text fw={500}>Tip CrowdUp services</Text>
                        <Text size="sm" my="sm">CrowdUp has a 0% platform fee for organizers. CrowdUp will continue
                            offering its services
                            thanks to donors who will leave an optional amount here:</Text>
                        <Slider
                            marks={[
                                {value: 20, label: '20%'},
                                {value: 50, label: '50%'},
                                {value: 80, label: '80%'},
                            ]}
                            mb="lg"
                        />
                    </Box>
                    <Box>
                        <Radio.Group
                            name="paymentMethod"
                            label="Payment method"
                            value={payment}
                            onChange={setPayment}
                        >
                            <Group mt="sm">
                                <Radio
                                    value="gpay"
                                    label={<Group spacing="xs"><IconBrandGoogle size={iconSize}/><Text>Google Pay</Text></Group>}/>
                                <Radio
                                    value="applepay"
                                    label={<Group spacing="xs"><IconBrandApple size={iconSize}/><Text>Apple
                                        Pay</Text></Group>}/>
                                <Radio
                                    value="card"
                                    label={<Group spacing="xs"><IconCreditCard size={iconSize}/><Text>Credit or
                                        debit</Text></Group>}/>
                            </Group>
                        </Radio.Group>
                        <Transition mounted={payment === 'card'} transition="scale-y" duration={400}
                                    timingFunction="ease">
                            {(styles) =>
                                <Paper withBorder p="md" radius="sm" mt="sm" style={styles}>
                                    <Stack sx={{width: '100%'}}>
                                        <TextInput label="Email address"/>
                                        <Group grow>
                                            <TextInput label="First name"/>
                                            <TextInput label="Last name"/>
                                        </Group>
                                        <Checkbox label="Use as billing name"/>
                                        <NumberInput label="Card number"/>
                                        <Group grow>
                                            <NumberInput label="MM/YY"/>
                                            <NumberInput label="CVV"/>
                                        </Group>
                                        <TextInput label="Name on card"/>
                                        <Group grow>
                                            <CountrySelect/>
                                            <TextInput label="Postal code"/>
                                        </Group>
                                        <Checkbox label="Save card for future donations"/>
                                    </Stack>
                                </Paper>
                            }
                        </Transition>
                    </Box>
                    <Group spacing="xs">
                        <Checkbox label="Don't display my name publicly on the fundraiser."/>
                        <Popover width={200} position="bottom" withArrow shadow="md">
                            <Popover.Target>
                                <ActionIcon>
                                    <IconInfoCircleFilled size={iconSize}/>
                                </ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm">Your name will only be visible to the organizer, any team members and
                                    the beneficiary</Text>
                            </Popover.Dropdown>
                        </Popover>
                    </Group>
                    <Checkbox label="Get occasional marketing updates from GoFundMe. You may unsubscribe at any time."/>
                    <Divider/>
                    <Text fw={700}>Your donation</Text>
                    <Stack spacing="xs">
                        <Group position="apart">
                            <Text>Your donation</Text>
                            <Text>$0.00</Text>
                        </Group>
                        <Group position="apart">
                            <Text>CrowdUp tip</Text>
                            <Text>$0.00</Text>
                        </Group>
                        <Group position="apart">
                            <Text>Total due today</Text>
                            <Text>$0.00</Text>
                        </Group>
                    </Stack>
                    <Button size="lg">Donate Now</Button>
                    <Text size="sm">By continuing, you agree with <Anchor>CrowdUp terms</Anchor> and <Anchor>privacy
                        notice.</Anchor></Text>
                    <Text size="sm">Learn more about <Anchor>pricing and fees.</Anchor></Text>
                    <Divider/>
                    <Group>
                        <ThemeIcon size="xl" variant="light" color="blue">
                            <IconShieldCheckFilled/>
                        </ThemeIcon>
                        <Text size="sm">We guarantee you a full refund for up to a year in the rare case that fraud
                            occurs.&nbsp;
                            <Anchor>See our CrowdUp Giving Guarantee.</Anchor>
                        </Text>
                    </Group>
                </Stack>
            </Container>
        </Drawer>
    );
};

export default DonationDrawer;
