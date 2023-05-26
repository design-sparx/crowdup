import {useState} from "react";
import {Avatar, createStyles, Group, Menu, Text, UnstyledButton} from '@mantine/core';
import {
    IconChevronRight,
    IconHeart,
    IconLogout,
    IconMessage,
    IconPlayerPause,
    IconSettings,
    IconStar,
    IconSwitchHorizontal,
    IconTrash
} from '@tabler/icons-react';
import userData from "../data/User.json"

const useStyles = createStyles((theme) => ({
    user: {
        display: 'block',
        width: '100%',
        padding: theme.spacing.md,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
    },
    userActive: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },
}));

const UserButton = () => {
    const {classes, theme, cx} = useStyles();
    const [userMenuOpened, setUserMenuOpened] = useState(false);

    return (
        <Menu
            width={260}
            position="bottom-end"
            transitionProps={{transition: 'pop-top-right'}}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
        >
            <Menu.Target>
                <UnstyledButton className={cx(classes.user, {[classes.userActive]: userMenuOpened})}>
                    <Group>
                        <Avatar src={userData?.avatar} radius="xl"/>

                        <div style={{flex: 1}}>
                            <Text size="sm" weight={500}>
                                {userData.name}
                            </Text>

                            <Text color="dimmed" size="xs">
                                {userData.email}
                            </Text>
                        </div>

                        <IconChevronRight size="0.9rem" stroke={1.5}/>
                    </Group>
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    icon={<IconHeart size="0.9rem" color={theme.colors.red[6]} stroke={1.5}/>}
                >
                    Liked posts
                </Menu.Item>
                <Menu.Item
                    icon={<IconStar size="0.9rem" color={theme.colors.yellow[6]} stroke={1.5}/>}
                >
                    Saved posts
                </Menu.Item>
                <Menu.Item
                    icon={<IconMessage size="0.9rem" color={theme.colors.blue[6]} stroke={1.5}/>}
                >
                    Your comments
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5}/>}>
                    Account settings
                </Menu.Item>
                <Menu.Item icon={<IconSwitchHorizontal size="0.9rem" stroke={1.5}/>}>
                    Change account
                </Menu.Item>
                <Menu.Item icon={<IconLogout size="0.9rem" stroke={1.5}/>}>Logout</Menu.Item>

                <Menu.Divider/>

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item icon={<IconPlayerPause size="0.9rem" stroke={1.5}/>}>
                    Pause subscription
                </Menu.Item>
                <Menu.Item color="red" icon={<IconTrash size="0.9rem" stroke={1.5}/>}>
                    Delete account
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

export default UserButton;
