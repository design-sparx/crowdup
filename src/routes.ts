import {index, layout, route, type RouteConfig} from "@react-router/dev/routes";

export default [
    layout("routes/home-layout.tsx", [index("routes/home.tsx")]),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("forgot-password", "routes/forgot-password.tsx"),
    route("update-password", "routes/update-password.tsx"),
    route("auth/callback", "routes/auth-callback.tsx"),
    route("logout", "routes/logout.tsx"),
    layout("routes/public-layout.tsx", [
        route("how-it-works", "routes/how-it-works.tsx"),
        route("campaigns", "routes/campaigns.tsx"),
        route("campaigns/:id", "routes/campaign-details.tsx"),
    ]),
    layout("routes/dashboard-layout.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("create-campaign", "routes/create-campaign.tsx"),
    ]),
] satisfies RouteConfig;
