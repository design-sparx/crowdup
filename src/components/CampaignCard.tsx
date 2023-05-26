import {Button, Card, createStyles, Flex, Image, PaperProps, Progress, rem, Text,} from '@mantine/core';
import {ICampaign} from "../types";

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },

    rating: {
        position: 'absolute',
        top: theme.spacing.xs,
        right: rem(12),
        pointerEvents: 'none',
    },

    title: {
        marginTop: theme.spacing.md,
        marginBottom: rem(5),
    },

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        }),
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

interface IProps extends PaperProps {
    data: ICampaign
    showActions?: boolean
}

const CampaignCard = ({data, showActions, ...others}: IProps) => {
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
    const linkProps = {href: `/campaigns/${id}`, rel: 'noopener noreferrer'};

    return (
        <Card radius="md" className={classes.card} {...others}>
            <Card.Section>
                <a {...linkProps}>
                    <Image src={mainImage} height={280} radius="md"/>
                </a>
            </Card.Section>

            <Card.Section>
                <Text className={classes.title} lineClamp={1} fw={500} component="a" {...linkProps}>
                    {title}
                </Text>

                {showActions && <Text lineClamp={3}>{description}</Text>}

                <Progress value={daysLeft}/>

                <Flex justify="space-between">
                    <Text>{amountRaised} raised</Text>
                    <Text>{contributors} donations</Text>
                </Flex>

                {showActions && <Button>Donate Now</Button>}
            </Card.Section>
        </Card>
    );
};

export default CampaignCard;
