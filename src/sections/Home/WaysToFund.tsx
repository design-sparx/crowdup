import {
    Box,
    BoxProps,
    Card,
    Container,
    createStyles,
    Grid,
    Image,
    SimpleGrid,
    Stack,
    Text,
    TextProps,
    Title,
    TitleProps
} from "@mantine/core";
import {TitleBadge} from "../../components";
import {Link} from "react-router-dom";

const useStyles = createStyles((theme) => ({
    feature: {
        padding: theme.spacing.lg,
        backdropFilter: `blur(16px) saturate(180%)`,
        backgroundColor: `rgba(255, 255, 255, 0.75)`,
        border: `none`,

        '&:hover': {
            backgroundColor: theme.colors.secondary[2]
        }
    },
}));

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps,
    subtitleProps?: TextProps
}

const WaysToFundSection = ({boxProps, subtitleProps}: IProps) => {
    const {classes, cx, theme} = useStyles();

    return (
        <Box sx={{background: theme.colors.secondary[8], color: theme.white}} {...boxProps}>
            <Container fluid p={36}>
                <Grid>
                    <Grid.Col lg={4}>
                        <Stack spacing="xs" justify="center" sx={{height: '100%'}}>
                            <TitleBadge title="Make your impact"/>
                            <Title order={3}>CrowdUp Gives You More</Title>
                            <Text>Supercharge your fundraising efforts with our unique tools,
                                features and personal
                                support. Helping you raise more money than you could elsewhere!</Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col lg={8}>
                        <SimpleGrid cols={3} breakpoints={[{maxWidth: 'sm', cols: 1}]} >
                            <Card
                                className={cx(classes.feature, 'card')}
                                shadow="md"
                                radius="sm"
                                component={Link}
                                to="/create-campaign"
                            >
                                <Card.Section>
                                    <Image
                                        src="https://images.unsplash.com/photo-1518101645466-7795885ff8f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
                                </Card.Section>
                                <Text mt="md" align="center" {...subtitleProps}>Yourself</Text>
                            </Card>
                            <Card
                                className={cx(classes.feature, 'card')}
                                shadow="md"
                                radius="sm"
                                component={Link}
                                to="/create-campaign"
                            >
                                <Card.Section>
                                    <Image
                                        src="https://images.unsplash.com/photo-1674574124649-778f9afc0e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
                                </Card.Section>
                                <Text mt="md" align="center" {...subtitleProps}>Friends & Family</Text>
                            </Card>
                            <Card
                                className={cx(classes.feature, 'card')}
                                shadow="md"
                                radius="sm"
                                component={Link}
                                to="/create-campaign"
                            >
                                <Card.Section>
                                    <Image
                                        src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
                                </Card.Section>
                                <Text mt="md" align="center" {...subtitleProps}>Charity</Text>
                            </Card>
                        </SimpleGrid>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default WaysToFundSection;
