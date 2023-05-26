import {PublicLayout} from "../layout";
import {Helmet} from "react-helmet";

const HowItWorksPage = (): JSX.Element => {
    return (
        <>
            <Helmet>
                <title>How it works</title>
            </Helmet>
            <PublicLayout compressedNav={false}>
                how it works
            </PublicLayout>
        </>
    );
};

export default HowItWorksPage;
