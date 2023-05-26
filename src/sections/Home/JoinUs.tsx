import {Avatar, Box, Button, Divider, Flex, Image, Progress, Stack, Text, ThemeIcon} from "@mantine/core";
import {IconUsers, IconWorld} from "@tabler/icons-react"
import {TitleBadge} from "../../components";

const JoinUsSection = () => {
  return (
    <Box>
      <Flex>
        <Stack>
          <TitleBadge title='Open partnership - Start your journey'/>
          <Text>Almost is never enough</Text>
          <Divider/>
          <Flex gap="xs">
            <ThemeIcon size="xl">
              <IconWorld/>
            </ThemeIcon>
            <Stack spacing={2}>
              <Text>Global community</Text>
              <Text>Reach a community that can make us strong and useful.</Text>
            </Stack>
          </Flex>
          <Flex gap="xs">
            <ThemeIcon size="xl">
              <IconUsers/>
            </ThemeIcon>
            <Stack spacing={2}>
              <Text>Crowdfunding</Text>
              <Text>Affordable ceiling and are very suitable for novice funders.</Text>
            </Stack>
          </Flex>
          <Avatar.Group spacing="sm">
            <Avatar
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
              radius="xl"/>
            <Avatar
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
              radius="xl"/>
            <Avatar
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
              radius="xl"/>
            <Avatar
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
              radius="xl"/>
            <Avatar radius="xl">+5</Avatar>
          </Avatar.Group>
          <Progress value={50}/>
          <Button>Join Us</Button>
        </Stack>
        <Box mx="auto">
          <Image
            src="https://images.unsplash.com/photo-1524069290683-0457abfe42c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            width={500}
            height={400}/>
        </Box>
      </Flex>
    </Box>
  );
};

export default JoinUsSection;
