import {ReactNode} from 'react';
import {AppShell, useMantineTheme} from '@mantine/core';
import {AppNavbar} from "../components";

interface IProps {
    children: ReactNode
}

const DashboardLayout = ({children}: IProps) => {
    const theme = useMantineTheme();

    return (
        <>
            <AppShell
                styles={{
                    main: {
                        background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                navbar={<></>}
                header={<AppNavbar/>}
            >
                {children}
            </AppShell>
        </>
    );
}

export default DashboardLayout;
