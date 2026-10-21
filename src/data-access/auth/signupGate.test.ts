import {describe, expect, it} from "vitest";
import {SIGNUP_GATE_WARNING, signupGateMismatch} from "./signupGate";

describe("signupGateMismatch", () => {
    it("warns when the app has signup off but Supabase allows it", () => {
        expect(signupGateMismatch(false, {disable_signup: false})).toBe(SIGNUP_GATE_WARNING);
    });

    it("is quiet when Supabase also disables signup", () => {
        expect(signupGateMismatch(false, {disable_signup: true})).toBeNull();
    });

    it("is quiet when the app allows signup, whatever Supabase says", () => {
        expect(signupGateMismatch(true, {disable_signup: false})).toBeNull();
    });

    it("is quiet when the settings payload is unrecognised", () => {
        expect(signupGateMismatch(false, null)).toBeNull();
        expect(signupGateMismatch(false, {})).toBeNull();
        expect(signupGateMismatch(false, {disable_signup: "no"})).toBeNull();
    });
});
