import {describe, expect, it} from "vitest";
import type {LoaderFunctionArgs} from "react-router";
import {action, loader} from "./signup";

// The signup guards throw before anything touches Supabase, so a bare Request is enough —
// only the config parser needs values. Config is cached per module registry (one per test
// file), so set the environment here, at module scope, before the first call.
process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_ANON_KEY = "anon";
delete process.env.AUTH_SIGNUP_ENABLED;

const args = (init?: RequestInit): LoaderFunctionArgs => ({
    request: new Request("http://localhost:5173/signup", init),
    params: {},
    // The signup guards only read `request`; the context type is irrelevant here.
    context: {} as LoaderFunctionArgs["context"],
    url: new URL("http://localhost:5173/signup"),
    pattern: "/signup",
});

async function expectNotFound(promise: Promise<unknown>) {
    const thrown = await promise.then(() => null).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
}

describe("signup route when AUTH_SIGNUP_ENABLED is off (the default)", () => {
    it("404s the loader", async () => {
        await expectNotFound(loader(args()));
    });

    it("404s the action, so direct form posts are refused too", async () => {
        await expectNotFound(action(args({method: "POST"})));
    });
});
