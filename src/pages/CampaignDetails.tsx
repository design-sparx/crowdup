import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {ICampaign} from "../types";
import campaignsData from "../data/Campaigns.json";
import {
    Accordion,
    ActionIcon,
    Anchor,
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Flex,
    Grid,
    Group,
    Image,
    Paper,
    PaperProps,
    Progress,
    Stack,
    Text,
    TextProps,
    Title,
    TitleProps,
    UnstyledButton
} from "@mantine/core";
import {IconFlag, IconHeart, IconHeartFilled, IconSeparator, IconShare} from "@tabler/icons-react";
import {useDisclosure, useMediaQuery, useToggle} from "@mantine/hooks";
import {BackButton, DonationDrawer, NotFound, ShareModal, UserCard} from "../components";
import {Helmet} from "react-helmet";
import * as dayjs from "dayjs";
import * as LocalizedFormat from "dayjs/plugin/localizedFormat"
import {notifications} from "@mantine/notifications";

const CampaignDetailsPage = (): JSX.Element => {
    dayjs.extend(LocalizedFormat)
    const {id} = useParams();
    const [campaign, setCampaign] = useState<ICampaign>();
    const [opened, {open, close}] = useDisclosure(false);
    const [donateOpened, {open: donateOpen, close: donateClose}] = useDisclosure(false);
    const [following, setFollowing] = useToggle();
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    const paperProps: PaperProps = {
        p: "md",
        shadow: "sm",
    }

    const titleProps: TitleProps = {
        size: 32,
        weight: 700,
        transform: 'capitalize',
        sx: {lineHeight: '40px'}
    }

    const subTitleProps: TextProps = {
        size: 20,
        weight: 600,
        sx: {lineHeight: '28px'}
    }

    const iconSize = 18;

    useEffect(() => {
        setCampaign(campaignsData.data.find(_ => _.id === id))
    }, [id]);

    return (
        <>
            <Helmet>
                <title>{campaign?.title}</title>
            </Helmet>
            <Box>
                {campaign ? <Container size="lg">
                    <BackButton mb="md"/>
                    <Grid>
                        <Grid.Col lg={8}>
                            <Stack>
                                <Card padding="md" shadow="sm">
                                    <Card.Section>
                                        <Image src={campaign?.mainImage} height={480}/>
                                    </Card.Section>
                                    <Stack mt="md">
                                        <Title>{campaign?.title}</Title>
                                        {!matchesMobile ?
                                            <Flex gap="xs" align="center">
                                                <Text size="sm">Fundraise campaign created by</Text>
                                                <UnstyledButton component={Anchor}>
                                                    <Flex gap="xs" align="center">
                                                        <Avatar src={campaign?.createdByImage} radius="xl" size="sm"/>
                                                        <Text size="sm">{campaign?.createdBy}</Text>
                                                    </Flex>
                                                </UnstyledButton>
                                                <IconSeparator size={18}/>
                                                <Text component={Anchor} size="sm">{campaign?.country}</Text>
                                                <IconSeparator size={18}/>
                                                <Text component={Anchor} size="sm">{campaign?.category}</Text>
                                            </Flex> :
                                            <Stack>
                                                <Flex gap="md">
                                                    <Text size="sm">Fundraise campaign created by</Text>
                                                    <UnstyledButton component={Anchor}>
                                                        <Flex gap="xs" align="center">
                                                            <Avatar src={campaign?.createdByImage} radius="xl"
                                                                    size="sm"/>
                                                            <Text size="sm">{campaign?.createdBy}</Text>
                                                        </Flex>
                                                    </UnstyledButton>
                                                </Flex>
                                                <Group>
                                                    <Text size="sm">Location
                                                        - <Anchor>{campaign?.country}</Anchor></Text>
                                                    <Text size="sm">Category
                                                        - <Anchor>{campaign?.category}</Anchor></Text>
                                                </Group>
                                            </Stack>
                                        }
                                        <Text {...subTitleProps}>Our story</Text>
                                        <Text size="sm">{campaign?.description}</Text>
                                        {matchesMobile && <>
                                            <Divider/>
                                            <Flex align="flex-end" gap="sm">
                                                <Title {...titleProps} align="center">{campaign?.amountRaised}</Title>
                                                <Text fw={500} align="center" color="dimmed">raised
                                                    of {campaign?.goal}</Text>
                                            </Flex>
                                            <Progress value={campaign?.daysLeft} size="md"/>
                                            <Flex justify="space-between">
                                                <Text fw={500}>{campaign?.daysLeft}% Funded</Text>
                                                <Text fw={500}>{campaign?.contributors} Donors</Text>
                                            </Flex>
                                            <Flex align="center" gap="xs">
                                                <Button onClick={donateOpen} fullWidth>Donate</Button>
                                                <ActionIcon
                                                    variant="subtle"
                                                    onClick={open}
                                                    color="blue"
                                                    title="Share with your friends"
                                                    size="lg"
                                                >
                                                    <IconShare size={iconSize}/>
                                                </ActionIcon>
                                                <ActionIcon
                                                    title={`${following ? 'Unfollow' : 'Follow'} this campaign`}
                                                    // variant={following ? 'filled' : 'subtle'}
                                                    size="lg"
                                                    color={'secondary'}
                                                    onClick={() => {
                                                        setFollowing();
                                                        notifications.show({
                                                            title: 'Notification',
                                                            message: `${following ? 'Following' : 'Unfollowed'} this campaign`,
                                                            withBorder: true,
                                                            styles: (theme) => ({
                                                                root: {
                                                                    backgroundColor: theme.colors.blue[6],
                                                                    borderColor: theme.colors.blue[6],

                                                                    '&::before': {backgroundColor: theme.white},
                                                                },

                                                                title: {color: theme.white},
                                                                description: {color: theme.white},
                                                                closeButton: {
                                                                    color: theme.white,
                                                                    '&:hover': {backgroundColor: theme.colors.blue[7]},
                                                                },
                                                            }),
                                                        })
                                                    }}
                                                >
                                                    {following ?
                                                        <IconHeartFilled size={iconSize}/> :
                                                        <IconHeart size={iconSize}/>
                                                    }
                                                </ActionIcon>
                                            </Flex>
                                        </>}
                                    </Stack>
                                </Card>
                                <Paper {...paperProps}>
                                    <Text {...subTitleProps} mb="sm">Organizer</Text>
                                    <UserCard/>
                                </Paper>
                                <Paper {...paperProps}>
                                    <Text>Created on {dayjs(campaign?.createdAt).format('LL')}</Text>
                                </Paper>
                                {!matchesMobile &&
                                    <Button
                                        leftIcon={<IconFlag size={iconSize}/>}
                                        variant="subtle"
                                        color="secondary"
                                    >
                                        Report campaign
                                    </Button>
                                }
                            </Stack>
                        </Grid.Col>
                        <Grid.Col lg={4}>
                            <Stack>
                                {!matchesMobile &&
                                    <Paper {...paperProps}>
                                        <Stack spacing="sm">
                                            <Title {...titleProps} align="center">{campaign?.amountRaised}</Title>
                                            <Text fw={500} align="center" color="dimmed">raised
                                                of {campaign?.goal}</Text>
                                            <Progress value={campaign?.daysLeft} size="md"/>
                                            <Flex justify="space-between">
                                                <Text fw={500}>{campaign?.daysLeft}% Funded</Text>
                                                <Text fw={500}>{campaign?.contributors} Donors</Text>
                                            </Flex>
                                            <Button size="xl" onClick={donateOpen}>Donate</Button>
                                            <Button
                                                leftIcon={<IconShare size={iconSize}/>}
                                                variant="outline"
                                                onClick={open}
                                                color="blue"
                                            >
                                                Share with friends
                                            </Button>
                                            <Button
                                                leftIcon={following ? <IconHeartFilled size={iconSize}/> :
                                                    <IconHeart size={iconSize}/>}
                                                variant={following ? 'filled' : 'subtle'}
                                                color="secondary"
                                                onClick={() => {
                                                    setFollowing();
                                                    notifications.show({
                                                        title: 'Notification',
                                                        message: `${following ? 'Following' : 'Unfollowed'} this campaign`,
                                                        withBorder: true,
                                                        styles: (theme) => ({
                                                            root: {
                                                                backgroundColor: theme.colors.blue[6],
                                                                borderColor: theme.colors.blue[6],

                                                                '&::before': {backgroundColor: theme.white},
                                                            },

                                                            title: {color: theme.white},
                                                            description: {color: theme.white},
                                                            closeButton: {
                                                                color: theme.white,
                                                                '&:hover': {backgroundColor: theme.colors.blue[7]},
                                                            },
                                                        }),
                                                    })
                                                }}
                                            >
                                                {following ? 'Unfollow' : 'Follow'} this campaign
                                            </Button>
                                        </Stack>
                                    </Paper>
                                }
                                <Paper {...paperProps}>
                                    <Text {...subTitleProps} mb="md">Donation FAQ</Text>
                                    <Accordion defaultValue="customization" variant="separated">
                                        <Accordion.Item value="customization">
                                            <Accordion.Control>When will {campaign?.createdBy} get my
                                                payment?</Accordion.Control>
                                            <Accordion.Panel>Your payment is sent directly to Dora so it immediately
                                                helps
                                                their campaign.</Accordion.Panel>
                                        </Accordion.Item>

                                        <Accordion.Item value="flexibility">
                                            <Accordion.Control>How secure is the payment process?</Accordion.Control>
                                            <Accordion.Panel>Payments are made in a highly-secure environment. We use
                                                industry leading technology (such as SSL) to keep your information safe
                                                and encrypted</Accordion.Panel>
                                        </Accordion.Item>
                                    </Accordion>
                                </Paper>
                                {matchesMobile &&
                                    <Button
                                        leftIcon={<IconFlag size={iconSize}/>}
                                        variant="subtle"
                                        color="secondary"
                                    >
                                        Report campaign
                                    </Button>
                                }
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Container> : <NotFound/>}
                <ShareModal opened={opened} onClose={close} campaign={campaign} iconSize={iconSize}/>
                <DonationDrawer campaign={campaign} opened={donateOpened} onClose={donateClose} iconSize={iconSize}/>
            </Box>
        </>
    );
};

export default CampaignDetailsPage;
