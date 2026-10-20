import {describe, expect, it} from "vitest";
import Stripe from "stripe";
import {errorMessage} from "./stripe-connect";

const GENERIC = "We could not reach Stripe. Please try again in a moment.";

describe("errorMessage", () => {
    it("prefers Stripe's own wording, which names the real problem", () => {
        const e = new Stripe.errors.StripeInvalidRequestError({
            type: "invalid_request_error",
            message: "You can only create new accounts if you've signed up for Connect",
        });
        expect(errorMessage(e)).toBe("You can only create new accounts if you've signed up for Connect");
    });

    it("falls back to a generic message for anything else", () => {
        expect(errorMessage(new Error("socket hang up"))).toBe(GENERIC);
    });

    it("falls back for non-errors", () => {
        expect(errorMessage("nope")).toBe(GENERIC);
        expect(errorMessage(undefined)).toBe(GENERIC);
    });

    it("falls back for a Stripe error with an empty message", () => {
        expect(errorMessage(new Stripe.errors.StripeAPIError({type: "api_error", message: ""}))).toBe(GENERIC);
    });
});
