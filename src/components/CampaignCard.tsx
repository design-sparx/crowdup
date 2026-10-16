import {
    Badge,
    Card,
    Flex,
    Group,
    Image,
    PaperProps,
    Progress,
    Stack,
    Text,
} from '@mantine/core';
import {ICampaign} from "../types";
import {Link} from "react-router";
import classes from "./CampaignCard.module.css";

interface IProps extends PaperProps {
    data: ICampaign
    showActions?: boolean
}

const CampaignCard = ({data, showActions}: IProps) => {
    const {
        mainImage,
        id,
        title,
        amountRaised,
        daysLeft,
        contributors,
        description,
        category,
        country
    } = data;
    const linkProps = {to: `/campaigns/${id}`, rel: 'noopener noreferrer'};

    return (
        <Card radius="sm" shadow="md" ml="xs" component={Link} {...linkProps} className={classes.card}>
            <Card.Section>
                <Image src={mainImage} height={280} className={classes.image}/>
            </Card.Section>

            <Card.Section pt={0} px="md" pb="md">
                <Stack>
                    <Text className={classes.title} lineClamp={1} fw={500} size="lg">
                        {title}
                    </Text>

                    <Group justify="space-between">
                        <Text size="xs" tt="uppercase" c="dimmed" fw={700}>{country}</Text>
                        <Badge variant="dot" color="secondary">{category}</Badge>
                    </Group>

                    {showActions && <Text lineClamp={3} size="sm">{description}</Text>}

                    <Progress value={daysLeft}/>

                    <Flex justify="space-between">
                        <Text><b>{amountRaised}</b> raised</Text>
                        <Text><b>{contributors}</b> donations</Text>
                    </Flex>

                    {/*{showActions && <Button>Donate Now</Button>}*/}
                </Stack>
            </Card.Section>
        </Card>
    );
};

export default CampaignCard;
