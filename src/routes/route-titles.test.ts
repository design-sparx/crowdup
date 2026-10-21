import {describe, expect, it} from "vitest";
import type {MetaDescriptor} from "../helpers/buildMeta";

type MetaFn = () => MetaDescriptor[];

const ROUTES: Record<string, string> = {
    "./login": "Log in",
    "./signup": "Sign up",
    "./forgot-password": "Reset your password",
    "./update-password": "Choose a new password",
    "./how-it-works": "How it works",
    "./dashboard": "Dashboard",
    "./my-donations": "My donations",
    "./create-campaign": "Create a campaign",
    "./edit-campaign": "Edit campaign",
    "./admin-reports": "Admin: reports",
    "./admin-campaigns": "Admin: campaigns",
    "./admin-users": "Admin: users",
    "./admin-approvals": "Admin: approvals",
    "./admin-payments": "Admin: payments",
};

const modules = import.meta.glob<{meta?: MetaFn}>(
    ["./login.tsx", "./signup.tsx", "./forgot-password.tsx", "./update-password.tsx", "./how-it-works.tsx", "./dashboard.tsx",
        "./my-donations.tsx", "./create-campaign.tsx", "./edit-campaign.tsx", "./admin-*.tsx", "!./admin-layout.tsx", "!./admin-index.tsx"],
);

describe("route document titles", () => {
    for (const [path, title] of Object.entries(ROUTES)) {
        it(`${path} has its own title`, async () => {
            const mod = await modules[`${path}.tsx`]();
            expect(mod.meta, `${path} must export meta`).toBeTypeOf("function");
            expect(mod.meta!()).toContainEqual({title: `${title} | CrowdUp`});
        });
    }
});
