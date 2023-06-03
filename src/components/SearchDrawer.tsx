import {Button, Center, Drawer, DrawerProps, SimpleGrid, Stack, TextInput, Title} from "@mantine/core";
import {IconSearch} from "@tabler/icons-react";
import {CategorySelect, CountrySelect} from "./index";
import {useMediaQuery} from "@mantine/hooks";

type IProps = Pick<DrawerProps, 'opened' | 'onClose' | 'size'>

const SearchDrawer = ({...others}: IProps) => {
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Drawer
            position="bottom"
            title=""
            size="100%"
            {...others}
        >
            <Center sx={{minHeight: '80vh'}}>
                <Stack spacing="lg" sx={{width: matchesMobile ? '75%' : '60%'}}>
                    <Title>Search</Title>
                    <TextInput
                        size={matchesMobile ? "sm" : "lg"}
                        icon={<IconSearch size={24}/>}
                        placeholder="Try searching people, titles and hashtags"
                    />
                    <SimpleGrid cols={2} spacing="lg" breakpoints={[{maxWidth: 'md', cols: 1, spacing: 'md'}]}>
                        <CategorySelect/>
                        <CountrySelect/>
                    </SimpleGrid>
                    <Button size="md" mt="lg">Search</Button>
                </Stack>
            </Center>
        </Drawer>
    );
};

export default SearchDrawer;
