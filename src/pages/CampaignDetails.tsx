import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {ICampaign} from "../types";
import campaignsData from "../data/Campaigns.json";
import {
    Avatar,
    Badge,
    Button,
    ButtonProps,
    Container,
    CopyButton,
    Flex,
    Grid,
    Image,
    Modal,
    NumberInput,
    Paper,
    Progress,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip
} from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTwitter,
    IconCheck,
    IconCode,
    IconCopy,
    IconMail
} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {ContactCard, UserCard} from "../components";
import {PublicLayout} from "../layout";
import {Helmet} from "react-helmet";

const CampaignDetailsPage = (): JSX.Element => {
    const {id} = useParams();
    const [campaign, setCampaign] = useState<ICampaign>();
    const [opened, {open, close}] = useDisclosure(false);

    const buttonProps: ButtonProps = {
        variant: "subtle"
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
            <PublicLayout compressedNav={false}>
                <Container size="lg">
                    <Grid>
                        <Grid.Col lg={8}>
                            <Title>{campaign?.title}</Title>
                            <Image src={campaign?.mainImage} height={480} radius="sm"/>
                            <Flex justify="space-between" align="center">
                                <Flex gap="sm" align="center">
                                    <Avatar src={campaign?.createdByImage}/>
                                    <Text>{campaign?.createdBy}</Text>
                                </Flex>
                                <Badge size="md" radius="sm" variant="dot">{campaign?.category}</Badge>
                                <Text>{campaign?.createdAt}</Text>
                            </Flex>
                            <Progress value={campaign?.daysLeft} size="xl"/>
                            <Flex justify="space-between">
                                <Paper>
                                    <Text>{campaign?.amountRaised}</Text>
                                    <Text>raised</Text>
                                </Paper>
                                <Paper>
                                    <Text>{campaign?.goal}</Text>
                                    <Text>goal</Text>
                                </Paper>
                                <Paper>
                                    <Text>{Number(campaign?.goal.split('$')[1]) - Number(campaign?.amountRaised.split('$')[1])}</Text>
                                    <Text>to go</Text>
                                </Paper>
                            </Flex>
                            <Paper>
                                <Flex>
                                    <Text>Select payment method</Text>
                                    <Button.Group>
                                        <Button variant="default">$10</Button>
                                        <Button variant="default">$20</Button>
                                        <Button variant="default">$50</Button>
                                        <Button variant="default">$100</Button>
                                    </Button.Group>
                                </Flex>
                                <Flex>
                                    <NumberInput label="Enter amount" placeholder="$000"/>
                                </Flex>
                            </Paper>
                            <Text>{campaign?.description}</Text>
                            <Flex>
                                <Button>Donate</Button>
                                <Button onClick={open}>Share</Button>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col lg={4}>
                            <UserCard/>
                            <ContactCard/>
                            <Paper>
                                <Title>Donation FAQ</Title>
                                <Stack>
                                    <Text>When will {campaign?.createdBy} get my payment?</Text>
                                    <Text>Your payment is sent directly to Dora so it immediately helps their
                                        campaign.</Text>
                                </Stack>
                                <Stack>
                                    <Text>How secure is the payment process?</Text>
                                    <Text>Payments are made in a highly-secure environment. We use industry leading
                                        technology (such as SSL) to keep your information safe and encrypted</Text>
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Container>
                <Modal opened={opened} onClose={close} title="Help by sharing" centered size="md">
                    <Stack>
                        <Text>Fundraisers shared on social networks raise up to 5x more.</Text>
                        <Paper>
                            <Flex wrap="wrap" gap="xs">
                                <Button
                                    leftIcon={<IconBrandFacebook size={iconSize}/>} {...buttonProps}>Facebook</Button>
                                <Button leftIcon={<IconBrandTwitter size={iconSize}/>} {...buttonProps}>Twitter</Button>
                                <Button
                                    leftIcon={<IconBrandInstagram size={iconSize}/>} {...buttonProps}>Instagram</Button>
                                <Button
                                    leftIcon={<IconBrandLinkedin size={iconSize}/>} {...buttonProps}>LinkedIn</Button>
                                <Button leftIcon={<IconMail size={iconSize}/>} {...buttonProps}>Email</Button>
                                <Button leftIcon={<IconCode size={iconSize}/>} {...buttonProps}>Embed</Button>
                            </Flex>
                        </Paper>
                        <Paper>
                            <Flex align="flex-end" gap="sm">
                                <TextInput
                                    label="Copy Link"
                                    value={`https://crowdup.com/${campaign?.id}`}
                                    disabled
                                    sx={{flex: '1 1 auto'}}/>
                                <CopyButton value={`https://crowdup.com/${campaign?.id}`} timeout={2000}>
                                    {({copied, copy}) => (
                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                            <Button
                                                color={copied ? 'green' : 'gray'}
                                                leftIcon={copied ? <IconCheck size="1rem"/> : <IconCopy size="1rem"/>}
                                                onClick={copy}>
                                                {copied ? 'Copied' : 'Copy'}
                                            </Button>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Flex>
                        </Paper>
                    </Stack>
                </Modal>
            </PublicLayout>
        </>
    );
};

export default CampaignDetailsPage;
