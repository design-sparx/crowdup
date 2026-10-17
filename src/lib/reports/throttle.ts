import {createRateLimiter} from "./rateLimit";

const HOUR = 60 * 60 * 1000;

/**
 * Two limits for the report endpoint. `attempt` is spent on every submission, so unknown
 * slugs cannot hammer the database for free; its ceiling is generous because a mistyped slug
 * is innocent. `report` is the tight cap, spent only once the campaign exists.
 */
export function createReportThrottle(now?: () => number) {
    const attempts = createRateLimiter({limit: 30, windowMs: HOUR, now});
    const reports = createRateLimiter({limit: 5, windowMs: HOUR, now});
    return {
        attempt: (key: string) => attempts.take(key),
        report: (key: string) => reports.take(key),
    };
}
