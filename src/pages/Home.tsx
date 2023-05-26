import HeroSection from "../sections/Home/Hero.tsx";
import {Button, Container, Text} from "@mantine/core";
import {SectionTitle} from "../components";
import FeaturesSection from "../sections/Home/Features.tsx";
import StatsSection from "../sections/Home/Stats";
import JoinUsSection from "../sections/Home/JoinUs";
import WaysToFundSection from "../sections/Home/WaysToFund";
import CampaignsSection from "../sections/Home/Campaigns";
import GetStartedSection from "../sections/Home/GetStarted";
import TestimonialsSection from "../sections/Home/Testimonials";
import {PublicLayout} from "../layout";
import {Helmet} from "react-helmet";

const HomePage = (): JSX.Element => {
    return (
        <>
            <Helmet>
                <title>Home</title>
            </Helmet>
            <PublicLayout compressedNav={true}>
                <HeroSection/>
                <Container>
                    <SectionTitle title="about us" description="more people more impact"/>
                    <Text>Because together, we can make a real difference. Our volunteers service in a
                        variety of roles according to their skills and interests.</Text>
                    <Button>Read more</Button>
                </Container>
                <Container>
                    <FeaturesSection/>
                    <StatsSection/>
                    <JoinUsSection/>
                    <WaysToFundSection/>
                    <CampaignsSection/>
                    <TestimonialsSection/>
                    <GetStartedSection/>
                </Container>
            </PublicLayout>
        </>
    );
};

export default HomePage;
