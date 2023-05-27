import {Box, BoxProps, Button, Flex, Image, Stack, TextProps, Title, TitleProps} from "@mantine/core";

import HandFlowerImg from "../../assets/img/lotus-flower.png"
import {Link} from "react-router-dom";

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps,
    subtitleProps?: TextProps
}

const GetStartedSection = ({boxProps, titleProps}: IProps) => {
    return (
        <Box {...boxProps}>
            <Flex align="center">
                <Stack>
                    <Title {...titleProps}>Ready to get started? Join thousands of others today.</Title>
                    <Flex gap="sm">
                        <Button size="lg" variant="filled" component={Link} to="/create-campaign">Start a
                            Campaign</Button>
                        <Button size="lg" variant="outline" component={Link} to="/how-it-works">How it Works</Button>
                    </Flex>
                </Stack>
                <Image src={HandFlowerImg} height={240} width={240} fit="contain"/>
            </Flex>
        </Box>
    );
};

export default GetStartedSection;
