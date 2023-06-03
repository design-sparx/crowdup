import {Box, BoxProps, Container, Flex, Select, SimpleGrid, Stack, TextInput, Title, TitleProps} from "@mantine/core";
import campaignsData from "../data/Campaigns.json";
import {CampaignCard} from "../components";
import {PublicLayout} from "../layout";
import {Helmet} from "react-helmet";
import {useMediaQuery} from "@mantine/hooks";

const CampaignsPage = (): JSX.Element => {
    const matchesMobile = useMediaQuery('(max-width: 600px)');

    const boxProps: BoxProps = {
        mt: matchesMobile ? 4 : 96,
        mb: matchesMobile ? 4 : 136,
        py: matchesMobile ? 16 : 48
    }

    const titleProps: TitleProps = {
        size: 32,
        weight: 700,
        mb: "lg",
        transform: 'capitalize',
        sx: {lineHeight: '40px'}
    }

    const items = campaignsData.data.map(c => (<CampaignCard key={c.id} data={c} showActions={true}/>))

    return (
        <>
            <Helmet>
                <title>Discover campaigns to fund</title>
            </Helmet>
            <PublicLayout compressedNav={false}>
                <Container size="lg">
                    <Stack>
                        <Box {...boxProps}>
                            <Title {...titleProps} align="center">Discover campaigns to fund</Title>
                        </Box>
                        <Flex
                            justify="space-between"
                            gap={{base: 'sm', sm: 'lg'}}
                            direction={{base: 'column-reverse', sm: 'row'}}
                        >
                            <TextInput placeholder="search campaigns..." sx={{width: 500}}/>
                            <Flex align="center" gap="sm" justify={{base: 'space-between', sm: 'flex-start'}}>
                                <Select
                                    label=""
                                    placeholder="campaigns in"
                                    defaultValue=""
                                    data={[
                                        {value: '10', label: 'show: 10'},
                                        {value: '25', label: 'show: 25'},
                                        {value: '50', label: 'show: 50'},
                                        {value: '100', label: 'show: 100'},
                                    ]}
                                />
                                <Select
                                    label=""
                                    placeholder="Explore"
                                    defaultValue="featured"
                                    data={[
                                        {value: 'featured', label: 'sort by: featured'},
                                        {value: 'popular', label: 'sort by: popular'},
                                        {value: 'latest', label: 'sorty by: latest'},
                                    ]}
                                />
                            </Flex>
                        </Flex>
                        <SimpleGrid
                            cols={3}
                            spacing="lg"
                            breakpoints={[
                                {maxWidth: 'md', cols: 2, spacing: 'md'},
                                {maxWidth: 'sm', cols: 1, spacing: 0},
                            ]}
                        >
                            {items}
                        </SimpleGrid>
                    </Stack>
                </Container>
            </PublicLayout>
        </>
    );
};

export default CampaignsPage;
