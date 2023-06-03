import {Button, Center, Drawer, DrawerProps, Group, Stack, TextInput, Title} from "@mantine/core";
import {IconSearch} from "@tabler/icons-react";
import {CategorySelect, CountrySelect} from "./index";

type IProps = Pick<DrawerProps, 'opened' | 'onClose' | 'size'>

const SearchDrawer = ({...others}: IProps) => {
    return (
        <Drawer
            position="bottom"
            title=""
            size="100%"
            {...others}
        >
            <Center sx={{minHeight: '80vh'}}>
                <Stack spacing="lg">
                    <Title>Search</Title>
                    <TextInput
                        size="lg"
                        icon={<IconSearch size={24}/>}
                        placeholder="Try searching people, titles and hashtags"
                    />
                    <Group grow>
                        <CategorySelect/>
                        <CountrySelect/>
                    </Group>
                    <Button size="md" mt="lg">Search</Button>
                </Stack>
            </Center>
        </Drawer>
    );
};

export default SearchDrawer;
