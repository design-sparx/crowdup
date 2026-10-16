import {describe, expect, it} from "vitest";
import {publishOwnDraft, startOnboarding, syncAccountStatus, type ConnectStore, type StripeConnectApi} from "./connect";

function fakes(opts: {accountId?: string | null; account?: Partial<{detailsSubmitted: boolean; chargesEnabled: boolean; defaultCurrency: string | null}>; suspended?: boolean; drafts?: string[]; stored?: boolean} = {}) {
    const calls: string[] = [];
    let accountId = opts.accountId ?? null;
    const published: {id: string; currency: string}[] = [];
    const submitted: {id: string; currency: string}[] = [];
    const saved: {complete: boolean; currency: string | null}[] = [];
    const api: StripeConnectApi = {
        async createAccount() { calls.push("createAccount"); return {id: "acct_new"}; },
        async createAccountLink(p) { calls.push(`link:${p.account}:${p.returnUrl}:${p.refreshUrl}`); return {url: "https://connect.stripe.test/x"}; },
        async retrieveAccount(id) {
            calls.push(`retrieve:${id}`);
            return {id, detailsSubmitted: true, chargesEnabled: true, defaultCurrency: "kes", ...opts.account};
        },
    };
    const store: ConnectStore = {
        async getProfile() { return {stripeAccountId: accountId, suspended: opts.suspended ?? false, onboardingComplete: opts.stored ?? false, currency: opts.stored ? "KES" : null}; },
        async findUserByAccountId() { return null; },
        async saveAccountId(_u, id) { if (accountId) return false; accountId = id; return true; },
        async saveStatus(_u, s) { saved.push(s); },
        async listDrafts() { return (opts.drafts ?? []).map(id => ({id})); },
        async publish(id, currency) { published.push({id, currency}); return true; },
        async submitForApproval(id, currency) { submitted.push({id, currency}); return true; },
    };
    return {api, store, calls, published, submitted, saved};
}

describe("startOnboarding", () => {
    it("creates an account on first use and links back to the given urls", async () => {
        const f = fakes();
        const url = await startOnboarding({api: f.api, store: f.store, userId: "u1", email: "a@b.c", returnUrl: "https://x/stripe/return", refreshUrl: "https://x/stripe/refresh"});
        expect(url).toBe("https://connect.stripe.test/x");
        expect(f.calls).toEqual(["createAccount", "link:acct_new:https://x/stripe/return:https://x/stripe/refresh"]);
    });
    it("reuses the stored account instead of creating another", async () => {
        const f = fakes({accountId: "acct_old"});
        await startOnboarding({api: f.api, store: f.store, userId: "u1", email: null, returnUrl: "r", refreshUrl: "f"});
        expect(f.calls).toEqual(["link:acct_old:r:f"]);
    });
    it("refuses suspended organisers", async () => {
        const f = fakes({suspended: true});
        await expect(startOnboarding({api: f.api, store: f.store, userId: "u1", email: null, returnUrl: "r", refreshUrl: "f"})).rejects.toThrow(/suspended/i);
        expect(f.calls).toEqual([]);
    });
});

describe("syncAccountStatus", () => {
    it("does nothing without a connected account", async () => {
        const f = fakes();
        expect(await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode: "auto"}))
            .toEqual({status: "not_started", currency: null, published: 0, submitted: 0});
        expect(f.saved).toEqual([]);
    });
    it("stores incomplete status and publishes nothing", async () => {
        const f = fakes({accountId: "acct_1", account: {chargesEnabled: false}, drafts: ["c1"]});
        const r = await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode: "auto"});
        expect(r.status).toBe("incomplete");
        expect(f.saved).toEqual([{complete: false, currency: "KES"}]);
        expect(f.published).toEqual([]);
    });
    it("publishes drafts with the account currency when complete in auto mode", async () => {
        const f = fakes({accountId: "acct_1", drafts: ["c1", "c2"]});
        const r = await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode: "auto"});
        expect(r).toEqual({status: "connected", currency: "KES", published: 2, submitted: 0});
        expect(f.published).toEqual([{id: "c1", currency: "KES"}, {id: "c2", currency: "KES"}]);
    });
    it("submits drafts for approval instead of publishing in approval mode", async () => {
        const f = fakes({accountId: "acct_1", drafts: ["c1"]});
        const r = await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode: "approval"});
        expect(r).toEqual({status: "connected", currency: "KES", published: 0, submitted: 1});
        expect(f.published).toEqual([]);
        expect(f.submitted).toEqual([{id: "c1", currency: "KES"}]);
    });
    it("submits nothing in either mode before onboarding completes", async () => {
        for (const mode of ["auto", "approval"] as const) {
            const f = fakes({accountId: "acct_1", drafts: ["c1"], account: {chargesEnabled: false}});
            await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode});
            expect(f.published).toEqual([]);
            expect(f.submitted).toEqual([]);
        }
    });
    it("does not publish for a suspended owner", async () => {
        const f = fakes({accountId: "acct_1", drafts: ["c1"], suspended: true});
        expect((await syncAccountStatus({api: f.api, store: f.store, userId: "u1", mode: "auto"})).published).toBe(0);
    });
});

describe("publishOwnDraft", () => {
    const run = (f: ReturnType<typeof fakes>, mode: "auto" | "approval" = "auto", campaignId = "c1") =>
        publishOwnDraft({store: f.store, userId: "u1", campaignId, mode});
    it("publishes an own draft with the stored account currency", async () => {
        const f = fakes({stored: true, drafts: ["c1"]});
        expect(await run(f)).toBe("live");
        expect(f.published).toEqual([{id: "c1", currency: "KES"}]);
    });
    it("refuses until onboarding is complete", async () => {
        const f = fakes({drafts: ["c1"]});
        expect(await run(f)).toBe("not_connected");
        expect(f.published).toEqual([]);
    });
    it("holds for approval in approval mode", async () => {
        const f = fakes({stored: true, drafts: ["c1"]});
        expect(await run(f, "approval")).toBe("awaiting_approval");
        expect(f.published).toEqual([]);
        expect(f.submitted).toEqual([{id: "c1", currency: "KES"}]);
    });
    it("cannot publish a campaign that is not one of the owner's drafts", async () => {
        const f = fakes({stored: true, drafts: ["c1"]});
        expect(await run(f, "auto", "someone-elses")).toBe("not_found");
        expect(f.published).toEqual([]);
    });
});
