import {Avatar, Button, Flex, Paper, PaperProps, Stack, Text} from '@mantine/core';
import {IconSend} from "@tabler/icons-react";
import userData from "../data/User.json"

interface IProps extends PaperProps {
    name?: string
    avatar?: string | null
}

const UserCard = ({name, avatar, ...others}: IProps) => {
    return (
        <Paper{...others}>
            <Flex gap="lg" align="center">
                <Avatar src={avatar === undefined ? userData.avatar : avatar} size={120} radius={120}/>
                <Stack gap="xs" align="flex-start">
                    <Text ta="center" fz="lg" fw={500}>
                        {name ?? userData.name}
                    </Text>
                    <Text ta="center" c="dimmed" fz="sm">
                        {userData.email} • {userData.job}
                    </Text>

                    <Button variant="light" leftSection={<IconSend size={18}/>} fullWidth>
                        Send message
                    </Button>
                </Stack>
            </Flex>
        </Paper>
    );
}

export default UserCard;
