import {Avatar, Button, Paper, Text} from '@mantine/core';
import userData from "../data/User.json"

const UserCard = () => {
    return (
        <Paper
            radius="md"
            withBorder
            p="lg"
            sx={(theme) => ({
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            })}
        >
            <Avatar src={userData.avatar} size={120} radius={120} mx="auto"/>
            <Text ta="center" fz="lg" weight={500} mt="md">
                {userData.name}
            </Text>
            <Text ta="center" c="dimmed" fz="sm">
                {userData.email} • {userData.job}
            </Text>

            <Button variant="default" fullWidth mt="md">
                Send message
            </Button>
        </Paper>
    );
}

export default UserCard;
