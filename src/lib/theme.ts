export const THEME_STORAGE_KEY = "theme";

/** What the page should look like: a stored light/dark choice wins, anything else follows the system. */
export function resolveTheme(stored: string | null, prefersDark: boolean): "light" | "dark" {
    if (stored === "light" || stored === "dark") return stored;
    return prefersDark ? "dark" : "light";
}

/**
 * Inline script for <head>. It runs before first paint so there is no flash of the wrong theme.
 * Keep the logic identical to resolveTheme above.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var dark=s==="dark"||(s!=="light"&&d);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;
