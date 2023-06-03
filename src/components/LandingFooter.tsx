import {ActionIcon, Container, createStyles, Group, rem, Stack, Text} from '@mantine/core';
import {
    IconBrandFacebook,
    IconBrandGithub,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTwitter
} from '@tabler/icons-react';
import {BrandName} from "./index";

const useStyles = createStyles((theme) => ({
    footer: {
        marginTop: rem(120),
        paddingTop: `calc(${theme.spacing.xl} * 2)`,
        paddingBottom: `calc(${theme.spacing.xl} * 2)`,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
        }`,
    },

    logo: {
        maxWidth: rem(200),

        [theme.fn.smallerThan('md')]: {
            maxWidth: '40%'
        },

        [theme.fn.smallerThan('sm')]: {
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },

    description: {
        marginTop: rem(5),

        [theme.fn.smallerThan('sm')]: {
            marginTop: theme.spacing.xs,
            textAlign: 'center',
        },
    },

    inner: {
        display: 'flex',
        justifyContent: 'space-between',

        [theme.fn.smallerThan('sm')]: {
            flexDirection: 'column',
            alignItems: 'center',
        },
    },

    groups: {
        display: 'flex',
        flexWrap: 'wrap',

        [theme.fn.smallerThan('md')]: {
            marginLeft: 12
        },

        [theme.fn.smallerThan('sm')]: {
            display: 'flex',
            width: '92vw',
            marginTop: theme.spacing.sm
        },
    },

    wrapper: {
        width: rem(200),

        [theme.fn.smallerThan('md')]: {
            margin: `${theme.spacing.sm} 0`,
        },

        [theme.fn.smallerThan('sm')]: {
            width: '100%',
        },
    },

    link: {
        display: 'block',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
        fontSize: theme.fontSizes.sm,
        paddingTop: rem(3),
        paddingBottom: rem(3),

        '&:hover': {
            textDecoration: 'underline',
        },
    },

    title: {
        fontSize: theme.fontSizes.lg,
        fontWeight: 700,
        marginBottom: `calc(${theme.spacing.xs} / 2)`,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },

    afterFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,

        [theme.fn.smallerThan('sm')]: {
            flexDirection: 'column',
        },
    },

    social: {
        [theme.fn.smallerThan('sm')]: {
            marginTop: theme.spacing.xs,
        },
    },
}));

interface FooterLinksProps {
    data: {
        title: string;
        links: { label: string; link: string }[];
    }[];
}

const LandingFooter = ({data}: FooterLinksProps) => {
    const {classes} = useStyles();

    const groups = data.map((group) => {
        const links = group.links.map((link, index) => (
            <Text<'a'>
                key={index}
                className={classes.link}
                component="a"
                href={link.link}
                onClick={(event) => event.preventDefault()}
            >
                {link.label}
            </Text>
        ));

        return (
            <div className={classes.wrapper} key={group.title}>
                <Text className={classes.title}>{group.title}</Text>
                {links}
            </div>
        );
    });

    return (
        <footer className={classes.footer}>
            <Container className={classes.inner} size="lg">
                <div className={classes.logo}>
                    <Stack align="flex-start">
                        <BrandName size={40}/>
                        <Text size="sm">CrowdUp is a crowdfunding website that lets you raise money for anything that
                            matters to you. From personal causes and events to projects and more. We've helped people
                            from all over the world raise millions online.
                        </Text>
                    </Stack>
                </div>
                <div className={classes.groups}>{groups}</div>
            </Container>
            <Container className={classes.afterFooter} size="lg">
                <Text size="sm">
                    © {new Date().getFullYear()} CrowdUp. All rights reserved.
                </Text>

                <Group spacing={0} className={classes.social} position="right" noWrap>
                    <ActionIcon size="lg" component="a" href="https://github.com/kelvink96" target="_blank">
                        <IconBrandGithub size="20" stroke={2}/>
                    </ActionIcon>
                    <ActionIcon size="lg" component="a" href="https://twitter.com/kelvink_96" target="_blank">
                        <IconBrandTwitter size="20" stroke={2}/>
                    </ActionIcon>
                    <ActionIcon size="lg" component="a" href="https://www.facebook.com/kelvinkk96" target="_blank">
                        <IconBrandFacebook size="20" stroke={2}/>
                    </ActionIcon>
                    <ActionIcon size="lg" component="a" href="https://www.instagram.com/kelvink_96/" target="_blank">
                        <IconBrandInstagram size="20" stroke={2}/>
                    </ActionIcon>
                    <ActionIcon size="lg" component="a" href="https://www.linkedin.com/in/kelvink96/" target="_blank">
                        <IconBrandLinkedin size="20" stroke={2}/>
                    </ActionIcon>
                </Group>
            </Container>
        </footer>
    );
}

export default LandingFooter;
