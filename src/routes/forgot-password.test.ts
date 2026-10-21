import {afterEach, describe, expect, it, vi} from "vitest";
import type {ActionFunctionArgs} from "react-router";
import {action} from "./forgot-password";

vi.mock("../data-access/auth/auth.server", () => ({
    requestPasswordReset: vi.fn(() => {
        throw new Error("must not be called in demo mode");
    }),
}));

const args = (): ActionFunctionArgs => ({
    request: new Request("http://localhost:5173/forgot-password", {method: "POST", body: new FormData()}),
    params: {},
    context: {} as ActionFunctionArgs["context"],
    url: new URL("http://localhost:5173/forgot-password"),
    pattern: "/forgot-password",
});

afterEach(() => vi.unstubAllEnvs());

describe("forgot-password action in demo mode", () => {
    it("answers neutrally without sending a reset for the shared demo accounts", async () => {
        vi.stubEnv("DEMO_MODE", "true");
        const result = await action(args());
        expect(JSON.stringify(result)).toContain("a reset link is on its way");
    });
});
