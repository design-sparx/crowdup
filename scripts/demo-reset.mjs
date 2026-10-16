// Resets the DEMO database to the seed. Run by .github/workflows/demo-reset.yml.
// Requires psql on PATH. Refuses to run unless the guard passes (see demo-reset-guard.mjs).
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {checkResetGuard} from "./demo-reset-guard.mjs";

const guard = checkResetGuard(process.env);
if (!guard.ok) {
    console.error(`Refusing to reset: ${guard.reason}`);
    process.exit(1);
}
console.log(`Guard passed: resetting demo project ${guard.ref}`);

const file = (name) => fileURLToPath(new URL(`../supabase/${name}`, import.meta.url));

// Single transaction so a failed seed leaves the previous data in place.
// Wiping auth.users cascades to profile. The listed public tables are cleared explicitly.
const wipe = `
begin;
truncate public.report, public.moderation_action, public.donation, public.campaign_update, public.campaign cascade;
delete from auth.users;
`;

const steps = [
    ["-c", wipe],
    ["-f", file("seed.sql")],
    ["-f", file("demo-seed.sql")],
    ["-c", "commit;"],
];

// One psql session (script on stdin) so the transaction spans all steps.
const script = steps
    .map(([flag, value]) => (flag === "-c" ? value : `\\i '${value.replaceAll("\\", "/")}'`))
    .join("\n");
const result = spawnSync("psql", [process.env.DEMO_DATABASE_URL, "-v", "ON_ERROR_STOP=1", "-q"], {
    input: script,
    stdio: ["pipe", "inherit", "inherit"],
});
if (result.status !== 0) {
    console.error("Demo reset failed; the transaction was not committed.");
    process.exit(result.status ?? 1);
}
console.log("Demo database reset to seed.");
