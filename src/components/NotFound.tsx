import {Button, Container, Group, Image, Stack, Text, Title,} from '@mantine/core';
import image from '../assets/img/404.png';
import {BackButton} from "./index";
import classes from "./NotFound.module.css";

const NotFound = () => {
    return (
        <Container className={classes.root}>
            <Stack>
                <Image src={image} height={320} fit="contain"/>
                <div>
                    <Title className={classes.title}>Something is not right...</Title>
                    <Text c="dimmed" size="lg">
                        Page you are trying to open does not exist. You may have mistyped the address, or the
                        page has been moved to another URL. If you think this is an error contact support.
                    </Text>
                    <Group mt="xl">
                        <Button variant="outline" size="md" className={classes.control} component="a" href="/">
                            Get back to home page
                        </Button>
                        <BackButton variant="outline" size="md" className={classes.control}/>
                    </Group>
                </div>
            </Stack>
        </Container>
    );
}

export default NotFound
