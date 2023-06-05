import {Avatar, Button, Flex, Paper, PaperProps, Stack, Text} from '@mantine/core';
import {IconSend} from "@tabler/icons-react";
import userData from "../data/User.json"

type IProps = PaperProps

const UserCard = ({...others}: IProps) => {
    return (
        <Paper{...others}>
            <Flex gap="lg" align="center">
                <Avatar src={userData.avatar} size={120} radius={120}/>
                <Stack spacing="xs" align="flex-start">
                    <Text ta="center" fz="lg" weight={500}>
                        {userData.name}
                    </Text>
                    <Text ta="center" c="dimmed" fz="sm">
                        {userData.email} • {userData.job}
                    </Text>

                    <Button variant="light" leftIcon={<IconSend size={18}/>} fullWidth>
                        Send message
                    </Button>
                </Stack>
            </Flex>
        </Paper>
    );
}

export default UserCard;
