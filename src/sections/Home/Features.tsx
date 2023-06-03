import {
    Box,
    BoxProps,
    Button,
    Card,
    createStyles,
    Image,
    PaperProps,
    SimpleGrid,
    Stack,
    Text,
    TextProps,
    Title,
    TitleProps
} from '@mantine/core';
import {TitleBadge} from "../../components";

const useStyles = createStyles((theme) => ({
    feature: {
        padding: theme.spacing.lg,
        backdropFilter: `blur(16px) saturate(180%)`,
        backgroundColor: `rgba(255, 255, 255, 0.75)`,
        border: `1px solid rgba(209, 213, 219, 0.3)`
    },
}));

interface FeatureProps extends PaperProps {
    image: string
    title: string;
    description: string;
    action: string;
}

const mockdata = [
    {
        image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        title: 'Community',
        description:
            'Together we are stronger than alone. Find your peers and learn from others. Join our founder community or come to an event featuring leading social entrepreneurs from around the world.',
        action: `Check out what's on`
    },
    {
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
        title: 'Education',
        description:
            `Make your social enterprise (or “dream project”) a reality. Learn the keys to success and avoid the common missteps through one of our programs, working alongside other founders.`,
        action: 'Learn more about upcoming programs and opportunities'
    },
    {
        image: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
        title: 'Crowdfunding',
        description:
            `Ready to rally the resources you need to do good? Crowdup offers project, recurring and debt crowdfunding. We can even help you design a great campaign to give you the highest chance to succeed!`,
        action: 'See crowdfunding options'
    },
    {
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        title: 'Partnerships',
        description:
            `Crowdup partners with leading brands, institutions and governments to support changemakers. We accelerate change through challenges, accelerators and funding programs.`,
        action: 'Find out how we can work together '
    },
];

function Feature({image, title, description, action}: FeatureProps) {
    const {classes, cx} = useStyles();

    return (
        <Card className={cx(classes.feature, 'card')} shadow="md" radius="sm">
            <Card.Section>
                <Image src={image} height={240} fit="cover"/>
            </Card.Section>
            <Stack spacing="sm" mt="md">
                <Title order={4}>{title}</Title>
                <Text size="sm">{description}</Text>
                <Button variant="subtle" color="secondary">{action}</Button>
            </Stack>
        </Card>
    );
}

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps
    subtitleProps?: TextProps
}

const FeaturesSection = ({boxProps, subtitleProps}: IProps) => {
    const items = mockdata.map((item) => <Feature {...item} key={item.title}/>);

    return (
        <Box {...boxProps}>
            <Box mb="lg">
                <TitleBadge title="what to expect"/>
                <Text {...subtitleProps}>CrowdUp exists to support social impact projects, enterprises and founders.
                    What good can we help you start?</Text>
            </Box>
            <SimpleGrid cols={2} spacing="lg" breakpoints={[{maxWidth: 'md', cols: 2, spacing: 'sm'}]} >
                {items}
            </SimpleGrid>
        </Box>
    );
}

export default FeaturesSection;
