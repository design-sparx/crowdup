import {index, layout, route, type RouteConfig} from "@react-router/dev/routes";

export default [
    layout("routes/home-layout.tsx", [index("routes/home.tsx")]),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("forgot-password", "routes/forgot-password.tsx"),
    route("update-password", "routes/update-password.tsx"),
    route("auth/callback", "routes/auth-callback.tsx"),
    route("logout", "routes/logout.tsx"),
    route("stripe/connect", "routes/stripe-connect.tsx"),
    route("stripe/return", "routes/stripe-return.tsx"),
    route("stripe/refresh", "routes/stripe-refresh.tsx"),
    route("campaigns/:id/publish", "routes/stripe-publish.tsx"),
    route("api/stripe/webhook", "routes/api-stripe-webhook.tsx"),
    layout("routes/public-layout.tsx", [
        route("how-it-works", "routes/how-it-works.tsx"),
        route("campaigns", "routes/campaigns.tsx"),
        route("campaigns/:slug", "routes/campaign-details.tsx"),
        route("terms", "routes/terms.tsx"),
        route("privacy", "routes/privacy.tsx"),
        route("security", "routes/security.tsx"),
    ]),
    layout("routes/dashboard-layout.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("dashboard/donations", "routes/my-donations.tsx"),
        route("create-campaign", "routes/create-campaign.tsx"),
        route("campaigns/:id/edit", "routes/edit-campaign.tsx"),
    ]),
    layout("routes/admin-layout.tsx", [
        route("admin", "routes/admin-index.tsx"),
        route("admin/reports", "routes/admin-reports.tsx"),
        route("admin/campaigns", "routes/admin-campaigns.tsx"),
        route("admin/users", "routes/admin-users.tsx"),
        route("admin/approvals", "routes/admin-approvals.tsx"),
    ]),
] satisfies RouteConfig;
