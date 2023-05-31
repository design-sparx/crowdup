import {Avatar, Button, Flex, Paper, PaperProps, Stack, Text} from '@mantine/core';
import userData from "../data/User.json"

type IProps = PaperProps

const UserCard = ({...others}: IProps) => {
    return (
        <Paper{...others}>
            <Flex gap="lg">
                <Avatar src={userData.avatar} size={120} radius={120}/>
                <Stack spacing="sm" align="flex-start">
                    <Text ta="center" fz="lg" weight={500}>
                        {userData.name}
                    </Text>
                    <Text ta="center" c="dimmed" fz="sm">
                        {userData.email} • {userData.job}
                    </Text>

                    <Button variant="default" fullWidth>
                        Send message
                    </Button>
                </Stack>
            </Flex>
        </Paper>
    );
}

export default UserCard;
