import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * "5 Mar 2026". Always the UTC calendar day: the server renders in UTC and the browser in the
 * visitor's timezone, and different text on each side is a React hydration mismatch.
 */
export function formatDate(iso: string): string {
    return dayjs.utc(iso).format("D MMM YYYY");
}
