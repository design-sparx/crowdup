import {IconMoon, IconSun} from "@tabler/icons-react";
import {Button} from "@/components/ui/button";
import {THEME_STORAGE_KEY} from "@/lib/theme";

function toggleTheme() {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
        // Storage can be blocked (private mode); the toggle still works for this page view.
    }
}

export function ThemeToggle() {
    return (
        <Button variant="ghost" size="icon" className="size-11 md:size-9" aria-label="Toggle theme" onClick={toggleTheme}>
            <IconSun className="hidden dark:block"/>
            <IconMoon className="dark:hidden"/>
        </Button>
    );
}
