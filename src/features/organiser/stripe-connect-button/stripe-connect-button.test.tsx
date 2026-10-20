// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import userEvent from "@testing-library/user-event";
import {screen} from "@testing-library/react";
import {data} from "react-router";
import {renderWithRouter} from "@/test/render-with-router";
import {CONNECT_STRIPE_ACTION} from "@/lib/stripe/connectAction";
import {StripeConnectButton} from "./stripe-connect-button";

/** Stands in for the real `/stripe/connect` action, which always fails in these tests. */
function failingAction(status = 502, error = "You can only create new accounts if you've signed up for Connect.") {
    return {...data({error}, {status})};
}

describe("StripeConnectButton", () => {
    it("posts to the connect action and labels the button", () => {
        const {container} = renderWithRouter(<StripeConnectButton label="Finish Stripe setup"/>);
        expect(container.querySelector(`form[action="${CONNECT_STRIPE_ACTION}"]`)).not.toBeNull();
        expect(screen.getByRole("button", {name: "Finish Stripe setup"})).toBeInTheDocument();
    });

    it("defaults the label to Connect Stripe", () => {
        renderWithRouter(<StripeConnectButton/>);
        expect(screen.getByRole("button", {name: "Connect Stripe"})).toBeInTheDocument();
    });

    it("shows Stripe's reason when onboarding could not start", async () => {
        renderWithRouter(<StripeConnectButton/>, "/", [
            {path: CONNECT_STRIPE_ACTION, action: () => failingAction()},
        ]);

        await userEvent.click(screen.getByRole("button", {name: "Connect Stripe"}));

        expect(await screen.findByRole("alert")).toHaveTextContent(/signed up for Connect/);
    });

    it("shows the generic message for a non-Stripe failure", async () => {
        renderWithRouter(<StripeConnectButton/>, "/", [
            {path: CONNECT_STRIPE_ACTION, action: () => failingAction(500, "We could not reach Stripe. Please try again in a moment.")},
        ]);

        await userEvent.click(screen.getByRole("button", {name: "Connect Stripe"}));

        expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach Stripe/);
    });

    it("shows no alert before a failed attempt", () => {
        renderWithRouter(<StripeConnectButton/>);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
