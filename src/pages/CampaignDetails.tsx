import type {CampaignDetails} from "../lib/campaigns/types";
import {formatMinorAmount} from "../helpers";
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
import {BackButton, DonationDrawer, ReportModal, ShareModal, UserCard} from "../components";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import {notifications} from "@mantine/notifications";

const CampaignDetailsPage = ({campaign}: {campaign: CampaignDetails}) => {
    dayjs.extend(LocalizedFormat)
    const [opened, {open, close}] = useDisclosure(false);
    const [donateOpened, {open: donateOpen, close: donateClose}] = useDisclosure(false);
    const [reportOpened, {open: reportOpen, close: reportClose}] = useDisclosure(false);
    const [following, setFollowing] = useToggle();
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    const paperProps: PaperProps = {
        p: "md",
        shadow: "sm",
    }

    const titleProps: TitleProps = {
        size: 32,
        fw: 700,
        tt: 'capitalize',
        style: {lineHeight: '40px'}
    }

    const subTitleProps: TextProps = {
        fz: 20,
        fw: 600,
        style: {lineHeight: '28px'}
    }

    const iconSize = 18;

    return (
        <>
            <Box>
                <Container size="lg">
                    <BackButton mb="md"/>
                    <Grid>
                        <Grid.Col span={{base: 12, lg: 8}}>
                            <Stack>
                                <Card padding="md" shadow="sm">
                                    <Card.Section>
                                        <Image src={campaign.imageUrl} height={480}/>
                                    </Card.Section>
                                    <Stack mt="md">
                                        <Title>{campaign.title}</Title>
                                        {!matchesMobile ?
                                            <Flex gap="xs" align="center">
                                                <Text size="sm">Fundraise campaign created by</Text>
                                                <UnstyledButton component="a">
                                                    <Flex gap="xs" align="center">
                                                        <Avatar src={campaign.organizerAvatarUrl} radius="xl" size="sm"/>
                                                        <Text size="sm">{campaign.organizerName}</Text>
                                                    </Flex>
                                                </UnstyledButton>
                                                <IconSeparator size={18}/>
                                                <Anchor size="sm">{campaign.country}</Anchor>
                                                <IconSeparator size={18}/>
                                                <Anchor size="sm">{campaign.category}</Anchor>
                                            </Flex> :
                                            <Stack>
                                                <Flex gap="md">
                                                    <Text size="sm">Fundraise campaign created by</Text>
                                                    <UnstyledButton component="a">
                                                        <Flex gap="xs" align="center">
                                                            <Avatar src={campaign.organizerAvatarUrl} radius="xl"
                                                                    size="sm"/>
                                                            <Text size="sm">{campaign.organizerName}</Text>
                                                        </Flex>
                                                    </UnstyledButton>
                                                </Flex>
                                                <Group>
                                                    <Text size="sm">Location
                                                        - <Anchor>{campaign.country}</Anchor></Text>
                                                    <Text size="sm">Category
                                                        - <Anchor>{campaign.category}</Anchor></Text>
                                                </Group>
                                            </Stack>
                                        }
                                        <Text {...subTitleProps}>Our story</Text>
                                        <Text size="sm">{campaign.description}</Text>
                                        {matchesMobile && <>
                                            <Divider/>
                                            <Flex align="flex-end" gap="sm">
                                                <Title {...titleProps} ta="center">{formatMinorAmount(campaign.raisedAmount, campaign.currency)}</Title>
                                                <Text fw={500} ta="center" c="dimmed">raised
                                                    of {formatMinorAmount(campaign.goalAmount, campaign.currency)}</Text>
                                            </Flex>
                                            <Progress value={campaign.percentFunded} size="md"/>
                                            <Flex justify="space-between">
                                                <Text fw={500}>{campaign.percentFunded}% Funded</Text>
                                                <Text fw={500}>{campaign.donorCount} Donors</Text>
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
                                    <UserCard name={campaign.organizerName} avatar={campaign.organizerAvatarUrl}/>
                                </Paper>
                                <Paper {...paperProps}>
                                    <Text>Created on {dayjs(campaign.createdAt).format('LL')}</Text>
                                </Paper>
                                {!matchesMobile &&
                                    <Button
                                        leftSection={<IconFlag size={iconSize}/>}
                                        variant="subtle"
                                        color="secondary"
                                        onClick={reportOpen}
                                    >
                                        Report campaign
                                    </Button>
                                }
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{base: 12, lg: 4}}>
                            <Stack>
                                {!matchesMobile &&
                                    <Paper {...paperProps}>
                                        <Stack gap="sm">
                                            <Title {...titleProps} ta="center">{formatMinorAmount(campaign.raisedAmount, campaign.currency)}</Title>
                                            <Text fw={500} ta="center" c="dimmed">raised
                                                of {formatMinorAmount(campaign.goalAmount, campaign.currency)}</Text>
                                            <Progress value={campaign.percentFunded} size="md"/>
                                            <Flex justify="space-between">
                                                <Text fw={500}>{campaign.percentFunded}% Funded</Text>
                                                <Text fw={500}>{campaign.donorCount} Donors</Text>
                                            </Flex>
                                            <Button size="xl" onClick={donateOpen}>Donate</Button>
                                            <Button
                                                leftSection={<IconShare size={iconSize}/>}
                                                variant="outline"
                                                onClick={open}
                                                color="blue"
                                            >
                                                Share with friends
                                            </Button>
                                            <Button
                                                leftSection={following ? <IconHeartFilled size={iconSize}/> :
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
                                            <Accordion.Control>When will {campaign.organizerName} get my
                                                payment?</Accordion.Control>
                                            <Accordion.Panel>Your payment is sent directly to the organizer so it immediately
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
                                        leftSection={<IconFlag size={iconSize}/>}
                                        variant="subtle"
                                        color="secondary"
                                        onClick={reportOpen}
                                    >
                                        Report campaign
                                    </Button>
                                }
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Container>
                <ReportModal opened={reportOpened} onClose={reportClose}/>
                <ShareModal opened={opened} onClose={close} campaign={campaign} iconSize={iconSize}/>
                <DonationDrawer campaign={campaign} opened={donateOpened} onClose={donateClose} iconSize={iconSize}/>
            </Box>
        </>
    );
};

export default CampaignDetailsPage;
