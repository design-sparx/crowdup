import {createBrowserRouter,} from "react-router-dom";
import {
    CampaignDetailsPage,
    CampaignsPage, CreateCampaignPage,
    DashboardPage,
    DetailError404Page,
    Error404Page,
    HomePage,
    HowItWorksPage, LoginPage, SignupPage
} from "../pages";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage/>,
        errorElement: <Error404Page/>,
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
        element: <HowItWorksPage/>,
        errorElement: <Error404Page/>,
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
        element: <DashboardPage/>,
        errorElement: <Error404Page/>,
    },
    {
        path: "create-campaign",
        element: <CreateCampaignPage/>,
        errorElement: <Error404Page/>,
    },
]);


export default router;
