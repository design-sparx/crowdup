import {Box, BoxProps, Button, Flex, Image, Stack, TextProps, Title, TitleProps} from "@mantine/core";

import HandFlowerImg from "../../assets/img/lotus-flower.png"
import {Link} from "react-router-dom";
import {useMediaQuery} from "@mantine/hooks";

interface IProps {
    boxProps: BoxProps
    titleProps?: TitleProps,
    subtitleProps?: TextProps
}

const GetStartedSection = ({boxProps, titleProps}: IProps) => {
    const matchesMobile = useMediaQuery('(max-width: 600px)');

    return (
        <Box {...boxProps}>
            <Flex align="center" gap={{base: 'sm', sm: 'lg'}} direction={{base: 'column-reverse', sm: 'row'}}>
                <Stack align={matchesMobile ? 'center' : 'stretch'}>
                    <Title {...titleProps} align={matchesMobile ? 'center' : 'start'}>Ready to get started? Join thousands of others today.</Title>
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
