import {AppShell, useMantineTheme} from '@mantine/core';
import {Outlet} from 'react-router-dom'
import {AppNavbar} from "../components";

const DashboardLayout = () => {
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
                <Outlet/>
            </AppShell>
        </>
    );
}

export default DashboardLayout;
