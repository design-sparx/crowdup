import {
    ActionIcon,
    AppShell,
    Avatar,
    Box,
    BoxProps,
    Burger,
    Container,
    Drawer,
    Group,
    Menu,
    rem,
    ScrollArea,
    Text,
    UnstyledButton,
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {
    IconBell,
    IconChevronDown,
    IconHeart,
    IconLogout,
    IconMessage,
    IconSearch,
    IconSettings,
    IconStar,
} from '@tabler/icons-react';
import {useState} from "react";
import {useRouteLoaderData} from "react-router";
import {AppLinks, BrandName, SearchDrawer} from "./index";
import clsx from "clsx";
import classes from "./AppNavbar.module.css";

const ICON_SIZE = 18

type IProps = BoxProps

const AppNavbar = ({...others}: IProps) => {
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const [searchOpened, {toggle: toggleSearchDrawer, close: closeSearchDrawer}] = useDisclosure(false);
    const matchesMobile = useMediaQuery('(max-width: 600px)');
    const account = useRouteLoaderData<{account: {name: string; avatar: string | null}}>("routes/dashboard-layout")?.account;
    const user = {name: account?.name ?? "Account", image: account?.avatar ?? undefined};

    return (
        <Box {...others}>
            <AppShell.Header
                className={classes.header}
            >
                <Container
                    fluid
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        className={classes.hiddenDesktop}
                        color="white"
                    />

                    <Group justify="space-between" style={{width: '100%'}}>
                        <Group>
                            <BrandName
                                size={24}
                                ml={matchesMobile ? 'md' : 'xs'}
                                asLink
                                variant="grayscale"
                            />
                            <AppLinks className={classes.hiddenMobile}/>
                        </Group>
                        <Group>
                            <ActionIcon variant="filled" color="white" onClick={toggleSearchDrawer}>
                                <IconSearch size={ICON_SIZE}/>
                            </ActionIcon>
                            <ActionIcon variant="filled" color="white">
                                <IconBell size={ICON_SIZE}/>
                            </ActionIcon>
                            <Menu
                                width={260}
                                position="bottom-end"
                                transitionProps={{transition: 'pop-top-right'}}
                                onClose={() => setUserMenuOpened(false)}
                                onOpen={() => setUserMenuOpened(true)}
                                withinPortal
                            >
                                <Menu.Target>
                                    <UnstyledButton
                                        className={clsx(classes.user, {[classes.userActive]: userMenuOpened})}
                                    >
                                        <Group gap={7}>
                                            <Avatar
                                                src={user.image}
                                                alt={user.name}
                                                radius="xl"
                                                size={matchesMobile ? 18 : 20}
                                            />
                                            {!matchesMobile &&
                                                <>
                                                    <Text fw={500} size="sm" style={{lineHeight: 1}} mr={3}>
                                                        {user.name}
                                                    </Text>
                                                    <IconChevronDown size={rem(12)} stroke={1.5}/>
                                                </>}
                                        </Group>
                                    </UnstyledButton>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconHeart
                                            size="0.9rem"
                                            color="var(--mantine-color-red-6)"
                                            stroke={1.5}
                                        />}
                                    >
                                        Liked posts
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconStar
                                            size="0.9rem"
                                            color="var(--mantine-color-yellow-6)"
                                            stroke={1.5}/>}
                                    >
                                        Saved posts
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconMessage
                                            size="0.9rem"
                                            color="var(--mantine-color-blue-6)"
                                            stroke={1.5}/>}
                                    >
                                        Your comments
                                    </Menu.Item>

                                    <Menu.Label>Settings</Menu.Label>
                                    <Menu.Item leftSection={<IconSettings size="0.9rem" stroke={1.5}/>}>
                                        Account settings
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconLogout size="0.9rem" stroke={1.5}/>}>Logout</Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                className={classes.hiddenDesktop}
                classNames={{header: classes.drawerHeader, close: classes.close}}
                zIndex={1000000}
            >
                <ScrollArea h="100vh" mx="-md" className={classes.drawerBody}>
                    <AppLinks direction='column'/>
                </ScrollArea>
            </Drawer>

            <SearchDrawer opened={searchOpened} onClose={closeSearchDrawer}/>
        </Box>
    );
}

export default AppNavbar;
