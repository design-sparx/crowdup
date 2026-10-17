import {Box, BoxProps, TextProps, Title, TitleProps} from '@mantine/core'
import {CampaignCard, TitleBadge} from "../../components";
import {Carousel} from "@mantine/carousel";

import type {Campaign} from "../../lib/campaigns/types";

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps,
    subtitleProps?: TextProps
    campaigns: Campaign[]
}

const CampaignsSection = ({boxProps, titleProps, campaigns}: IProps) => {
    const slides = campaigns.map(c => (<Carousel.Slide key={c.id}><CampaignCard data={c}/></Carousel.Slide>))

    return (
        <Box {...boxProps}>
            <TitleBadge title="Happening near you"/>
            <Title {...titleProps}>Fundraisers in your community</Title>
            <Carousel
                slideSize={{base: '100%', sm: '45%'}}
                slideGap={{base: 0, sm: 'md'}}
                emblaOptions={{align: 'start'}}
            >
                {slides}
            </Carousel>
        </Box>
    );
};

export default CampaignsSection;
