import {Helmet} from "react-helmet";
import {
    AspectRatio,
    Box,
    BoxProps,
    Button,
    Card,
    CardProps,
    Container,
    Image,
    ImageProps,
    List,
    ListProps,
    SimpleGrid,
    Stack,
    Text,
    Title,
    TitleProps
} from "@mantine/core";
import AddImg from "../assets/img/add-campaign.png"
import MoneyImg from "../assets/img/money-income.png"
import ShareImg from "../assets/img/share-campaign.png"
import TestimonialsSection from "../sections/Home/Testimonials";
import {Link} from "react-router-dom";

const HowItWorksPage = (): JSX.Element => {
    const boxProps: BoxProps = {
        mt: 96,
        mb: 136,
        py: 48
    }

    const titleProps: TitleProps = {
        size: 32,
        weight: 800,
        mb: "xl",
        transform: 'capitalize',
        sx: {lineHeight: '40px'}
    }

    const listProps: Omit<ListProps, 'children'> = {
        size: "sm",
        withPadding: true
    }

    const cardProps: Omit<CardProps, 'children'> = {
        radius: "sm",
        shadow: "md",
        padding: "lg",
        sx: {
            backdropFilter: `blur(16px) saturate(180%)`,
            backgroundColor: `rgba(255, 255, 255, 0.75)`,
            border: `none`,
        }
    }

    const imageProps: ImageProps = {
        height: 160,
        fit: "contain",
        py: "xl"
    }

    return (
        <>
            <Helmet>
                <title>How it works</title>
            </Helmet>
            <Box>
                <Container>
                    <Box {...boxProps} sx={{textAlign: 'center'}}>
                        <Title mb={48} fw={800}>How to Fundraise Online</Title>
                        <Text>GoGetFunding is the best place to fundraise, whether you are an individual, group,
                            or organization.</Text>
                        <Text fw={600} mb={36}>Watch our explainer video.</Text>
                        <AspectRatio ratio={1904 / 768} mx="auto">
                            <iframe
                                width="600"
                                height="400"
                                src="https://www.youtube.com/embed/ut8___4PI2A"
                                title="Baby Shark Dance + More Songs | Compilation for Kids | Pinkfong Baby Shark"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen/>
                        </AspectRatio>
                    </Box>
                    <Box {...boxProps}>
                        <Title {...titleProps} align="center">Here's how it works</Title>
                        <SimpleGrid
                            cols={3}
                            spacing="lg"
                            breakpoints={[
                                {maxWidth: 'md', cols: 3, spacing: 'md'},
                                {maxWidth: 'sm', cols: 1, spacing: 0},
                            ]}
                        >
                            <Card {...cardProps}>
                                <Card.Section>
                                    <Image src={AddImg} {...imageProps}/>
                                </Card.Section>
                                <Text my="sm" fw={600}>1. Start your fundraiser</Text>
                                <List {...listProps}>
                                    <List.Item>Set your fundraiser goal</List.Item>
                                    <List.Item>Tell your story</List.Item>
                                    <List.Item>Add a picture or video</List.Item>
                                    <List.Item>
                                        <a href="">Watch a video tutorial</a>
                                    </List.Item>
                                </List>
                            </Card>
                            <Card {...cardProps}>
                                <Card.Section>
                                    <Image src={MoneyImg} {...imageProps}/>
                                </Card.Section>
                                <Text my="sm" fw={600}>2. Share with friends</Text>
                                <List {...listProps}>
                                    <List.Item>Send emails</List.Item>
                                    <List.Item>Send text messages</List.Item>
                                    <List.Item>Share on social media</List.Item>
                                    <List.Item>
                                        <a href="">Watch a video tutorial</a>
                                    </List.Item>
                                </List>
                            </Card>
                            <Card {...cardProps}>
                                <Card.Section>
                                    <Image src={ShareImg} {...imageProps}/>
                                </Card.Section>
                                <Text my="sm" fw={600}>3. Manage donations</Text>
                                <List {...listProps}>
                                    <List.Item>Accept donations</List.Item>
                                    <List.Item>Thank donors</List.Item>
                                    <List.Item>Withdraw funds</List.Item>
                                </List>
                            </Card>
                        </SimpleGrid>
                    </Box>
                    <TestimonialsSection boxProps={boxProps} titleProps={titleProps}/>
                    <Box {...boxProps}>
                        <SimpleGrid
                            cols={2}
                            breakpoints={[
                                {maxWidth: 'sm', cols: 1, spacing: 0},
                            ]}
                        >
                            <Card
                                shadow="md"
                                radius="sm"
                                component={Link}
                                to="/campaigns"
                            >
                                <Card.Section>
                                    <Image
                                        src="https://images.unsplash.com/photo-1674574124649-778f9afc0e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
                                </Card.Section>
                                <Stack spacing="sm" align="start" mt="md">
                                    <Text size="lg" fw={500}>Discover amazing fundraising campaigns</Text>
                                    <Button size="md" component={Link} to="/campaigns">Fund Someone</Button>
                                </Stack>
                            </Card>
                            <Card
                                shadow="md"
                                radius="sm"
                                component={Link}
                                to="/create-campaign"
                            >
                                <Card.Section>
                                    <Image
                                        src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
                                </Card.Section>
                                <Stack spacing="sm" align="start" mt="md">
                                    <Text size="lg" fw={500}>Create your campaign</Text>
                                    <Button size="md">Start Fundraising</Button>
                                </Stack>
                            </Card>
                        </SimpleGrid>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default HowItWorksPage;
