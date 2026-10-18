import type {Page} from "@playwright/test";

/**
 * Shows a caption bar over the page. It is drawn in the page itself, so it appears in the recorded
 * video. Call it before each step; the bar updates in place and never blocks clicks.
 */
export async function caption(page: Page, text: string, ms = 1800) {
    await page.evaluate(
        ({text}) => {
            let bar = document.getElementById("rec-caption") as HTMLDivElement | null;
            if (!bar) {
                bar = document.createElement("div");
                bar.id = "rec-caption";
                Object.assign(bar.style, {
                    position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)",
                    maxWidth: "80%", padding: "10px 18px", borderRadius: "10px",
                    background: "rgba(15,15,15,0.85)", color: "#fff", font: "600 16px system-ui, sans-serif",
                    zIndex: "2147483647", pointerEvents: "none", textAlign: "center",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                });
                document.body.appendChild(bar);
            }
            bar.textContent = text;
            return bar.textContent;
        },
        {text},
    );
    // Read the caption back from the page, so a recording cannot silently miss its caption.
    const shown = await page.evaluate(() => document.getElementById("rec-caption")?.textContent ?? "");
    if (shown !== text) throw new Error(`Caption not shown: expected "${text}", got "${shown}"`);
    await page.waitForTimeout(ms);
}

/** Removes the caption bar, so it does not cover the page between scenes. */
export async function clearCaption(page: Page) {
    await page.evaluate(() => document.getElementById("rec-caption")?.remove());
}
