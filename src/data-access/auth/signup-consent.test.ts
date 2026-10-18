import {describe, expect, it} from "vitest";
import {consentAccepted} from "./signup-consent";

const form = (fields: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.append(k, v);
    return f;
};

describe("consentAccepted", () => {
    it("accepts a signup whose consent box was ticked", () => {
        expect(consentAccepted(form({consent: "on"}))).toBe(true);
    });
    it("rejects a signup without the consent box", () => {
        expect(consentAccepted(form({}))).toBe(false);
    });
    it("rejects any value other than the checkbox's own 'on'", () => {
        expect(consentAccepted(form({consent: "false"}))).toBe(false);
        expect(consentAccepted(form({consent: ""}))).toBe(false);
    });
});
