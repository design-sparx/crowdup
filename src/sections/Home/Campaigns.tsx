import {Box, Title} from '@mantine/core'
import {CampaignCard, TitleBadge} from "../../components";
import {Carousel} from "@mantine/carousel";

import campaignsData from "../../data/Campaigns.json";

const CampaignsSection = () => {
    const slides = campaignsData.data.map(c => (<Carousel.Slide key={c.id}><CampaignCard data={c}/></Carousel.Slide>))

    return (
        <Box>
            <TitleBadge title="Happening near you"/>
            <Title>Fundraisers in your community</Title>
            <Carousel slideSize="29%" align="start" slideGap="lg">
                {slides}
            </Carousel>
        </Box>
    );
};

export default CampaignsSection;
