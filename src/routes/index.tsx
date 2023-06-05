import {createBrowserRouter,} from "react-router-dom";
import {
    CampaignDetailsPage,
    CampaignsPage,
    CreateCampaignPage,
    DashboardPage,
    DetailError404Page,
    Error404Page,
    HomePage,
    HowItWorksPage,
    LoginPage,
    SignupPage
} from "../pages";
import {DashboardLayout, PublicLayout} from "../layout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicLayout compressedNav/>,
        errorElement: <Error404Page/>,
        children: [
            {
                path: '',
                element: <HomePage/>
            }
        ]
    },
    {
        path: "login",
        element: <LoginPage/>,
        errorElement: <Error404Page/>,
    },
    {
        path: "signup",
        element: <SignupPage/>,
        errorElement: <Error404Page/>,
    },
    {
        path: "how-it-works",
        element: <PublicLayout/>,
        errorElement: <Error404Page/>,
        children: [
            {
                path: '',
                element: <HowItWorksPage/>
            }
        ]
    },
    {
        path: "campaigns",
        children: [
            {
                path: "",
                index: true,
                element: <CampaignsPage/>,
                errorElement: <Error404Page/>,
            },
            {
                path: ":id",
                element: <CampaignDetailsPage/>,
                errorElement: <DetailError404Page/>
            }
        ]
    },
    {
        path: "dashboard",
        element: <DashboardLayout/>,
        errorElement: <Error404Page/>,
        children: [
            {
                path: '',
                element: <DashboardPage/>
            }
        ]
    },
    {
        path: "create-campaign",
        element: <DashboardLayout/>,
        errorElement: <Error404Page/>,
        children: [
            {
                path: '',
                element: <CreateCampaignPage/>
            }
        ]
    },
]);


export default router;
