import {Box, BoxProps, Button, Flex, Image, Stack, Text} from "@mantine/core";

import HandFlowerImg from "../../assets/img/lotus-flower.png"

type IProps = BoxProps
const GetStartedSection = ({...boxProps}: IProps) => {
    return (
        <Box {...boxProps}>
            <Flex>
                <Stack>
                    <Text>Ready to get started? Join thousands of others today.</Text>
                    <Flex>
                        <Button>Start a Campaign</Button>
                        <Button>How it Works</Button>
                    </Flex>
                </Stack>
                <Image src={HandFlowerImg}/>
            </Flex>
        </Box>
    );
};

export default GetStartedSection;
