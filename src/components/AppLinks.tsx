import {useState} from 'react';
import {Button, Flex, FlexProps} from '@mantine/core';
import {IconFileDollar, IconFolderPlus, IconHeart, IconHome,} from '@tabler/icons-react';
import {Link} from "react-router";
import clsx from "clsx";
import classes from "./AppLinks.module.css";

const data = [
    {link: '/create-campaign', label: 'Create New Campaign', icon: IconFolderPlus},
    {link: '/dashboard', label: 'My Dashboard', icon: IconHome},
    {link: '', label: 'Following Campaigns', icon: IconHeart},
    {link: '', label: 'Funded Campaigns', icon: IconFileDollar},
];

const ICON_SIZE = 18

type IProps = FlexProps

const AppLinks = ({...others}: IProps) => {
    const [active, setActive] = useState('Billing');

    const links = data.map((item) => (
        <Button
            component={Link}
            className={clsx(classes.link, {[classes.linkActive]: item.label === active})}
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
