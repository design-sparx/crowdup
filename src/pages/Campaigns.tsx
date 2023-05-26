import {ActionIcon, Container, Flex, Paper, Select, SimpleGrid, Stack, TextInput, Title, Tooltip} from "@mantine/core";
import campaignsData from "../data/Campaigns.json";
import {CampaignCard} from "../components";
import {IconLayoutGrid, IconListDetails} from "@tabler/icons-react";
import {PublicLayout} from "../layout";
import {Helmet} from "react-helmet";

const CampaignsPage = (): JSX.Element => {
    const items = campaignsData.data.map(c => (<CampaignCard key={c.id} data={c} showActions={true}/>))

    return (
        <>
            <Helmet>
                <title>Discover campaigns to fund</title>
            </Helmet>
            <PublicLayout compressedNav={false}>
                <Container size="lg">
                    <Stack>
                        <Paper>
                            <Title>Discover campaigns to fund</Title>
                        </Paper>
                        <Flex justify="space-between">
                            <TextInput placeholder="search campaigns..." sx={{width: 500}}/>
                            <Flex align="center" gap="sm">
                                <Tooltip label="list">
                                    <ActionIcon>
                                        <IconListDetails/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="grid">
                                    <ActionIcon>
                                        <IconLayoutGrid/>
                                    </ActionIcon>
                                </Tooltip>
                                <Select
                                    label=""
                                    placeholder=""
                                    value="50"
                                    data={[
                                        {value: '10', label: 'show: 10'},
                                        {value: '25', label: 'show: 25'},
                                        {value: '50', label: 'show: 50'},
                                        {value: '100', label: 'show: 100'},
                                    ]}
                                />
                                <Select
                                    label=""
                                    placeholder="sort by"
                                    value="featured"
                                    data={[
                                        {value: 'featured', label: 'sort by: featured'},
                                        {value: 'popular', label: 'sort by: popular'},
                                        {value: 'latest', label: 'sorty by: latest'},
                                    ]}
                                />
                            </Flex>
                        </Flex>
                        <SimpleGrid cols={3} spacing="lg">
                            {items}
                        </SimpleGrid>
                    </Stack>
                </Container>
            </PublicLayout>
        </>
    );
};

export default CampaignsPage;
