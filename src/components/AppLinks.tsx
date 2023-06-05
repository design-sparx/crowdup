import {useState} from 'react';
import {Button, createStyles, Flex, FlexProps, getStylesRef, rem} from '@mantine/core';
import {IconFileDollar, IconFolderPlus, IconHeart, IconHome,} from '@tabler/icons-react';
import {Link} from "react-router-dom";

const useStyles = createStyles((theme) => ({
    header: {
        paddingBottom: theme.spacing.md,
        marginBottom: `calc(${theme.spacing.md} * 1.5)`,
        borderBottom: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },

    footer: {
        marginLeft: `calc(${theme.spacing.md} * -1)`,
        marginRight: `calc(${theme.spacing.md} * -1)`,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
        padding: theme.spacing.sm,
    },

    link: {
        ...theme.fn.focusStyles(),
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        fontSize: theme.fontSizes.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[0],
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.sm,
        fontWeight: 500,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.primary[7],
            color: theme.colorScheme === 'dark' ? theme.white : theme.white,

            [`& .${getStylesRef('icon')}`]: {
                color: theme.colorScheme === 'dark' ? theme.black : theme.white,
            },
        },
    },

    linkIcon: {
        ref: getStylesRef('icon'),
        color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[0],
        marginRight: theme.spacing.sm,
    },

    linkActive: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({variant: 'light', color: theme.colors.primary[8]}).background,
            color: theme.fn.variant({variant: 'light', color: theme.colors.primary[8]}).color,

            [`& .${getStylesRef('icon')}`]: {
                color: theme.fn.variant({variant: 'light', color: theme.primaryColor}).color,
            },
        },
    },
}));

const data = [
    {link: '/create-campaign', label: 'Create New Campaign', icon: IconFolderPlus},
    {link: '/dashboard', label: 'My Dashboard', icon: IconHome},
    {link: '', label: 'Following Campaigns', icon: IconHeart},
    {link: '', label: 'Funded Campaigns', icon: IconFileDollar},
];

const ICON_SIZE = 18

type IProps = FlexProps

const AppLinks = ({...others}: IProps) => {
    const {classes, cx} = useStyles();
    const [active, setActive] = useState('Billing');

    const links = data.map((item) => (
        <Button
            component={Link}
            className={cx(classes.link, {[classes.linkActive]: item.label === active})}
            to={item.link}
            key={item.label}
            onClick={() => {
                setActive(item.label);
            }}
        >
            <item.icon className={classes.linkIcon} stroke={1.5} size={ICON_SIZE}/>
            <span>{item.label}</span>
        </Button>
    ));

    return (
        <Flex gap={4} {...others}>
            {links}
        </Flex>
    );
}

export default AppLinks;
