import {Box, BoxProps, TextProps, Title, TitleProps} from '@mantine/core'
import {CampaignCard, TitleBadge} from "../../components";
import {Carousel} from "@mantine/carousel";

import campaignsData from "../../data/Campaigns.json";

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps,
    subtitleProps?: TextProps
}

const CampaignsSection = ({boxProps, titleProps}: IProps) => {
    const slides = campaignsData.data.map(c => (<Carousel.Slide key={c.id}><CampaignCard data={c}/></Carousel.Slide>))

    return (
        <Box {...boxProps}>
            <TitleBadge title="Happening near you"/>
            <Title {...titleProps}>Fundraisers in your community</Title>
            <Carousel
                slideSize="45%"
                align="start"
                slideGap="md"
                breakpoints={[
                    {maxWidth: 'md', slideSize: '45%'},
                    {maxWidth: 'sm', slideSize: '100%', slideGap: 0},
                ]}
            >
                {slides}
            </Carousel>
        </Box>
    );
};

export default CampaignsSection;
