import {Button, Container, createStyles, Group, Image, rem, Stack, Text, Title,} from '@mantine/core';
import image from '../assets/img/404.png';
import {BackButton} from "./index";

const useStyles = createStyles((theme) => ({
    root: {
        paddingTop: rem(80),
        paddingBottom: rem(80),
    },

    label: {
        textAlign: 'center',
        fontWeight: 900,
        fontSize: rem(220),
        lineHeight: 1,
        marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],

        [theme.fn.smallerThan('sm')]: {
            fontSize: rem(120),
        },
    },

    title: {
        textAlign: 'center',
        fontWeight: 900,
        fontSize: rem(38),
        marginBottom: theme.spacing.lg,

        [theme.fn.smallerThan('sm')]: {
            fontSize: rem(32),
        },
    },

    description: {
        maxWidth: rem(500),
        margin: 'auto',
        marginTop: theme.spacing.xl,
        marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    },

    control: {
        [theme.fn.smallerThan('sm')]: {
            width: '100%',
        },
    },
}));
const NotFound = () => {
    const {classes} = useStyles();

    return (
        <Container className={classes.root}>
            <Stack>
                <Image src={image} height={320} fit="contain"/>
                <div>
                    <Title className={classes.title}>Something is not right...</Title>
                    <Text color="dimmed" size="lg">
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
