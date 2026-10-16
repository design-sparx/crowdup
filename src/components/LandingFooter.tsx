import {ActionIcon, Container, Group, Stack, Text} from '@mantine/core';
import {
    IconBrandFacebook,
    IconBrandGithub,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTwitter
} from '@tabler/icons-react';
import {BrandName} from "./index";
import classes from "./LandingFooter.module.css";

interface FooterLinksProps {
    data: {
        title: string;
        links: { label: string; link: string }[];
    }[];
}

const LandingFooter = ({data}: FooterLinksProps) => {

    const groups = data.map((group) => {
        const links = group.links.map((link, index) => (
            <Text<'a'>
                key={index}
                className={classes.link}
                component="a"
                href={link.link}
                onClick={(event: React.MouseEvent) => event.preventDefault()}
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

                <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
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
