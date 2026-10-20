// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {renderWithRouter} from "@/test/render-with-router";
import {screen} from "@testing-library/react";
import {CONNECT_STRIPE_ACTION} from "@/lib/stripe/connectAction";
import {StripeStatus} from "./stripe-status";

describe("StripeStatus", () => {
    it("offers to connect Stripe when the account has not started", () => {
        const {container} = renderWithRouter(<StripeStatus status="not_started" currency={null}/>);
        expect(screen.getByRole("button", {name: "Connect Stripe"})).toBeInTheDocument();
        expect(screen.getByText(/Connect Stripe to receive donations/)).toBeInTheDocument();
        expect(container.querySelector(`form[action="${CONNECT_STRIPE_ACTION}"]`)).not.toBeNull();
    });

    it("says the setup is unfinished when onboarding is incomplete", () => {
        renderWithRouter(<StripeStatus status="incomplete" currency={null}/>);
        expect(screen.getByRole("button", {name: "Finish Stripe setup"})).toBeInTheDocument();
    });

    it("shows the payout currency once connected, with no connect button", () => {
        renderWithRouter(<StripeStatus status="connected" currency="GBP"/>);
        expect(screen.getByText(/Connected/)).toBeInTheDocument();
        expect(screen.getByText(/GBP/)).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Stripe/})).not.toBeInTheDocument();
    });
});
