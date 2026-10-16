import {
    Box,
    BoxProps,
    Burger,
    Button, ButtonProps,
    Center,
    Collapse,
    Container,
    Divider,
    Drawer,
    Flex,
    Group,
    HoverCard,
    rem,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
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
import {BrandName, SearchDrawer} from "./index";
import {Link} from "react-router-dom";
import classes from "./LandingNavbar.module.css";

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
    const [searchOpened, {toggle: toggleSearchDrawer, close: closeSearchDrawer}] = useDisclosure(false);
    const [stickyClass, setStickyClass] = useState(false);
    const matchesMobile = useMediaQuery('(max-width: 768px)');

    const links = mockdata.map((item) => (
        <UnstyledButton className={classes.subLink} key={item.title}>
            <Group wrap="nowrap" align="center">
                <ThemeIcon size={34} variant="default" radius="md">
                    <item.icon size={rem(22)} stroke={1.5} color="var(--mantine-primary-color-filled)"/>
                </ThemeIcon>
                <div>
                    <Text size="sm" fw={500}>
                        {item.title}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    ));

    const buttonProps: ButtonProps = {
        variant: "subtle",
        radius: matchesMobile ? 'sm' : 0
    }

    const stickNavbar = () => {
        if (window !== undefined) {
            const windowHeight = window.scrollY;
            setStickyClass(windowHeight > 240);
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
            style={{
                transition: "all ease 150ms",
                position: "fixed",
                top: '3%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                margin: "auto",
                width: compressed ? (stickyClass ? "100%" : "85%") : "100%",
                boxShadow: 'var(--mantine-shadow-sm)',
            }}>
            <Box
                h={60}
                px="md"
                className={classes.header}
                data-sticky={stickyClass || undefined}
            >
                <Container size="lg" fluid={compressed} style={{height: '100%'}}>
                    <Flex justify="space-between" align="center" style={{height: '100%'}}>
                        <BrandName size={28} asLink/>
                        <Flex align="center" gap="xs" style={{height: '100%'}} className={classes.hiddenMobile}>
                            <Button component={Link} to="/how-it-works" className={classes.link} {...buttonProps}>
                                How it works
                            </Button>
                            <Button component={Link} to="/campaigns" className={classes.link} {...buttonProps}>
                                Campaigns
                            </Button>
                            <HoverCard width={700} position="bottom" radius="sm" shadow="md" withinPortal>
                                <HoverCard.Target>
                                    <a href="#" className={classes.link}>
                                        <Center inline>
                                            <Box component="span" mr={5}>
                                                Invest
                                            </Box>
                                            <IconChevronDown size={18} className={classes.linkIcon}/>
                                        </Center>
                                    </a>
                                </HoverCard.Target>

                                <HoverCard.Dropdown style={{overflow: 'hidden'}}>
                                    <Group justify="space-between" px="md">
                                        <Text fw={500} c="dark">Categories</Text>
                                        <Button variant="default">See all</Button>
                                    </Group>

                                    <Divider
                                        my="sm"
                                        mx="-md"
                                        color="gray.1"
                                    />

                                    <SimpleGrid cols={3} spacing={0}>
                                        {links}
                                    </SimpleGrid>
                                </HoverCard.Dropdown>
                            </HoverCard>
                            <Button
                                leftSection={<IconSearch size={18} className={classes.linkIcon}/>}
                                onClick={toggleSearchDrawer}
                                className={classes.link}
                                {...buttonProps}
                            >
                                Search
                            </Button>
                            <Button component={Link} to="/create-campaign" className={classes.link} {...buttonProps}>
                                Start a campaign
                            </Button>
                            <Button component={Link} to="/dashboard" className={classes.link} {...buttonProps}>
                                My dashboard
                            </Button>
                        </Flex>
                        <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop}/>
                    </Flex>
                </Container>
            </Box>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                className={classes.hiddenDesktop}
                zIndex={1000000}
            >
                <ScrollArea h={`calc(100vh - ${rem(0)})`} mx="-md">
                    <Divider my="sm" color="gray.1"/>

                    <Button component={Link} to="/" className={classes.link} {...buttonProps}>
                        Home
                    </Button>
                    <Button component={Link} to="/how-it-works" className={classes.link} {...buttonProps}>
                        How it works
                    </Button>
                    <Button component={Link} to="/campaigns" className={classes.link} {...buttonProps}>
                        Campaigns
                    </Button>
                    <UnstyledButton className={classes.link} onClick={toggleLinks}>
                        <Center inline>
                            <Box component="span" mr={5}>
                                Invest
                            </Box>
                            <IconChevronDown size={16} className={classes.linkIcon}/>
                        </Center>
                    </UnstyledButton>
                    <Collapse expanded={linksOpened}>{links}</Collapse>

                    <Button component={Link} to="/create-campaign" className={classes.link} {...buttonProps}>
                        Start a campaign
                    </Button>
                    <Button component={Link} to="/dashboard" className={classes.link} {...buttonProps}>
                        My dashboard
                    </Button>
                    <Button
                        leftSection={<IconSearch size={18}/>}
                        onClick={() => {
                            closeDrawer()
                            toggleSearchDrawer();
                        }}
                        className={classes.link}
                        {...buttonProps}
                    >
                        Search
                    </Button>
                </ScrollArea>
            </Drawer>

            <SearchDrawer opened={searchOpened} onClose={closeSearchDrawer}/>
        </Box>
    );
}

export default LandingNavbar;
