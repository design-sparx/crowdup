import {createSupabaseServerClient} from "../auth/supabase.server";
import {createRateLimiter} from "../../lib/reports/rateLimit";
import {clientKey, groupOpenReports, parseReason, type ReportGroup, type ReportRow} from "../../lib/reports/reports";

type Supabase = ReturnType<typeof createSupabaseServerClient>["supabase"];

/** 5 reports per hour per user (or per IP for guests). In memory, per server instance; resets on restart. Guests are keyed by the platform client IP header. The limit is spent only when the campaign exists, so mistyped slugs cost nothing. */
const limiter = createRateLimiter({limit: 5, windowMs: 60 * 60 * 1000});

export type ReportSubmitResult = {ok?: true; error?: string; status: number};

export async function submitReport(request: Request, campaignSlug: string, form: FormData) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const fail = (error: string, status: number) => ({result: {error, status} as ReportSubmitResult, headers});

    const parsed = parseReason(form.get("reason"));
    if (!parsed.ok) return fail(parsed.error, 400);

    const {data} = await supabase.auth.getUser();
    const userId = data.user?.id ?? null;
    const {data: campaign} = await supabase
        .from("campaign")
        .select("id")
        .eq("slug", campaignSlug)
        .eq("status", "live")
        .maybeSingle();
    if (!campaign) return fail("This campaign cannot be reported.", 404);

    if (!limiter.take(clientKey(userId, request.headers))) {
        return fail("Too many reports. Please try again later.", 429);
    }


    // No .select(): reporters have no read access to reports, so RETURNING would be denied.
    const {error} = await supabase
        .from("report")
        .insert({campaign_id: campaign.id, reporter_id: userId, reason: parsed.reason});
    if (error?.code === "23505") return fail("You already have an open report on this campaign.", 409);
    if (error) return fail("Could not send your report. Please try again.", 500);
    return {result: {ok: true, status: 200} as ReportSubmitResult, headers};
}

/**
 * Admin only. Returns null for anyone else, decided by the database (is_admin() reads
 * profile.role), not by anything in the session. RLS independently hides reports from
 * non-admins, so a mistake here still cannot leak data.
 */
export async function getAdminContext(request: Request) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const {data} = await supabase.auth.getUser();
    if (!data.user) return null;
    const {data: isAdmin} = await supabase.rpc("is_admin");
    if (isAdmin !== true) return null;
    return {supabase, headers, user: data.user};
}

export async function listOpenReportGroups(supabase: Supabase) {
    const {data, error} = await supabase
        .from("report")
        .select("id, campaign_id, reason, reporter_id, created_at, campaign:campaign_id(title, slug)")
        .eq("status", "open")
        .order("created_at", {ascending: true});
    if (error) throw new Error("Could not load reports");
    const rows = (data ?? []) as unknown as ReportRow[];
    const groups: ReportGroup[] = groupOpenReports(rows);
    return {groups, openCount: rows.length};
}

export async function dismissReports(supabase: Supabase, ids: string[]) {
    const {error} = await supabase.from("report").update({status: "dismissed"}).in("id", ids).eq("status", "open");
    return !error;
}
