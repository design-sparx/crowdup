import {Card, createStyles, Grid, Group, Image, PaperProps, rem, Text,} from '@mantine/core';
import {ITestimonial} from "../types";

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
    data: ITestimonial
}

const CampaignCard = ({data, ...others}: IProps) => {
    const {classes} = useStyles();
    const {
        company, createdByImage, createdBy, testimonial, jobPosition
    } = data;

    return (
        <Card radius="md" className={classes.card} {...others}>
            <Grid>
                <Grid.Col lg={7}>
                    <Text size="xl">{testimonial}</Text>
                    <Group>
                        <Text>{createdBy},</Text>
                        <Text>{jobPosition} - </Text>
                        <Text>{company}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col lg={5}>
                    <Image src={createdByImage}/>
                </Grid.Col>
            </Grid>
        </Card>
    );
};

export default CampaignCard;
