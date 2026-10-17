import {describe, expect, it} from "vitest";
import {parseDonorInput} from "./donor";

const form = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
};

describe("parseDonorInput", () => {
    it("accepts an empty donor (everything optional)", () => {
        expect(parseDonorInput(form({}))).toEqual({
            ok: true,
            value: {name: null, email: null, message: null, anonymous: false},
        });
    });
    it("trims and keeps name, email and message", () => {
        const r = parseDonorInput(form({name: "  Ada ", email: " ada@example.com ", message: " Good luck "}));
        expect(r).toEqual({ok: true, value: {name: "Ada", email: "ada@example.com", message: "Good luck", anonymous: false}});
    });
    it("reads the anonymous checkbox only when it is on", () => {
        expect(parseDonorInput(form({anonymous: "on"}))).toMatchObject({ok: true, value: {anonymous: true}});
        expect(parseDonorInput(form({anonymous: "true"}))).toMatchObject({ok: true, value: {anonymous: true}});
        expect(parseDonorInput(form({anonymous: "false"}))).toMatchObject({ok: true, value: {anonymous: false}});
    });
    it("rejects an over-long name, message or email", () => {
        expect(parseDonorInput(form({name: "a".repeat(121)})).ok).toBe(false);
        expect(parseDonorInput(form({message: "a".repeat(501)})).ok).toBe(false);
        expect(parseDonorInput(form({email: `${"a".repeat(320)}@x.co`})).ok).toBe(false);
    });
    it("accepts the maximum lengths", () => {
        expect(parseDonorInput(form({name: "a".repeat(120), message: "b".repeat(500)})).ok).toBe(true);
    });
    it("rejects a malformed email", () => {
        expect(parseDonorInput(form({email: "not-an-email"})).ok).toBe(false);
    });
    it("counts characters, not UTF-16 units, for the limits", () => {
        expect(parseDonorInput(form({message: "😀".repeat(500)})).ok).toBe(true);
    });
});
