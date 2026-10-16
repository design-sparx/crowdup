import {AppShell} from '@mantine/core';
import {Outlet} from 'react-router-dom'
import {AppNavbar} from "../components";
import classes from "./Dashboard.module.css";

const DashboardLayout = () => {
    return (
        <AppShell
            header={{height: {base: 50, md: 70}}}
            classNames={{main: classes.main}}
        >
            <AppNavbar/>
            <AppShell.Main>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    );
}

export default DashboardLayout;
