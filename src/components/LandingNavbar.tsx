import {
    Box,
    BoxProps,
    Burger,
    Button,
    Center,
    Collapse,
    Container,
    createStyles,
    Divider,
    Drawer,
    Flex,
    Group,
    Header,
    HoverCard,
    rem,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {
    IconAugmentedReality,
    IconCat,
    IconChevronDown,
    IconClipboardHeart,
    IconDeviceTv,
    IconFireHydrant,
    IconHeartHandshake,
    IconLeaf,
    IconReportMoney,
    IconSearch,
    IconSos,
} from '@tabler/icons-react';
import {useEffect, useState} from "react";
import {BrandName} from "./index";

const useStyles = createStyles((theme) => ({
    link: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,

        [theme.fn.smallerThan('sm')]: {
            height: rem(42),
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },

        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        }),
    },

    subLink: {
        width: '100%',
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        borderRadius: theme.radius.md,

        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        }),

        '&:active': theme.activeStyles,
    },

    dropdownFooter: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        margin: `calc(${theme.spacing.md} * -1)`,
        marginTop: theme.spacing.sm,
        padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
        paddingBottom: theme.spacing.xl,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
        }`,
    },

    title: {
        textAlign: 'center',
        fontWeight: 800,
        fontSize: rem(40),
        letterSpacing: -1,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        marginBottom: theme.spacing.xs,

        [theme.fn.smallerThan('xs')]: {
            fontSize: rem(28),
            textAlign: 'left',
        },
    },

    highlight: {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
    },


    hiddenMobile: {
        [theme.fn.smallerThan('sm')]: {
            display: 'none',
        },
    },

    hiddenDesktop: {
        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },
}));

const mockdata = [
    {
        icon: IconClipboardHeart,
        title: 'Medical',
    },
    {
        icon: IconSos,
        title: 'Emergency',
    },
    {
        icon: IconLeaf,
        title: 'Environment',
    },
    {
        icon: IconHeartHandshake,
        title: 'Nonprofit',
    },
    {
        icon: IconReportMoney,
        title: 'Financial emergency',
    },
    {
        icon: IconCat,
        title: 'Animals',
    },
    {
        icon: IconFireHydrant,
        title: 'Crisis Relief',
    },
    {
        icon: IconAugmentedReality,
        title: 'Technology',
    },
    {
        icon: IconDeviceTv,
        title: 'Film & Videos',
    },
];

interface IProps extends BoxProps {
    compressed?: boolean
}

const LandingNavbar = ({compressed}: IProps) => {
    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const [linksOpened, {toggle: toggleLinks}] = useDisclosure(false);
    const {classes, theme} = useStyles();
    const [stickyClass, setStickyClass] = useState(false);

    const links = mockdata.map((item) => (
        <UnstyledButton className={classes.subLink} key={item.title}>
            <Group noWrap align="center">
                <ThemeIcon size={34} variant="default" radius="md">
                    <item.icon size={rem(22)} stroke={1.5} color={theme.fn.primaryColor()}/>
                </ThemeIcon>
                <div>
                    <Text size="sm" fw={500}>
                        {item.title}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    ));

    const stickNavbar = () => {
        if (window !== undefined) {
            const windowHeight = window.scrollY;
            windowHeight > 30 ? setStickyClass(true) : setStickyClass(false);
        }
    };


    useEffect(() => {
        window.addEventListener('scroll', stickNavbar);

        return () => {
            window.removeEventListener('scroll', stickNavbar);
        };
    }, []);

    return (
        <Box
            mt={compressed ? (stickyClass ? 0 : "xl") : 0}
            sx={{
                transition: "all ease 150ms",
                position: "fixed",
                top: '3%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                margin: "auto",
                width: compressed ? (stickyClass ? "100%" : "85%") : "100%",
                boxShadow: theme.shadows.sm,
            }}>
            <Header
                height={60}
                px="md"
                sx={{
                    backgroundColor: stickyClass ? 'rgba( 255, 255, 255, .9 )' : theme.white,
                    backdropFilter: 'blur(8px)',
                }}>
                <Container size="lg" fluid={compressed}>
                    <Flex justify="space-between" align="center" sx={{height: '100%'}}>
                        <BrandName/>
                        <Flex align="center" gap="xs" sx={{height: '100%'}} className={classes.hiddenMobile}>
                            <a href="#" className={classes.link}>
                                How it works
                            </a>
                            <HoverCard width={700} position="bottom" radius="md" shadow="md" withinPortal>
                                <HoverCard.Target>
                                    <a href="#" className={classes.link}>
                                        <Center inline>
                                            <Box component="span" mr={5}>
                                                Invest
                                            </Box>
                                            <IconChevronDown size={16} color={theme.fn.primaryColor()}/>
                                        </Center>
                                    </a>
                                </HoverCard.Target>

                                <HoverCard.Dropdown sx={{overflow: 'hidden'}}>
                                    <Group position="apart" px="md">
                                        <Text fw={500} color="dark">Categories</Text>
                                        <Button variant="default">See all</Button>
                                    </Group>

                                    <Divider
                                        my="sm"
                                        mx="-md"
                                        color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'}
                                    />

                                    <SimpleGrid cols={3} spacing={0}>
                                        {links}
                                    </SimpleGrid>
                                </HoverCard.Dropdown>
                            </HoverCard>
                            <a href="#" className={classes.link}>
                                Campaigns
                            </a>
                            <a href="#" className={classes.link}>
                                Volunteers
                            </a>
                            <a href="#" className={classes.link}>
                                Contact us
                            </a>
                            <Button leftIcon={<IconSearch size={18}/>}>Search</Button>
                            <Button>Create a campaign</Button>
                        </Flex>
                        <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop}/>
                    </Flex>
                </Container>
            </Header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                className={classes.hiddenDesktop}
                zIndex={1000000}
            >
                <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
                    <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'}/>

                    <a href="#" className={classes.link}>
                        Home
                    </a>
                    <UnstyledButton className={classes.link} onClick={toggleLinks}>
                        <Center inline>
                            <Box component="span" mr={5}>
                                Features
                            </Box>
                            <IconChevronDown size={16} color={theme.fn.primaryColor()}/>
                        </Center>
                    </UnstyledButton>
                    <Collapse in={linksOpened}>{links}</Collapse>
                    <a href="#" className={classes.link}>
                        Learn
                    </a>
                    <a href="#" className={classes.link}>
                        Academy
                    </a>

                    <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'}/>

                    <Group position="center" grow pb="xl" px="md">
                        <Button variant="default">Log in</Button>
                        <Button>Sign up</Button>
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}

export default LandingNavbar;
