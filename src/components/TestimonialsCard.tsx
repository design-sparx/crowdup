import {createStyles, Divider, Grid, Group, Image, Paper, PaperProps, rem, Stack, Text,} from '@mantine/core';
import {ITestimonial} from "../types";
import {useMediaQuery} from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backdropFilter: `blur(16px) saturate(180%)`,
        backgroundColor: `rgba(255, 255, 255, 0.75)`,
        border: `1px solid rgba(209, 213, 219, 0.3)`,
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
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Paper radius="md" className={classes.card} mx={36} {...others}>
            <Grid sx={{alignItems: 'center'}}>
                {matchesMobile && <Grid.Col lg={5}>
                    <Image src={createdByImage} height={360} fit="cover"/>
                </Grid.Col>}
                <Grid.Col lg={7} pl={matchesMobile ? 'xl' : 'xl'} pb="xl">
                    <Stack spacing="sm">
                        <Text size="xl">"{testimonial}"</Text>
                        <Text fw={700}>{createdBy}</Text>
                        <Group>
                            <Text size="md" fs="italic">{jobPosition}</Text>
                            <Divider orientation="vertical"/>
                            <Text size="md" td="underline">{company}</Text>
                        </Group>
                    </Stack>
                </Grid.Col>
                {!matchesMobile && <Grid.Col lg={5}>
                    <Image src={createdByImage} height={320} fit="cover"/>
                </Grid.Col>}
            </Grid>
        </Paper>
    );
};

export default CampaignCard;
