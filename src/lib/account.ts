/** The signed-in person as the UI needs it. Built on the server, safe to send to the browser. */
export interface Account {
    name: string;
    avatar: string | null;
}

export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    return words.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
}
