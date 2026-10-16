import {Button, Center, Container, Group, Overlay, Stack, Text, Title} from '@mantine/core';
import {IconRocket} from "@tabler/icons-react";
import {Link} from "react-router-dom";
import classes from "./Hero.module.css";

const HeroSection = () => {
    return (
        <div className={classes.wrapper}>
            <Overlay color="#000" opacity={0.65} zIndex={1}/>

            <div className={classes.inner}>
                <Container>
                    <Stack gap="xl">
                        <Center>
                            <Group gap={4} className={classes.badge}>
                                <IconRocket stroke={1.5}/>
                                <Text tt="uppercase">Make it Happen</Text>
                            </Group>
                        </Center>
                        <Title className={classes.title}>
                            Help the people, make <Text
                            component="span"
                            inherit
                            variant="gradient"
                            gradient={{from: 'lime.5', to: 'green.4'}}
                        >big changes</Text> and <Text
                            component="span"
                            inherit
                            variant="gradient"
                            gradient={{from: 'green.4', to: 'lime.5'}}
                        >help this world.</Text>
                        </Title>
                        <Text size="lg" className={classes.description}>
                            Join us and be part of something special. Together we can make a difference and bring your
                            dreams to
                            reality.
                        </Text>
                    </Stack>
                </Container>

                <div className={classes.controls}>
                    <Button className={classes.control} variant="white" size="lg" component={Link} to="/create-campaign">
                        Start a campaign
                    </Button>
                    <Button className={classes.control} variant="white" size="lg" component={Link} to="/campaigns">
                        Explore now
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
