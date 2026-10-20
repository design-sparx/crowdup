import {describe, expect, it} from "vitest";
import {parseAuthConfig} from "./authConfig";

const base = {SUPABASE_URL: "http://localhost:54321", SUPABASE_ANON_KEY: "anon"};

describe("parseAuthConfig", () => {
    it("hides Google unless explicitly enabled", () => {
        expect(parseAuthConfig(base).googleEnabled).toBe(false);
        expect(parseAuthConfig({...base, AUTH_GOOGLE_ENABLED: "false"}).googleEnabled).toBe(false);
        expect(parseAuthConfig({...base, AUTH_GOOGLE_ENABLED: "TRUE"}).googleEnabled).toBe(true);
        expect(parseAuthConfig({...base, AUTH_GOOGLE_ENABLED: "1"}).googleEnabled).toBe(true);
    });

    it("hides signup unless explicitly enabled", () => {
        expect(parseAuthConfig(base).signupEnabled).toBe(false);
        expect(parseAuthConfig({...base, AUTH_SIGNUP_ENABLED: "false"}).signupEnabled).toBe(false);
        expect(parseAuthConfig({...base, AUTH_SIGNUP_ENABLED: "TRUE"}).signupEnabled).toBe(true);
        expect(parseAuthConfig({...base, AUTH_SIGNUP_ENABLED: "1"}).signupEnabled).toBe(true);
    });

    it("requires the Supabase url and key", () => {
        expect(() => parseAuthConfig({SUPABASE_ANON_KEY: "x"})).toThrow(/SUPABASE_URL/);
        expect(() => parseAuthConfig({SUPABASE_URL: "x"})).toThrow(/SUPABASE_ANON_KEY/);
    });

    it("trims trailing slashes from the site url", () => {
        expect(parseAuthConfig({...base, SITE_URL: "https://a.org//"}).siteUrl).toBe("https://a.org");
        expect(parseAuthConfig(base).siteUrl).toBeNull();
    });
});
