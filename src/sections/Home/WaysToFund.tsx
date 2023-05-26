import {ActionIcon, Box, Flex, Image, Paper, SimpleGrid, Stack, Text} from "@mantine/core";
import {IconChevronRight} from "@tabler/icons-react"
import {TitleBadge} from "../../components";

const WaysToFundSection = () => {
  return (
    <Box>
      <Flex>
        <Stack>
          <TitleBadge title="Make your impact"/>
          <Text>Fundraise for...</Text>
        </Stack>
        <SimpleGrid cols={3}>
          <Paper>
            <Image
              src="https://images.unsplash.com/photo-1518101645466-7795885ff8f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
            <Text>Yourself</Text>
            <ActionIcon>
              <IconChevronRight/>
            </ActionIcon>
          </Paper>
          <Paper>
            <Image
              src="https://images.unsplash.com/photo-1674574124649-778f9afc0e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
            <Text>Friends & Family</Text>
            <ActionIcon>
              <IconChevronRight/>
            </ActionIcon>
          </Paper>
          <Paper>
            <Image
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"/>
            <Text>Charity</Text>
            <ActionIcon>
              <IconChevronRight/>
            </ActionIcon>
          </Paper>
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

export default WaysToFundSection;
