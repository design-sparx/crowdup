import {useState} from "react";
import {Avatar, Group, Menu, Text, UnstyledButton} from '@mantine/core';
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
import clsx from "clsx";
import classes from "./UserButton.module.css";

const UserButton = () => {
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
                <UnstyledButton className={clsx(classes.user, {[classes.userActive]: userMenuOpened})}>
                    <Group>
                        <Avatar src={userData?.avatar} radius="xl"/>

                        <div style={{flex: 1}}>
                            <Text size="sm" fw={500}>
                                {userData.name}
                            </Text>

                            <Text c="dimmed" size="xs">
                                {userData.email}
                            </Text>
                        </div>

                        <IconChevronRight size="0.9rem" stroke={1.5}/>
                    </Group>
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconHeart size="0.9rem" color="var(--mantine-color-red-6)" stroke={1.5}/>}
                >
                    Liked posts
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconStar size="0.9rem" color="var(--mantine-color-yellow-6)" stroke={1.5}/>}
                >
                    Saved posts
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconMessage size="0.9rem" color="var(--mantine-color-blue-6)" stroke={1.5}/>}
                >
                    Your comments
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item leftSection={<IconSettings size="0.9rem" stroke={1.5}/>}>
                    Account settings
                </Menu.Item>
                <Menu.Item leftSection={<IconSwitchHorizontal size="0.9rem" stroke={1.5}/>}>
                    Change account
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size="0.9rem" stroke={1.5}/>}>Logout</Menu.Item>

                <Menu.Divider/>

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item leftSection={<IconPlayerPause size="0.9rem" stroke={1.5}/>}>
                    Pause subscription
                </Menu.Item>
                <Menu.Item color="red" leftSection={<IconTrash size="0.9rem" stroke={1.5}/>}>
                    Delete account
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

export default UserButton;
