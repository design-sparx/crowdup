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
import type {Campaign} from "../lib/campaigns/types";
import {formatMinorAmount} from "../helpers";
import {Link} from "react-router";
import classes from "./CampaignCard.module.css";

interface IProps extends PaperProps {
    data: Campaign
    showActions?: boolean
}

const CampaignCard = ({data, showActions}: IProps) => {
    const {
        imageUrl,
        slug,
        title,
        raisedAmount,
        currency,
        percentFunded,
        donorCount,
        description,
        category,
        country
    } = data;
    const linkProps = {to: `/campaigns/${slug}`};

    return (
        <Card radius="sm" shadow="md" ml="xs" component={Link} {...linkProps} className={classes.card}>
            <Card.Section>
                <Image src={imageUrl} height={280} className={classes.image}/>
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

                    <Progress value={percentFunded}/>

                    <Flex justify="space-between">
                        <Text><b>{formatMinorAmount(raisedAmount, currency)}</b> raised</Text>
                        <Text><b>{donorCount}</b> donations</Text>
                    </Flex>

                    {/*{showActions && <Button>Donate Now</Button>}*/}
                </Stack>
            </Card.Section>
        </Card>
    );
};

export default CampaignCard;
