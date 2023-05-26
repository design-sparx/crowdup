import {Helmet} from "react-helmet";
import {DashboardLayout} from "../layout";
import {
    ActionIcon,
    Alert,
    Anchor,
    Avatar,
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    Group,
    NumberInput,
    Paper,
    Radio,
    SegmentedControl,
    Select,
    Stack,
    Stepper,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {Link, RichTextEditor} from '@mantine/tiptap';
import {useEditor} from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import {forwardRef, useState} from "react";
import countriesData from "../data/Countries.json";
import currencyData from "../data/Currencies.json";
import {ICountry, ICurrency} from "../types";
import {DateInput} from "@mantine/dates";
import {
    IconBrandFacebook,
    IconBrandLinkedin,
    IconBrandTwitter,
    IconBrandWhatsapp,
    IconBrandYoutube,
    IconCalendar,
    IconCurrencyDollar,
    IconLink,
    IconMail,
    IconPlus,
    IconTrash
} from "@tabler/icons-react";
import {FileDropzone} from "../components";
import {randomId} from "@mantine/hooks";
import {useForm} from "@mantine/form";

const CountrySelectItem = forwardRef<HTMLDivElement, ICountry>(
    ({image, name, code, ...others}: ICountry, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={image}/>

                <div>
                    <Text size="sm">{name}</Text>
                    <Text size="xs" opacity={0.65}>
                        {code}
                    </Text>
                </div>
            </Group>
        </div>
    )
);

const CurrencySelectItem = forwardRef<HTMLDivElement, ICurrency>(
    ({name, cc, ...others}: ICurrency, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Text size="sm">{name}</Text>
                <Text size="sm" opacity={0.65}>
                    {cc}
                </Text>
            </Group>
        </div>
    )
);

interface ISocialProps {
    icon: React.FC<any>;
    title: React.ReactNode;
}

const SocialSelectItem = forwardRef<HTMLDivElement, ISocialProps>(
    ({title, icon: Icon, ...others}: ISocialProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Icon size={18} stroke={1.5}/>
                <Text size="sm" transform="capitalize">{title}</Text>
            </Group>
        </div>
    )
);

const CreateCampaignPage = () => {
    const [active, setActive] = useState(0);
    const [target, setTarget] = useState('react');
    const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
    const [donationType, setDonationType] = useState('any');
    const [minimumCheck, setMinimumCheck] = useState(false);
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link,
            Superscript,
            SubScript,
            Highlight,
            TextAlign.configure({types: ['heading', 'paragraph']}),
        ],
        content: '',
    });

    const socialForm = useForm({
        initialValues: {
            employees: [{name: '', active: false, key: randomId()}],
        },
    });

    const nextStep = () => setActive((current: number) => (current < 4 ? current + 1 : current));
    const prevStep = () => setActive((current: number) => (current > 0 ? current - 1 : current));

    const socialFields = socialForm.values.employees.map((item, index) => (
        <Group key={item.key} mt="xs">
            <Select
                aria-label="social"
                data={
                    [
                        {title: 'facebook', icon: IconBrandFacebook},
                        {title: 'whatsapp', icon: IconBrandWhatsapp},
                        {title: 'linkedin', icon: IconBrandLinkedin},
                        {title: 'twitter', icon: IconBrandTwitter},
                        {title: 'youtube', icon: IconBrandYoutube},
                        {title: 'other links', icon: IconLink},
                    ].map(c => ({value: c.title, label: c.title, ...c}))}
                itemComponent={SocialSelectItem}
            />
            <TextInput
                placeholder="enter URL"
                sx={{flex: 1}}
                {...socialForm.getInputProps(`employees.${index}.name`)}
            />
            <ActionIcon color="red" onClick={() => socialForm.removeListItem('employees', index)}>
                <IconTrash size="1rem"/>
            </ActionIcon>
        </Group>
    ));

    return (
        <>
            <Helmet>
                <title>Create campaign</title>
            </Helmet>
            <DashboardLayout>
                <Container fluid>
                    <Title>Start Your Fundraiser</Title>
                    <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                        <Stepper.Step
                            label="Get started"
                            description="Set essential fundraiser details such as fundraiser title, target and currency"
                        >
                            <Title>Campaign information</Title>
                            <TextInput label="Campaign Title" placeholder="title"/>
                            <Select label="Campaign Category" data={[]}/>
                            <Title>Campaign location</Title>
                            <Text>Please select the country that we&apos;ll be sending funds to (typically where
                                you&apos;re
                                resident). This helps match you to the correct payment processors.</Text>
                            <Select
                                label="Country"
                                itemComponent={CountrySelectItem}
                                data={countriesData.data.map(c => ({value: c.name, label: c.name, ...c}))}
                                searchable
                                maxDropdownHeight={300}
                                nothingFound="Nobody here"
                                filter={(value, item) =>
                                    item?.name?.toLowerCase().includes(value?.toLowerCase().trim()) ||
                                    item?.code?.toLowerCase().includes(value?.toLowerCase().trim())
                                }
                            />
                            <TextInput label="City" placeholder="city"/>
                            <Title>Donation information</Title>
                            <Select
                                label="What currency do you want to raise money in?"
                                itemComponent={CurrencySelectItem}
                                data={currencyData.data.map(c => ({value: c.name, label: c.name, ...c}))}
                                searchable
                                maxDropdownHeight={300}
                                nothingFound="Nobody here"
                                filter={(value, item) =>
                                    item?.name?.toLowerCase().includes(value?.toLowerCase().trim()) ||
                                    item?.code?.toLowerCase().includes(value?.toLowerCase().trim())
                                }
                            />
                            <Radio.Group
                                label="What kind of fundraiser would you like to create?"
                                value={target}
                                onChange={setTarget}
                            >
                                <Group mt="xs">
                                    <Radio value="deadline" label="Fundraiser with a specific end date?"/>
                                    <Radio value="no-deadline" label="Ongoing (no deadline) fundraiser?"/>
                                </Group>
                            </Radio.Group>
                            <Paper>
                                {target === 'deadline' ?
                                    <Stack spacing="sm">
                                        <Text>Fundraiser with a specific end date?</Text>
                                        <Text>This creates urgency and should always be used when money is needed before
                                            a certain time.</Text>
                                        <DateInput
                                            value={deadlineDate}
                                            onChange={setDeadlineDate}
                                            label="Deadline"
                                            placeholder="Date input"
                                            icon={<IconCalendar/>}
                                        />
                                        <NumberInput label="Target amount" icon={<IconCurrencyDollar/>}/>
                                        <Checkbox label="Allow your fundraiser to be funded over the needed amount?"/>
                                    </Stack> :
                                    <Stack spacing="sm">
                                        <Text>Ongoing (no deadline) fundraiser?</Text>
                                        <Text>This should be used if you are collecting money on a regular basis.</Text>
                                        <Checkbox
                                            checked={minimumCheck}
                                            onChange={(event) => setMinimumCheck(event.currentTarget.checked)}
                                            label="Select this if you would like to set a specific a minimum financial target"/>
                                        {minimumCheck &&
                                            <NumberInput label="Target amount" icon={<IconCurrencyDollar/>}/>
                                        }
                                    </Stack>}
                            </Paper>
                            <Text>Donation type</Text>
                            <SegmentedControl
                                size="md"
                                value={donationType}
                                onChange={setDonationType}
                                data={[
                                    {label: 'Any (popular option)', value: 'any'},
                                    {label: 'Minimum', value: 'minimum'},
                                    {label: 'Fixed', value: 'fixed'},
                                ]}
                            />
                            {donationType === 'minimum' ?
                                <NumberInput label="Minimum amount(s)"/> :
                                <NumberInput label="Fixed amount(s)"/>}
                            <Checkbox label="Would you like your fundraising page shown in more than one language?"/>
                            <Title>Fund & Registration details</Title>
                            <Text>*Name of the person receiving funds. For organizations, the legal representative name
                                (this can be amended later).</Text>
                            <Group>
                                <TextInput label="First name"/>
                                <TextInput label="Last name"/>
                            </Group>
                            <FileDropzone
                                label="Upload your profile picture"
                                description="This picture will be shown next to your name"
                            />
                            <Checkbox label={
                                <>
                                    I agree to the CrowdUp{' '}
                                    <Anchor href="#" target="_blank">
                                        terms and conditions & privacy policy
                                    </Anchor>
                                </>
                            }/>
                        </Stepper.Step>
                        <Stepper.Step
                            label="Campaign story"
                            description="Tell your story! Add your description, images, videos and more">
                            <Title>
                                Your campaign story
                            </Title>
                            <Text>Explain why you&apos;re raising money, what the funds will be used for, and how much
                                you value the support</Text>
                            <RichTextEditor editor={editor}>
                                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.Bold/>
                                        <RichTextEditor.Italic/>
                                        <RichTextEditor.Underline/>
                                        <RichTextEditor.Strikethrough/>
                                        <RichTextEditor.ClearFormatting/>
                                        <RichTextEditor.Highlight/>
                                        <RichTextEditor.Code/>
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.H1/>
                                        <RichTextEditor.H2/>
                                        <RichTextEditor.H3/>
                                        <RichTextEditor.H4/>
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.Blockquote/>
                                        <RichTextEditor.Hr/>
                                        <RichTextEditor.BulletList/>
                                        <RichTextEditor.OrderedList/>
                                        <RichTextEditor.Subscript/>
                                        <RichTextEditor.Superscript/>
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.Link/>
                                        <RichTextEditor.Unlink/>
                                    </RichTextEditor.ControlsGroup>

                                    <RichTextEditor.ControlsGroup>
                                        <RichTextEditor.AlignLeft/>
                                        <RichTextEditor.AlignCenter/>
                                        <RichTextEditor.AlignJustify/>
                                        <RichTextEditor.AlignRight/>
                                    </RichTextEditor.ControlsGroup>
                                </RichTextEditor.Toolbar>

                                <RichTextEditor.Content/>
                            </RichTextEditor>
                            <FileDropzone
                                label="Upload fundraiser photos"
                                description="You can select and upload several in one go"/>
                            <TextInput
                                label="Video URL"
                                description="The inclusion of a personalized video can help your fundraiser raise more money. We support links from YouTube and Vimeo. Simply copy paste your video link into the field below."
                                icon={<IconLink/>}
                            />
                        </Stepper.Step>
                        <Stepper.Step
                            label="Final details"
                            description="Add team members, customize visibility, and more"
                        >
                            <Title>Final details</Title>
                            <Text>Manage Team</Text>
                            <Text>If there&apos;s more than one person that's responsible for this fundraiser and you'd
                                like them to get public credit and help manage this page, invite them via email.</Text>
                            <Text>Team members will be shown on your page along with their role. Please remember, team
                                members can change all elements of the page.</Text>
                            <Alert>You haven't invited anyone to help manage this fundraiser yet.</Alert>
                            <Paper>
                                <Group>
                                    <TextInput label="First name"/>
                                    <TextInput label="Last name"/>
                                </Group>
                                <TextInput label="Email"/>
                                <TextInput label="Role" placeholder="e.g. Social media manager, funds manager"/>
                                <Button leftIcon={<IconMail/>}>Send invite via email</Button>
                            </Paper>
                            <Paper>
                                <Text>Visibility</Text>
                                <Checkbox label="Allow your fundraiser to be shown under user created groups."/>
                                <Checkbox
                                    label="Check this box if you would like to hide your campaign on our site. Only those that you send the URL to will be able to find it and donate."/>
                                <Checkbox
                                    label="Check if you would like to stop search engines such as Google indexing this page."/>
                                <Checkbox
                                    label="Check if you would like to add a password to your fundraising page. Only those with the password will be able to view and donate to the campaign."/>
                            </Paper>
                            <Paper>
                                <Text>Social media links</Text>
                                <Text>Is this fundraiser shown in other places? If so, add links to those pages.</Text>
                                <Box maw={500}>
                                    {socialFields.length > 0 ? (
                                        <Flex mb="xs">
                                        </Flex>
                                    ) : (
                                        <Text color="dimmed" align="center">
                                            Add social media link
                                        </Text>
                                    )}

                                    {socialFields}

                                    <Group position="center" mt="md">
                                        <Button
                                            leftIcon={<IconPlus/>}
                                            onClick={() =>
                                                socialForm.insertListItem('employees', {
                                                    name: '',
                                                    active: false,
                                                    key: randomId()
                                                })
                                            }
                                        >
                                            Add new link
                                        </Button>
                                    </Group>
                                </Box>
                            </Paper>
                            <Paper>
                                <Select
                                    label="How did you hear about us?"
                                    data={['search engine', 'friends & family', 'social media', 'other']}
                                />
                            </Paper>
                        </Stepper.Step>
                        <Stepper.Step label="Payment methods" description="Get full access">
                            <Title>Fundraiser Payment Methods</Title>
                            <Text>Enable payment processors for your fundraising page</Text>
                            <Alert>You can enable GGF Card Payments (powered by MangoPay) if you switch your currency
                                from GBP to USD </Alert>
                            <Paper>
                                <Text>Available payment methods</Text>
                                <Group>
                                    <Button>Connect with Paypal</Button>
                                    <Button>Connect with Skrill</Button>
                                    <Button>Connect with Google Pay</Button>
                                    <Button>Connect with Apple Pay</Button>
                                </Group>
                            </Paper>
                        </Stepper.Step>
                        <Stepper.Completed>
                            Completed, click back button to get to previous step
                        </Stepper.Completed>
                    </Stepper>

                    <Group position="center" mt="xl">
                        <Button variant="default" onClick={prevStep}>Back</Button>
                        <Button onClick={nextStep}>{active < 4 ? 'Next step' : 'Launch campaign'}</Button>
                    </Group>
                </Container>
            </DashboardLayout>
        </>
    );
};

export default CreateCampaignPage;
