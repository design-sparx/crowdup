import {Box, BoxProps, Button, Container, Flex, Group, Pagination, Select, SimpleGrid, Stack, Text, TextInput, Title, TitleProps} from "@mantine/core";
import {Form, useNavigate, useSearchParams} from "react-router";
import {CampaignCard} from "../components";
import {useMediaQuery} from "@mantine/hooks";
import countriesData from "../data/Countries.json";
import type {Campaign} from "../lib/campaigns/types";
import type {CampaignSearch} from "../lib/campaigns/params";

interface IProps {
    items: Campaign[]
    total: number
    categories: string[]
    search: CampaignSearch
    pageSize: number
}

const countryOptions = countriesData.data.map(c => ({value: c.code, label: c.name}));

const CampaignsPage = ({items, total, categories, search, pageSize}: IProps) => {
    const matchesMobile = useMediaQuery('(max-width: 768px)');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const boxProps: BoxProps = {
        mt: matchesMobile ? 4 : 24,
        mb: matchesMobile ? 4 : 48,
        py: matchesMobile ? 16 : 24
    }

    const titleProps: TitleProps = {
        size: 32,
        fw: 700,
        mb: "lg",
        tt: 'capitalize',
        style: {lineHeight: '40px'}
    }

    const goTo = (changes: Record<string, string | null>) => {
        const next = new URLSearchParams(searchParams);
        for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value); else next.delete(key);
        }
        navigate(`/campaigns?${next.toString()}`);
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <Box>
            <Container size="lg">
                <Stack>
                    <Box {...boxProps}>
                        <Title {...titleProps} ta="center">Discover campaigns to fund</Title>
                    </Box>
                    <Flex
                        justify="space-between"
                        gap={{base: 'sm', sm: 'lg'}}
                        direction={{base: 'column', sm: 'row'}}
                    >
                        <Form method="get" role="search" style={{flex: 1}}>
                            <Group wrap="nowrap">
                                <TextInput
                                    name="q"
                                    aria-label="Search campaigns"
                                    placeholder="search campaigns..."
                                    defaultValue={search.q ?? ""}
                                    style={{flex: 1}}
                                />
                                {search.category && <input type="hidden" name="category" value={search.category}/>}
                                {search.country && <input type="hidden" name="country" value={search.country}/>}
                                <Button type="submit">Search</Button>
                            </Group>
                        </Form>
                        <Flex align="center" gap="sm" justify={{base: 'space-between', sm: 'flex-start'}}>
                            <Select
                                aria-label="Category"
                                placeholder="All categories"
                                clearable
                                data={categories}
                                value={search.category ?? null}
                                onChange={(v) => goTo({category: v, page: null})}
                            />
                            <Select
                                aria-label="Country"
                                placeholder="All countries"
                                clearable
                                searchable
                                data={countryOptions}
                                value={search.country ?? null}
                                onChange={(v) => goTo({country: v, page: null})}
                            />
                        </Flex>
                    </Flex>
                    {items.length === 0 ?
                        <Text ta="center" c="dimmed" py="xl">No campaigns match your search.</Text> :
                        <SimpleGrid
                            cols={{base: 1, sm: 2, md: 3}}
                            spacing={{base: 0, sm: 'md', md: 'lg'}}
                        >
                            {items.map(c => (<CampaignCard key={c.id} data={c} showActions={true}/>))}
                        </SimpleGrid>
                    }
                    {totalPages > 1 &&
                        <Pagination
                            total={totalPages}
                            value={search.page}
                            onChange={(p) => goTo({page: String(p)})}
                            mx="auto"
                        />
                    }
                </Stack>
            </Container>
        </Box>
    );
};

export default CampaignsPage;
