import {describe, expect, it} from "vitest";
// @ts-expect-error plain .mjs script without types
import {checkResetGuard, projectRefFromDatabaseUrl} from "./demo-reset-guard.mjs";

const REF = "abcdefghijklmnopqrst";
const DIRECT = `postgresql://postgres:pw@db.${REF}.supabase.co:5432/postgres`;
const POOLER = `postgresql://postgres.${REF}:pw@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

describe("projectRefFromDatabaseUrl", () => {
    it("reads the ref from direct and pooler URLs", () => {
        expect(projectRefFromDatabaseUrl(DIRECT)).toBe(REF);
        expect(projectRefFromDatabaseUrl(POOLER)).toBe(REF);
    });
    it("returns null for local, foreign or malformed URLs", () => {
        expect(projectRefFromDatabaseUrl("postgresql://postgres:postgres@127.0.0.1:56322/postgres")).toBeNull();
        expect(projectRefFromDatabaseUrl("postgresql://u:p@db.example.com/postgres")).toBeNull();
        expect(projectRefFromDatabaseUrl("not a url")).toBeNull();
    });
});

describe("checkResetGuard", () => {
    it("allows only when the confirmed ref matches", () => {
        expect(checkResetGuard({DEMO_DATABASE_URL: DIRECT, DEMO_RESET_CONFIRM_PROJECT_REF: REF})).toEqual({ok: true, ref: REF});
        expect(checkResetGuard({DEMO_DATABASE_URL: POOLER, DEMO_RESET_CONFIRM_PROJECT_REF: REF}).ok).toBe(true);
    });
    it("refuses a mismatched ref", () => {
        expect(checkResetGuard({DEMO_DATABASE_URL: DIRECT, DEMO_RESET_CONFIRM_PROJECT_REF: "zzzzzzzzzzzzzzzzzzzz"}).ok).toBe(false);
    });
    it("refuses missing configuration", () => {
        expect(checkResetGuard({}).ok).toBe(false);
        expect(checkResetGuard({DEMO_DATABASE_URL: DIRECT}).ok).toBe(false);
        expect(checkResetGuard({DEMO_RESET_CONFIRM_PROJECT_REF: REF}).ok).toBe(false);
    });
    it("refuses local and non-Supabase databases even with a confirmation", () => {
        expect(checkResetGuard({DEMO_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:56322/postgres", DEMO_RESET_CONFIRM_PROJECT_REF: "127.0.0.1"}).ok).toBe(false);
    });
});
