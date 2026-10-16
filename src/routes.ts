import {index, layout, route, type RouteConfig} from "@react-router/dev/routes";

export default [
    layout("routes/home-layout.tsx", [index("routes/home.tsx")]),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    layout("routes/public-layout.tsx", [
        route("how-it-works", "routes/how-it-works.tsx"),
        route("campaigns", "routes/campaigns.tsx"),
        route("campaigns/:id", "routes/campaign-details.tsx"),
        route("terms", "routes/terms.tsx"),
        route("privacy", "routes/privacy.tsx"),
        route("security", "routes/security.tsx"),
    ]),
    layout("routes/dashboard-layout.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("create-campaign", "routes/create-campaign.tsx"),
    ]),
] satisfies RouteConfig;
