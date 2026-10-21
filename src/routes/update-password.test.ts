import {afterEach, describe, expect, it, vi} from "vitest";
import type {ActionFunctionArgs} from "react-router";
import {action} from "./update-password";

const updatePassword = vi.fn();
vi.mock("../data-access/auth/auth.server", () => ({
    requireUser: vi.fn(async () => ({user: {id: "u"}, headers: new Headers()})),
    updatePassword: (...a: unknown[]) => updatePassword(...a),
}));

const args = (): ActionFunctionArgs => ({
    request: new Request("http://localhost:5173/update-password", {method: "POST", body: new FormData()}),
    params: {},
    context: {} as ActionFunctionArgs["context"],
    url: new URL("http://localhost:5173/update-password"),
    pattern: "/update-password",
});

afterEach(() => {
    vi.unstubAllEnvs();
    updatePassword.mockReset();
});

describe("update-password action in demo mode", () => {
    it("refuses with 403 and never changes the password", async () => {
        vi.stubEnv("DEMO_MODE", "true");
        const result = (await action(args())) as {init?: {status?: number}; data?: {error?: string}};
        expect(updatePassword).not.toHaveBeenCalled();
        expect(result.init?.status).toBe(403);
        expect(result.data?.error).toMatch(/disabled in the public demo/i);
    });
});
