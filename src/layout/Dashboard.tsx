import {ReactNode, useState} from 'react';
import {
    ActionIcon,
    AppShell,
    Avatar,
    Burger,
    Container,
    createStyles,
    Group,
    Header,
    MediaQuery,
    Menu,
    rem,
    Text,
    UnstyledButton
} from '@mantine/core';
import {AppLinks, BrandName, SearchDrawer} from "../components";
import {
    IconBell,
    IconChevronDown,
    IconHeart,
    IconLogout,
    IconMessage,
    IconSearch,
    IconSettings,
    IconStar
} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
    header: {
        backgroundColor: theme.colors.primary[6]
    },
    user: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[0],
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.sm,
        transition: 'background-color 100ms ease',

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.primary[7],
        },

        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },
    userActive: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },
}));

const user = {
    "name": "Jane Spoonfighter",
    "email": "janspoon@fighter.dev",
    "image": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
}

const ICON_SIZE = 18

interface IProps {
    children: ReactNode
}

const DashboardLayout = ({children}: IProps) => {
    const {classes, theme, cx} = useStyles();
    const [opened, setOpened] = useState(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const [searchOpened, {toggle: toggleSearchDrawer, close: closeSearchDrawer}] = useDisclosure(false);

    return (
        <>
            <AppShell
                styles={{
                    main: {
                        background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                navbar={<></>}
                header={
                    <Header
                        height={{base: 50, md: 70}}
                        className={classes.header}
                    >
                        <Container
                            fluid
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                            }}
                        >
                            <MediaQuery largerThan="sm" styles={{display: 'none'}}>
                                <Burger
                                    opened={opened}
                                    onClick={() => setOpened((o) => !o)}
                                    size="sm"
                                    color={theme.colors.gray[6]}
                                    mr="xl"
                                />
                            </MediaQuery>

                            <Group position="apart" sx={{width: '100%'}}>
                                <Group>
                                    <BrandName size={24} asLink variant="grayscale"/>
                                    <AppLinks/>
                                </Group>
                                <Group>
                                    <ActionIcon variant="filled" color={theme.white} onClick={toggleSearchDrawer}>
                                        <IconSearch size={ICON_SIZE}/>
                                    </ActionIcon>
                                    <ActionIcon variant="filled" color={theme.white}>
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
                                                className={cx(classes.user, {[classes.userActive]: userMenuOpened})}
                                            >
                                                <Group spacing={7}>
                                                    <Avatar src={user.image} alt={user.name} radius="xl" size={20}/>
                                                    <Text weight={500} size="sm" sx={{lineHeight: 1}} mr={3}>
                                                        {user.name}
                                                    </Text>
                                                    <IconChevronDown size={rem(12)} stroke={1.5}/>
                                                </Group>
                                            </UnstyledButton>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                icon={<IconHeart
                                                    size="0.9rem"
                                                    color={theme.colors.red[6]}
                                                    stroke={1.5}
                                                />}
                                            >
                                                Liked posts
                                            </Menu.Item>
                                            <Menu.Item
                                                icon={<IconStar
                                                    size="0.9rem"
                                                    color={theme.colors.yellow[6]}
                                                    stroke={1.5}/>}
                                            >
                                                Saved posts
                                            </Menu.Item>
                                            <Menu.Item
                                                icon={<IconMessage
                                                    size="0.9rem"
                                                    color={theme.colors.blue[6]}
                                                    stroke={1.5}/>}
                                            >
                                                Your comments
                                            </Menu.Item>

                                            <Menu.Label>Settings</Menu.Label>
                                            <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5}/>}>
                                                Account settings
                                            </Menu.Item>
                                            <Menu.Item
                                                icon={<IconLogout size="0.9rem" stroke={1.5}/>}>Logout</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Group>
                        </Container>
                    </Header>
                }
            >
                {children}
            </AppShell>
            <SearchDrawer opened={searchOpened} onClose={closeSearchDrawer}/>
        </>
    );
}

export default DashboardLayout;
