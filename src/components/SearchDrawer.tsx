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
            <Center style={{minHeight: '80vh'}}>
                <Stack gap="lg" style={{width: matchesMobile ? '75%' : '60%'}}>
                    <Title>Search</Title>
                    <TextInput
                        size={matchesMobile ? "sm" : "lg"}
                        leftSection={<IconSearch size={24}/>}
                        placeholder="Try searching people, titles and hashtags"
                    />
                    <SimpleGrid cols={{base: 1, md: 2}} spacing={{base: "md", md: "lg"}}>
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
