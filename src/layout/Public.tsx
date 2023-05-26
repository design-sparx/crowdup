import {LandingFooter, LandingNavbar} from "../components";
import {ReactNode} from "react";
import {Box} from "@mantine/core";

import footerLinksData from "../data/Footer.json"

interface IProps {
    children: ReactNode
    compressedNav?: boolean
}

const PublicLayout = ({children, compressedNav}: IProps) => {
    return (
        <>
            <LandingNavbar compressed={compressedNav}/>
            <Box sx={{marginTop: compressedNav ? 0 : 96}}>
                {children}
            </Box>
            <LandingFooter data={footerLinksData.data}/>
        </>
    );
};

export default PublicLayout;
