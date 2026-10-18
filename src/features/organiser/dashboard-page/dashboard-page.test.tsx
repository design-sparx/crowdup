// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {DashboardPage} from "./dashboard-page";

const live = {id: "1", slug: "clean-water", title: "Clean water for schools", status: "live", currency: "KES",
    goalAmount: 500000, suspendedReason: null, rejectionReason: null};
const donations = [
    {id: "d1", campaignId: "1", amount: 310000, currency: "KES", createdAt: new Date().toISOString(), anonymous: false, donorName: "Dana"},
];

const base = {
    name: "Amara",
    campaigns: [live],
    donations,
    stripeStatus: "connected" as const,
    currency: "KES",
    moderationNotice: null,
    notice: null,
    mode: "auto" as const,
    now: new Date().toISOString(),
};

describe("DashboardPage", () => {
    it("greets the organiser with one h1 and shows the raised total", () => {
        renderWithRouter(<DashboardPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Welcome, Amara"})).toBeInTheDocument();
        // The total appears in the stat card and again in the campaigns table; check the stat card.
        const raised = screen.getAllByText("Raised").find((el) => el.tagName === "P" && el.parentElement?.querySelector("p.text-2xl"));
        expect(raised?.parentElement).toHaveTextContent("KES 3,100.00");
    });

    it("shows the suspension reason as a destructive alert when the account is suspended", () => {
        renderWithRouter(<DashboardPage {...base} moderationNotice="Your account is suspended: test reason."/>);
        expect(screen.getByRole("alert")).toHaveTextContent("Your account is suspended: test reason.");
    });

    it("shows the Stripe return notice when Stripe sent the organiser back", () => {
        renderWithRouter(<DashboardPage {...base} notice="incomplete"/>);
        expect(screen.getByRole("status")).toHaveTextContent(/Stripe setup is not finished/);
    });
});
