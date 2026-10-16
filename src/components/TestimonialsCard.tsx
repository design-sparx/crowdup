import {Divider, Grid, Group, Image, Paper, PaperProps, Stack, Text,} from '@mantine/core';
import {ITestimonial} from "../types";
import {useMediaQuery} from "@mantine/hooks";
import classes from "./TestimonialsCard.module.css";

interface IProps extends PaperProps {
    data: ITestimonial
}

const CampaignCard = ({data, ...others}: IProps) => {
    const {
        company, createdByImage, createdBy, testimonial, jobPosition
    } = data;
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Paper radius="md" className={classes.card} mx={36} {...others}>
            <Grid style={{alignItems: 'center'}}>
                {matchesMobile && <Grid.Col span={{base: 12, lg: 5}}>
                    <Image src={createdByImage} h={360} fit="cover"/>
                </Grid.Col>}
                <Grid.Col span={{base: 12, lg: 7}} pl={matchesMobile ? 'xl' : 'xl'} pb="xl">
                    <Stack gap="sm">
                        <Text size="xl">"{testimonial}"</Text>
                        <Text fw={700}>{createdBy}</Text>
                        <Group>
                            <Text size="md" fs="italic">{jobPosition}</Text>
                            <Divider orientation="vertical"/>
                            <Text size="md" td="underline">{company}</Text>
                        </Group>
                    </Stack>
                </Grid.Col>
                {!matchesMobile && <Grid.Col span={{base: 12, lg: 5}}>
                    <Image src={createdByImage} h={320} fit="cover"/>
                </Grid.Col>}
            </Grid>
        </Paper>
    );
};

export default CampaignCard;
