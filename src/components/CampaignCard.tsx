import {
    Button,
    Card,
    createStyles,
    Flex,
    getStylesRef,
    Image,
    PaperProps,
    Progress,
    rem,
    Stack,
    Text,
} from '@mantine/core';
import {ICampaign} from "../types";
import {Link} from "react-router-dom";

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        padding: theme.spacing.lg,
        backdropFilter: `blur(16px) saturate(180%)`,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : `rgba(255, 255, 255, 0.75)`,
        border: `1px solid rgba(209, 213, 219, 0.3)`,

        [`&:hover .${getStylesRef('image')}`]: {
            transform: 'scale(1.03)',
        },
    },

    title: {
        marginTop: theme.spacing.md,
        marginBottom: rem(5),
    },

    image: {
        ref: getStylesRef('image'),
        transition: 'transform 150ms ease',
    }
}));

interface IProps extends PaperProps {
    data: ICampaign
    showActions?: boolean
}

const CampaignCard = ({data, showActions}: IProps) => {
    const {classes} = useStyles();
    const {
        mainImage,
        id,
        title,
        amountRaised,
        daysLeft,
        contributors,
        description,
    } = data;
    const linkProps = {to: `/campaigns/${id}`, rel: 'noopener noreferrer'};

    return (
        <Card radius="sm" shadow="md" component={Link} {...linkProps} className={classes.card}>
            <Card.Section>
                <Image src={mainImage} height={280} className={classes.image}/>
            </Card.Section>

            <Card.Section pt={0} px="md" pb="md">
                <Stack>
                    <Text className={classes.title} lineClamp={1} fw={500}>
                        {title}
                    </Text>

                    {showActions && <Text lineClamp={3}>{description}</Text>}

                    <Progress value={daysLeft}/>

                    <Flex justify="space-between">
                        <Text><b>{amountRaised}</b> raised</Text>
                        <Text><b>{contributors}</b> donations</Text>
                    </Flex>

                    {showActions && <Button>Donate Now</Button>}
                </Stack>
            </Card.Section>
        </Card>
    );
};

export default CampaignCard;
