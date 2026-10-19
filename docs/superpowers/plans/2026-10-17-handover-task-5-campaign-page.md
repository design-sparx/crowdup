# Handover: Task 5 (campaign page with the donate panel built in)

Audience: an implementing agent with no context. Follow this file literally, top to bottom. Do not improve, refactor or "fix" anything not listed. If a step does not behave as written, **stop and report** (see "When to stop"). Never guess.

Repo: `D:\works\design-sparx\crowdup`. Branch: `main`. Package manager: `pnpm` only.

This file replaces "Task 5" in `docs/superpowers/plans/2026-10-17-ui-rebuild.md`. Do not edit that file.

## What you are building

The public campaign page `/campaigns/:slug` (`src/routes/campaign-details.tsx`). Today its component renders "Campaign" placeholder text. The **loader and action already exist and must not change**. The page shows the campaign, and the donate form is **part of the page** (a sticky panel on desktop, below the story on mobile). No drawer, no separate donate page. Donating needs no account.

### Server contracts (read-only, already implemented)

Loader returns:

```ts
{
  campaign: CampaignDetails,          // src/lib/campaigns/types.ts (amounts in MINOR units)
  storyHtml: string,                  // already sanitised on the server; render with dangerouslySetInnerHTML
  updates: CampaignUpdate[],          // {id, body, createdAt}; body is PLAIN TEXT
  status: string,                     // "ended" when past end date
  acceptingDonations: boolean,
  donors: RecentDonor[],              // {id, donorName: string|null, message: string|null, amount, currency, createdAt}
  donationReturn: "success" | "cancelled" | null,
}
```

The route component receives `loaderData.status`; pass `ended={loaderData.status === "ended"}` to the page.

Action (same route) takes a form POST with a hidden `intent`:

- `intent=donate` with fields `amount` (major units text, e.g. `25`), `name`, `email`, `message`, `anonymous` (`on` when checked). On success the server **redirects to Stripe**. On failure it returns `{error: string}` with a 4xx/5xx status.
- `intent=report` with field `reason`. Returns `{ok: true}` or `{error: string}`.

Limits to reuse (do not retype the numbers): `MAX_NAME`, `MAX_EMAIL`, `MAX_MESSAGE` from `@/lib/donations/donor`; `REASON_MAX` from `@/lib/reports/reports`; `presetsMinor`, `minorUnitExponent`, `formatMinor` from `@/lib/donations/amount`.

## Ground rules

1. **Never push.** Never run `git push`, never open a PR.
2. **Never edit** `src/data-access/**`, `src/components/ui/**`, `supabase/**`, `src/lib/donations/**`, `src/lib/campaigns/repository.ts`, or the `loader`, `action`, `meta` and `ErrorBoundary` exports of `campaign-details.tsx`.
3. **Save every file as UTF-8 with LF line endings.** (A previous agent saved a spec as UTF-16 and the test runner could not read it.) After writing `e2e/*.spec.ts`, run `file e2e/*.spec.ts` and confirm it says "ASCII text" or "UTF-8", never "UTF-16".
4. **Never weaken an assertion to make a test pass.** If a test fails because the component is wrong, fix the component. If you believe the assertion itself is wrong, stop and report with the failing output.
5. Files and folders are **kebab-case**; exported components PascalCase. Each component: its own folder under `src/features/donate/` with `name.tsx`, `name.test.tsx`, one-line `index.ts` (`export {Name} from "./name";`). No other `index.ts`. No aggregate barrels.
6. Icons: only `@tabler/icons-react`. Class names: `cn()` from `@/lib/utils`. Colours: only theme tokens (`text-muted-foreground`, `bg-muted`, `text-destructive`...), never raw colours. Use `@/` imports and import from the file or component folder, never a barrel.
7. Do **not** use the shadcn `PaginationLink/Previous/Next` (they render `<a role="button">`).
8. Every component test starts with the exact first line `// @vitest-environment jsdom`. Use `renderWithRouter` from `@/test/render-with-router` when the component has links, `Form` or `useFetcher`.
9. After every step marked VERIFY run the command. If the output differs from "Expected", stop and report.
10. Commit after each step marked COMMIT with exactly the given message. Commits are local.
11. Kill any process you start before you finish.

## Known baseline

Run once; write the numbers in your report:

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: lint clean, `Test Files  57 passed (57)`, `Tests  393 passed (393)`, build exits 0. If any number differs or anything fails, stop and report.

---

## Step A: pure helpers (tests first)

**Create `src/lib/donations/panel.test.ts`:**

```ts
import {describe, expect, it} from "vitest";
import {presetOptions, selectedPreset} from "./panel";

describe("presetOptions", () => {
    it("turns the currency's presets into major-unit strings with a display label", () => {
        const options = presetOptions("USD");
        expect(options.map((o) => o.value)).toEqual(["10", "25", "50", "100"]);
        expect(options[1].label).toBe("$25.00");
    });
    it("has no decimals for a zero-decimal currency", () => {
        const options = presetOptions("JPY");
        expect(options.map((o) => o.value)).toEqual(["10", "25", "50", "100"]);
        expect(options[0].label).toBe("¥10");
    });
});

describe("selectedPreset", () => {
    it("returns the preset that equals the typed amount", () => {
        expect(selectedPreset("25", "USD")).toBe("25");
    });
    it("ignores surrounding spaces", () => {
        expect(selectedPreset(" 50 ", "USD")).toBe("50");
    });
    it("returns null for a custom amount", () => {
        expect(selectedPreset("30", "USD")).toBeNull();
        expect(selectedPreset("25.5", "USD")).toBeNull();
        expect(selectedPreset("", "USD")).toBeNull();
    });
});
```

**Run:** `pnpm test src/lib/donations/panel.test.ts`. Expected: FAIL (module `./panel` not found).

**Create `src/lib/donations/panel.ts`:**

```ts
import {formatMinor, minorUnitExponent, presetsMinor} from "./amount";

export interface PresetOption {
    /** Major units as the form field wants them, e.g. "25". */
    value: string;
    /** Display text, e.g. "$25.00". */
    label: string;
}

export function presetOptions(currency: string): PresetOption[] {
    const exp = minorUnitExponent(currency);
    return presetsMinor(currency).map((minor) => ({
        value: String(minor / 10 ** exp),
        label: formatMinor(minor, currency),
    }));
}

/** The preset matching what the donor typed, or null for a custom amount. */
export function selectedPreset(amount: string, currency: string): string | null {
    const typed = amount.trim();
    return presetOptions(currency).find((o) => o.value === typed)?.value ?? null;
}
```

**VERIFY:** `pnpm test src/lib/donations/panel.test.ts`. Expected: all pass. If the `JPY` label test fails only because of the yen symbol format, print the actual label and fix the **expected string in the test** to the exact value `formatMinor(10, "JPY")` returns; say so in your report.

**COMMIT** `feat(donate): add donate panel preset helpers`

---

## Step B: components

All under `src/features/donate/`.

### B1. `donate-panel/`

The form posts to the **current route** (the campaign page), so use a plain React Router `<Form method="post">` with no `action` prop. The server's error comes back through `useActionData`. Keep the typed amount in local state so presets can set it; every other field is uncontrolled.

`donate-panel.tsx`:

```tsx
import {useState} from "react";
import {Form, useActionData, useNavigation} from "react-router";
import {IconLock} from "@tabler/icons-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {presetOptions, selectedPreset} from "@/lib/donations/panel";
import {MAX_EMAIL, MAX_MESSAGE, MAX_NAME} from "@/lib/donations/donor";
import {cn} from "@/lib/utils";

interface DonatePanelProps {
    currency: string;
    acceptingDonations: boolean;
    /** Shown above the form, e.g. after returning from a cancelled payment. */
    notice?: string | null;
}

export function DonatePanel({currency, acceptingDonations, notice = null}: DonatePanelProps) {
    const actionData = useActionData() as {error?: string} | undefined;
    const navigation = useNavigation();
    const submitting = navigation.state !== "idle" && navigation.formData?.get("intent") === "donate";
    const presets = presetOptions(currency);
    const [amount, setAmount] = useState(presets[1]?.value ?? "");
    const active = selectedPreset(amount, currency);

    if (!acceptingDonations) {
        return (
            <Alert>
                <AlertDescription>This campaign is not accepting donations.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Form method="post" className="space-y-5" aria-label="Donate">
            <input type="hidden" name="intent" value="donate"/>
            {notice ? (
                <Alert role="status">
                    <AlertDescription>{notice}</AlertDescription>
                </Alert>
            ) : null}
            <FieldGroup>
                <div role="group" aria-label="Preset amounts" className="grid grid-cols-4 gap-2">
                    {presets.map((preset) => (
                        <Button
                            key={preset.value}
                            type="button"
                            variant={active === preset.value ? "default" : "outline"}
                            aria-pressed={active === preset.value}
                            onClick={() => setAmount(preset.value)}
                            className={cn("px-0")}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
                <Field>
                    <FieldLabel htmlFor="donation-amount">Amount ({currency})</FieldLabel>
                    <Input
                        id="donation-amount"
                        name="amount"
                        inputMode="decimal"
                        required
                        autoComplete="off"
                        value={amount}
                        onChange={(event) => setAmount(event.currentTarget.value)}
                    />
                    <FieldDescription>Or type your own amount.</FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-name">Your name (optional)</FieldLabel>
                    <Input id="donation-name" name="name" maxLength={MAX_NAME} autoComplete="name"/>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-email">Email for your receipt (optional)</FieldLabel>
                    <Input id="donation-email" name="email" type="email" maxLength={MAX_EMAIL} autoComplete="email"/>
                </Field>
                <Field>
                    <FieldLabel htmlFor="donation-message">Message (optional)</FieldLabel>
                    <Textarea id="donation-message" name="message" rows={3} maxLength={MAX_MESSAGE}/>
                </Field>
                <Field orientation="horizontal">
                    <Checkbox id="donation-anonymous" name="anonymous"/>
                    <FieldLabel htmlFor="donation-anonymous">Don&apos;t show my name publicly</FieldLabel>
                </Field>
            </FieldGroup>
            {actionData?.error ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Redirecting to payment..." : "Donate now"}
            </Button>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <IconLock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true"/>
                You will be sent to Stripe to pay securely. Your payment goes directly to the organiser.
            </p>
        </Form>
    );
}
```

If `Field` does not accept `orientation="horizontal"` (check `src/components/ui/field.tsx`), drop that prop and wrap the checkbox and label in `<div className="flex items-center gap-2">` instead, and say so in your report.

`donate-panel.test.tsx` (uses a router with an action so `useActionData` and `Form` work for real):

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {createMemoryRouter, RouterProvider} from "react-router";
import {DonatePanel} from "./donate-panel";

function renderPanel(props: Partial<React.ComponentProps<typeof DonatePanel>> = {}, actionResult: unknown = null) {
    const posted: FormData[] = [];
    const router = createMemoryRouter(
        [
            {
                path: "/",
                action: async ({request}) => {
                    posted.push(await request.formData());
                    return actionResult;
                },
                element: <DonatePanel currency="USD" acceptingDonations {...props}/>,
            },
        ],
        {initialEntries: ["/"]},
    );
    render(<RouterProvider router={router}/>);
    return posted;
}

describe("DonatePanel", () => {
    it("starts with the second preset selected and fills the amount", () => {
        renderPanel();
        expect(screen.getByLabelText(/Amount \(USD\)/)).toHaveValue("25");
        expect(screen.getByRole("button", {name: "$25.00"})).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", {name: "$10.00"})).toHaveAttribute("aria-pressed", "false");
    });
    it("choosing a preset changes the amount; typing a custom amount deselects every preset", async () => {
        renderPanel();
        await userEvent.click(screen.getByRole("button", {name: "$50.00"}));
        expect(screen.getByLabelText(/Amount \(USD\)/)).toHaveValue("50");
        const input = screen.getByLabelText(/Amount \(USD\)/);
        await userEvent.clear(input);
        await userEvent.type(input, "30");
        for (const name of ["$10.00", "$25.00", "$50.00", "$100.00"]) {
            expect(screen.getByRole("button", {name})).toHaveAttribute("aria-pressed", "false");
        }
    });
    it("posts intent=donate with the amount, donor fields and the anonymous flag", async () => {
        const posted = renderPanel();
        await userEvent.type(screen.getByLabelText("Your name (optional)"), "Jane");
        await userEvent.type(screen.getByLabelText("Message (optional)"), "Good luck");
        await userEvent.click(screen.getByRole("checkbox", {name: /show my name/i}));
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        await screen.findByRole("form", {name: "Donate"});
        expect(posted).toHaveLength(1);
        expect(posted[0].get("intent")).toBe("donate");
        expect(posted[0].get("amount")).toBe("25");
        expect(posted[0].get("name")).toBe("Jane");
        expect(posted[0].get("message")).toBe("Good luck");
        expect(posted[0].get("anonymous")).toBe("on");
    });
    it("does not send the anonymous field when the box is left unticked", async () => {
        const posted = renderPanel();
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        await screen.findByRole("form", {name: "Donate"});
        expect(posted[0].has("anonymous")).toBe(false);
    });
    it("shows the server's error in an alert", async () => {
        renderPanel({}, {error: "Donate at least $1.00."});
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("Donate at least $1.00.");
    });
    it("replaces the form with a message when the campaign is not accepting donations", () => {
        renderPanel({acceptingDonations: false});
        expect(screen.getByText("This campaign is not accepting donations.")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Donate now"})).not.toBeInTheDocument();
    });
    it("shows an optional notice above the form", () => {
        renderPanel({notice: "Your donation was cancelled. You have not been charged."});
        expect(screen.getByRole("status")).toHaveTextContent("You have not been charged.");
    });
});
```

(Add `import type {ComponentProps} from "react";` and use `ComponentProps<typeof DonatePanel>` instead of `React.ComponentProps` if TypeScript cannot find the `React` namespace.)

`index.ts`: `export {DonatePanel} from "./donate-panel";`

### B2. `story-content/`

`story-content.tsx`:

```tsx
/**
 * The campaign story. `html` is produced and sanitised on the server from an allow-list of
 * Tiptap nodes (src/lib/campaigns/story.ts), so it is safe to inject. Never pass anything else here.
 */
export function StoryContent({html}: {html: string}) {
    if (!html) return null;
    return (
        <div
            className="max-w-none space-y-4 leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6"
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
}
```

`story-content.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StoryContent} from "./story-content";

describe("StoryContent", () => {
    it("renders nothing for an empty story", () => {
        const {container} = render(<StoryContent html=""/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("renders the server-provided HTML", () => {
        render(<StoryContent html="<h2>Our plan</h2><p>Six schools, one tap each.</p>"/>);
        expect(screen.getByRole("heading", {name: "Our plan"})).toBeInTheDocument();
        expect(screen.getByText("Six schools, one tap each.")).toBeInTheDocument();
    });
});
```

`index.ts`: `export {StoryContent} from "./story-content";`

### B3. `updates-list/`

Update bodies are **plain text**: render them as React text with `whitespace-pre-wrap`, never as HTML.

`updates-list.tsx`:

```tsx
import dayjs from "dayjs";
import type {CampaignUpdate} from "@/lib/campaigns/repository";

export function UpdatesList({updates}: {updates: CampaignUpdate[]}) {
    if (updates.length === 0) {
        return <p className="text-sm text-muted-foreground">No updates yet.</p>;
    }
    return (
        <ol className="space-y-5">
            {updates.map((update) => (
                <li key={update.id} className="space-y-1">
                    <time dateTime={update.createdAt} className="text-xs text-muted-foreground">
                        {dayjs(update.createdAt).format("D MMM YYYY")}
                    </time>
                    <p className="whitespace-pre-wrap text-sm">{update.body}</p>
                </li>
            ))}
        </ol>
    );
}
```

`updates-list.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {UpdatesList} from "./updates-list";

describe("UpdatesList", () => {
    it("says so when there are no updates", () => {
        render(<UpdatesList updates={[]}/>);
        expect(screen.getByText("No updates yet.")).toBeInTheDocument();
    });
    it("lists updates with their date", () => {
        render(<UpdatesList updates={[{id: "u1", body: "Funds arrived", createdAt: "2026-03-05T10:00:00Z"}]}/>);
        expect(screen.getByText("Funds arrived")).toBeInTheDocument();
        expect(screen.getByText("5 Mar 2026")).toBeInTheDocument();
    });
    it("shows markup in an update as text, never as HTML", () => {
        const {container} = render(
            <UpdatesList updates={[{id: "u1", body: "<img src=x onerror=alert(1)>hi", createdAt: "2026-03-05T10:00:00Z"}]}/>,
        );
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByText("<img src=x onerror=alert(1)>hi")).toBeInTheDocument();
    });
});
```

(The date test assumes the machine's timezone does not push `2026-03-05T10:00:00Z` to another day. 10:00 UTC is the same calendar day everywhere from UTC-10 to UTC+13.)

`index.ts`: `export {UpdatesList} from "./updates-list";`

### B4. `donors-list/`

Anonymous donors arrive with `donorName: null` and `message: null`: show "Anonymous", and render no message.

`donors-list.tsx`:

```tsx
import dayjs from "dayjs";
import {IconHeart} from "@tabler/icons-react";
import {formatMinor} from "@/lib/donations/amount";
import type {RecentDonor} from "@/lib/campaigns/repository";

export function DonorsList({donors}: {donors: RecentDonor[]}) {
    if (donors.length === 0) {
        return <p className="text-sm text-muted-foreground">No donations yet. Be the first.</p>;
    }
    return (
        <ul className="space-y-4">
            {donors.map((donor) => (
                <li key={donor.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <IconHeart className="size-4" aria-hidden="true"/>
                    </span>
                    <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">
                            {donor.donorName ?? "Anonymous"} · {formatMinor(donor.amount, donor.currency)}
                        </p>
                        {donor.message ? <p className="whitespace-pre-wrap text-sm">{donor.message}</p> : null}
                        <time dateTime={donor.createdAt} className="text-xs text-muted-foreground">
                            {dayjs(donor.createdAt).format("D MMM YYYY")}
                        </time>
                    </div>
                </li>
            ))}
        </ul>
    );
}
```

`donors-list.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {DonorsList} from "./donors-list";

const donor = {
    id: "d1", donorName: "Jane", message: "Good luck", amount: 2500, currency: "USD", createdAt: "2026-03-05T10:00:00Z",
};

describe("DonorsList", () => {
    it("invites the first donation when there are none", () => {
        render(<DonorsList donors={[]}/>);
        expect(screen.getByText("No donations yet. Be the first.")).toBeInTheDocument();
    });
    it("shows name, amount in major units, message and date", () => {
        render(<DonorsList donors={[donor]}/>);
        expect(screen.getByText("Jane · $25.00")).toBeInTheDocument();
        expect(screen.getByText("Good luck")).toBeInTheDocument();
        expect(screen.getByText("5 Mar 2026")).toBeInTheDocument();
    });
    it("shows Anonymous and no message for a masked donor", () => {
        render(<DonorsList donors={[{...donor, id: "d2", donorName: null, message: null}]}/>);
        expect(screen.getByText("Anonymous · $25.00")).toBeInTheDocument();
        expect(screen.queryByText("Good luck")).not.toBeInTheDocument();
    });
});
```

`index.ts`: `export {DonorsList} from "./donors-list";`

### B5. `share-buttons/`

No third-party scripts. Share links are plain URLs; "Copy link" uses the clipboard and falls back silently (a toast confirms on success). The share URL comes from `window.location.href` **at click time only**, so nothing touches `window` during server rendering.

`share-buttons.tsx`:

```tsx
import {IconBrandFacebook, IconBrandX, IconBrandWhatsapp, IconLink, IconMail} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/toast";
import {cn} from "@/lib/utils";

interface ShareButtonsProps {
    title: string;
    /** Absolute campaign URL. When omitted the current page URL is read on click. */
    url?: string;
    className?: string;
}

export function shareLinks(title: string, url: string) {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    return [
        {name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: IconBrandFacebook},
        {name: "X", href: `https://x.com/intent/tweet?url=${u}&text=${t}`, icon: IconBrandX},
        {name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: IconBrandWhatsapp},
        {name: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: IconMail},
    ] as const;
}

export function ShareButtons({title, url, className}: ShareButtonsProps) {
    async function copy() {
        const target = url ?? window.location.href;
        try {
            await navigator.clipboard.writeText(target);
            toast.add({title: "Link copied"});
        } catch {
            toast.add({title: "Could not copy the link", description: target});
        }
    }

    // Links need an absolute URL; before hydration there is no window, so build them lazily.
    const links = url ? shareLinks(title, url) : [];
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
                <IconLink aria-hidden="true"/> Copy link
            </Button>
            {links.map(({name, href, icon: Icon}) => (
                <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({variant: "outline", size: "sm"})}
                >
                    <Icon aria-hidden="true"/> {name}
                </a>
            ))}
        </div>
    );
}
```

Check what the `toast` export in `src/components/ui/toast.tsx` exposes (it is `ToastPrimitive.createToastManager()`), and use its real method for adding a toast (`toast.add({...})` in Base UI). If the method name differs, use the one the file exposes and say so in your report. If `IconBrandX` or `IconBrandWhatsapp` does not exist in `@tabler/icons-react` (check with `node -e "const t=require('@tabler/icons-react');console.log(typeof t.IconBrandX, typeof t.IconBrandWhatsapp)"`), use `IconBrandTwitter` and `IconBrandWhatsapp` respectively, or drop that one link, and say so.

`share-buttons.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {ShareButtons, shareLinks} from "./share-buttons";

describe("shareLinks", () => {
    it("encodes the title and the URL", () => {
        const links = shareLinks("Clean water & schools", "https://crowdup.example/campaigns/a b");
        const x = links.find((l) => l.name === "X");
        expect(x?.href).toContain("url=https%3A%2F%2Fcrowdup.example%2Fcampaigns%2Fa%20b");
        expect(x?.href).toContain("text=Clean%20water%20%26%20schools");
        expect(links.find((l) => l.name === "Email")?.href.startsWith("mailto:?subject=")).toBe(true);
    });
});

describe("ShareButtons", () => {
    it("always offers Copy link", () => {
        render(<ShareButtons title="T"/>);
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
    });
    it("renders share links that open safely in a new tab when a URL is given", () => {
        render(<ShareButtons title="T" url="https://crowdup.example/campaigns/a"/>);
        const link = screen.getByRole("link", {name: "WhatsApp"});
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
```

`index.ts`: `export {ShareButtons} from "./share-buttons";`

### B6. `report-dialog/`

Posts to the **current route's** action with `intent=report` through `useFetcher`, so the page does not navigate. Works for guests.

`report-dialog.tsx`:

```tsx
import {useState} from "react";
import {useFetcher} from "react-router";
import {IconFlag} from "@tabler/icons-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {REASON_MAX} from "@/lib/reports/reports";

type ReportResult = {ok?: boolean; error?: string};

export function ReportDialog() {
    const [open, setOpen] = useState(false);
    const fetcher = useFetcher<ReportResult>();
    const sending = fetcher.state !== "idle";
    const done = fetcher.data?.ok === true;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="text-muted-foreground"/>}>
                <IconFlag aria-hidden="true"/> Report campaign
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report this campaign</DialogTitle>
                    <DialogDescription>
                        Tell our moderators what is wrong. You do not need an account.
                    </DialogDescription>
                </DialogHeader>
                {done ? (
                    <div className="space-y-4">
                        <Alert role="status">
                            <AlertDescription>Thanks. Our moderators will review your report.</AlertDescription>
                        </Alert>
                        <DialogFooter>
                            <DialogClose render={<Button type="button"/>}>Close</DialogClose>
                        </DialogFooter>
                    </div>
                ) : (
                    <fetcher.Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="report"/>
                        <Field data-invalid={fetcher.data?.error ? true : undefined}>
                            <FieldLabel htmlFor="report-reason">What is wrong with this campaign?</FieldLabel>
                            <Textarea id="report-reason" name="reason" rows={4} required maxLength={REASON_MAX}/>
                            {fetcher.data?.error ? <FieldError>{fetcher.data.error}</FieldError> : null}
                        </Field>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline"/>}>Cancel</DialogClose>
                            <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Send report"}</Button>
                        </DialogFooter>
                    </fetcher.Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
```

`report-dialog.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {createMemoryRouter, RouterProvider} from "react-router";
import {ReportDialog} from "./report-dialog";

function renderDialog(actionResult: unknown) {
    const posted: FormData[] = [];
    const router = createMemoryRouter(
        [
            {
                path: "/",
                action: async ({request}) => {
                    posted.push(await request.formData());
                    return actionResult;
                },
                element: <ReportDialog/>,
            },
        ],
        {initialEntries: ["/"]},
    );
    render(<RouterProvider router={router}/>);
    return posted;
}

describe("ReportDialog", () => {
    it("is closed until the trigger is clicked", async () => {
        renderDialog({ok: true});
        expect(screen.queryByLabelText("What is wrong with this campaign?")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        expect(await screen.findByLabelText("What is wrong with this campaign?")).toBeInTheDocument();
    });
    it("posts intent=report with the reason and then thanks the reporter", async () => {
        const posted = renderDialog({ok: true});
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        await userEvent.type(await screen.findByLabelText("What is wrong with this campaign?"), "Looks like a scam");
        await userEvent.click(screen.getByRole("button", {name: "Send report"}));
        expect(await screen.findByText("Thanks. Our moderators will review your report.")).toBeInTheDocument();
        expect(posted[0].get("intent")).toBe("report");
        expect(posted[0].get("reason")).toBe("Looks like a scam");
    });
    it("shows the server's error and keeps the form open", async () => {
        renderDialog({error: "You already have an open report on this campaign."});
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        await userEvent.type(await screen.findByLabelText("What is wrong with this campaign?"), "Spam again");
        await userEvent.click(screen.getByRole("button", {name: "Send report"}));
        expect(await screen.findByText("You already have an open report on this campaign.")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Send report"})).toBeInTheDocument();
    });
});
```

`index.ts`: `export {ReportDialog} from "./report-dialog";`

### B7. `campaign-details-page/`

Layout: cover image, title and meta, a notice area, then **two columns on `lg`**: left = tabs (Story, Updates, Donors), right = a sticky card with the money summary and the donate panel. On small screens the right column stacks **above the tabs** (donate is the point of the page). Share buttons and the report dialog sit under the summary.

`campaign-details-page.tsx`:

```tsx
import dayjs from "dayjs";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Progress} from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CampaignCover} from "@/features/donate/campaign-cover";
import {DonatePanel} from "@/features/donate/donate-panel";
import {DonorsList} from "@/features/donate/donors-list";
import {ReportDialog} from "@/features/donate/report-dialog";
import {ShareButtons} from "@/features/donate/share-buttons";
import {StoryContent} from "@/features/donate/story-content";
import {UpdatesList} from "@/features/donate/updates-list";
import {formatMinorAmount} from "@/helpers/formatAmount";
import type {CampaignUpdate, RecentDonor} from "@/lib/campaigns/repository";
import type {CampaignDetails} from "@/lib/campaigns/types";

interface CampaignDetailsPageProps {
    campaign: CampaignDetails;
    storyHtml: string;
    updates: CampaignUpdate[];
    donors: RecentDonor[];
    ended: boolean;
    acceptingDonations: boolean;
    donationReturn: "success" | "cancelled" | null;
}

export function CampaignDetailsPage({
    campaign,
    storyHtml,
    updates,
    donors,
    ended,
    acceptingDonations,
    donationReturn,
}: CampaignDetailsPageProps) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
                    <div className="overflow-hidden rounded-3xl">
                        <CampaignCover src={campaign.imageUrl}/>
                    </div>
                    <header className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{campaign.category}</Badge>
                            <Badge variant="outline">{campaign.country}</Badge>
                            {ended ? <Badge variant="destructive">Ended</Badge> : null}
                        </div>
                        <h1 className="text-3xl font-semibold leading-tight">{campaign.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Created by {campaign.organizerName} on {dayjs(campaign.createdAt).format("D MMM YYYY")}
                        </p>
                        <p className="text-muted-foreground">{campaign.description}</p>
                    </header>
                    {donationReturn === "success" ? (
                        <Alert role="status">
                            <AlertTitle>Thank you for your donation!</AlertTitle>
                            <AlertDescription>
                                Your payment is being confirmed. The total updates as soon as it is.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {ended ? (
                        <Alert role="status">
                            <AlertDescription>This campaign has ended and is no longer accepting donations.</AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
                    <Card>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <p className="text-3xl font-semibold">
                                    {formatMinorAmount(campaign.raisedAmount, campaign.currency)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    raised of {formatMinorAmount(campaign.goalAmount, campaign.currency)} ·{" "}
                                    {campaign.donorCount} {campaign.donorCount === 1 ? "donor" : "donors"}
                                </p>
                                <Progress value={campaign.percentFunded} aria-label="Funding progress"/>
                                <p className="text-sm font-medium">{campaign.percentFunded}% funded</p>
                            </div>
                            <DonatePanel
                                currency={campaign.currency}
                                acceptingDonations={acceptingDonations}
                                notice={
                                    donationReturn === "cancelled"
                                        ? "Your donation was cancelled. You have not been charged."
                                        : null
                                }
                            />
                        </CardContent>
                    </Card>
                    <ShareButtons title={campaign.title}/>
                    <ReportDialog/>
                </aside>

                <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                    <Tabs defaultValue="story">
                        <TabsList>
                            <TabsTrigger value="story">Story</TabsTrigger>
                            <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
                            <TabsTrigger value="donors">Donors</TabsTrigger>
                        </TabsList>
                        <TabsContent value="story" className="pt-4">
                            {storyHtml ? <StoryContent html={storyHtml}/> : (
                                <p className="text-sm text-muted-foreground">The organiser has not written a story yet.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="updates" className="pt-4">
                            <UpdatesList updates={updates}/>
                        </TabsContent>
                        <TabsContent value="donors" className="pt-4">
                            <DonorsList donors={donors}/>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
```

Note: `ShareButtons` is rendered without `url` here, so it shows only "Copy link" (it reads the real URL on click). To also show the social links, the route passes an absolute URL; **do not add that**. Keep Copy link only for now.

`campaign-details-page.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import type {CampaignDetails} from "@/lib/campaigns/types";
import {CampaignDetailsPage} from "./campaign-details-page";

const campaign: CampaignDetails = {
    id: "c1", slug: "clean-water", title: "Clean water for schools", description: "Filtered water points.",
    category: "Community", country: "KE", imageUrl: null, goalAmount: 500000, raisedAmount: 310000, donorCount: 2,
    currency: "KES", endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "Amina",
    organizerAvatarUrl: null, percentFunded: 62, story: null,
};

const base = {
    campaign, storyHtml: "<p>Six schools.</p>", updates: [], donors: [], ended: false,
    acceptingDonations: true, donationReturn: null as "success" | "cancelled" | null,
};

describe("CampaignDetailsPage", () => {
    it("has one h1 with the title, and the organiser and money summary", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Clean water for schools"})).toBeInTheDocument();
        expect(screen.getByText(/Created by Amina/)).toBeInTheDocument();
        expect(screen.getByText(/3,100\.00/)).toBeInTheDocument();
        expect(screen.getByText("62% funded")).toBeInTheDocument();
        expect(screen.getByRole("progressbar", {name: "Funding progress"})).toHaveAttribute("aria-valuenow", "62");
    });
    it("shows the donate form on the page itself", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("form", {name: "Donate"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Donate now"})).toBeInTheDocument();
    });
    it("replaces the form when donations are closed, and says so when ended", () => {
        renderWithRouter(<CampaignDetailsPage {...base} acceptingDonations={false} ended/>);
        expect(screen.queryByRole("form", {name: "Donate"})).not.toBeInTheDocument();
        expect(screen.getByText("This campaign is not accepting donations.")).toBeInTheDocument();
        expect(screen.getByText(/has ended and is no longer accepting donations/)).toBeInTheDocument();
    });
    it("thanks the donor after a successful payment, without claiming a recorded amount", () => {
        renderWithRouter(<CampaignDetailsPage {...base} donationReturn="success"/>);
        expect(screen.getByText("Thank you for your donation!")).toBeInTheDocument();
        expect(screen.getByText(/being confirmed/)).toBeInTheDocument();
    });
    it("tells the donor nothing was charged after a cancelled payment, and keeps the form usable", () => {
        renderWithRouter(<CampaignDetailsPage {...base} donationReturn="cancelled"/>);
        expect(screen.getByText(/You have not been charged/)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Donate now"})).toBeEnabled();
    });
    it("switches between the story, updates and donors tabs", async () => {
        renderWithRouter(
            <CampaignDetailsPage
                {...base}
                updates={[{id: "u1", body: "Funds arrived", createdAt: "2026-03-05T10:00:00Z"}]}
                donors={[{id: "d1", donorName: "Jane", message: null, amount: 2500, currency: "KES", createdAt: "2026-03-05T10:00:00Z"}]}
            />,
        );
        expect(screen.getByText("Six schools.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("tab", {name: /Updates/}));
        expect(await screen.findByText("Funds arrived")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("tab", {name: "Donors"}));
        expect(await screen.findByText(/Jane/)).toBeInTheDocument();
    });
    it("offers Copy link and Report campaign", () => {
        renderWithRouter(<CampaignDetailsPage {...base}/>);
        expect(screen.getByRole("button", {name: "Copy link"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Report campaign"})).toBeInTheDocument();
    });
});
```

`index.ts`: `export {CampaignDetailsPage} from "./campaign-details-page";`

### B8. VERIFY and COMMIT

```bash
pnpm lint && pnpm test
```

Expected: lint clean; all tests pass (`Test Files` rises by 7). Likely small fixes, each must be **in the component or an import, never an assertion weakened**:

- A Base UI component (`Tabs`, `Dialog`) may need the router or a jsdom API (`ResizeObserver`, `matchMedia`, `PointerEvent`): add a minimal stub to `src/test/setup.ts`, and say so in your report.
- If `getByRole("form", {name: "Donate"})` finds nothing, the `<form>` needs `aria-label="Donate"` (it is already in the code above); print the DOM with `screen.debug()` to see what is rendered.

**COMMIT** `feat(donate): add campaign page components and the built-in donate panel`

---

## Step C: wire the route

In `src/routes/campaign-details.tsx` change **only** the import of `ComingSoonPage` and the default export. Keep `action`, `loader`, `meta` and the `ErrorBoundary` re-export exactly as they are.

1. Remove `ComingSoonPage` from the `../pages` import (keep `DetailError404Page`).
2. Add `import {CampaignDetailsPage} from "@/features/donate/campaign-details-page";`.
3. Replace the default export with:

```tsx
export default function CampaignDetails({loaderData}: Route.ComponentProps) {
    return (
        <CampaignDetailsPage
            campaign={loaderData.campaign}
            storyHtml={loaderData.storyHtml}
            updates={loaderData.updates}
            donors={loaderData.donors}
            ended={loaderData.status === "ended"}
            acceptingDonations={loaderData.acceptingDonations}
            donationReturn={loaderData.donationReturn}
        />
    );
}
```

**VERIFY:**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: all pass; build exits 0.

**COMMIT** `feat(donate): rebuild the campaign page with a built-in donate panel`

---

## Step D: end-to-end

The campaign page needs a seeded database. These tests do **not** need Stripe: they stop before payment.

First read `.env.local` exists, then check Supabase:

```bash
pnpm exec supabase status
```

If it shows stopped services or an error, run `pnpm exec supabase start` and wait. If the seed is missing (the test below cannot find "Clean water for Kibera schools"), run `pnpm exec supabase db reset` (resets the **local** database only).

**Replace the whole of `e2e/donate.spec.ts` with** (UTF-8, LF):

```ts
import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied and SUPABASE_URL /
// SUPABASE_ANON_KEY set (see .env.local). The first two tests stop before Stripe.
// The test that reaches Checkout needs a campaign whose organiser has a connected Stripe
// test account: set E2E_DONATE_CAMPAIGN_URL to that campaign's page to run it.

const SLUG = "/campaigns/community-kitchen-ealing";

test("the campaign page shows the story, the money summary and a donate form on the page", async ({page}) => {
    await page.goto(SLUG);
    await expect(page.getByRole("heading", {level: 1, name: "Community kitchen in Ealing"})).toBeVisible();
    await expect(page.getByRole("form", {name: "Donate"})).toBeVisible();
    await expect(page.getByRole("button", {name: "Donate now"})).toBeVisible();
    await expect(page.getByText(/funded/)).toBeVisible();
});

test("choosing a preset fills the amount, and an invalid amount shows the server's error", async ({page}) => {
    await page.goto(SLUG);
    // The seeded campaign is in GBP, so the preset is labelled with a pound sign.
    await page.getByRole("button", {name: /50\.00/}).first().click();
    await expect(page.getByLabel(/^Amount/)).toHaveValue("50");
    await page.getByLabel(/^Amount/).fill("0.10");
    await page.getByRole("button", {name: "Donate now"}).click();
    await expect(page.getByRole("alert")).toContainText(/at least/i);
});

test("a cancelled payment shows a notice and the form is still usable", async ({page}) => {
    await page.goto(`${SLUG}?donation=cancelled`);
    await expect(page.getByText(/You have not been charged/)).toBeVisible();
    await expect(page.getByRole("button", {name: "Donate now"})).toBeEnabled();
});

test("the tabs switch between story, updates and donors", async ({page}) => {
    await page.goto(SLUG);
    await page.getByRole("tab", {name: /Updates/}).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await page.getByRole("tab", {name: "Donors"}).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
});

test("a guest can report a campaign", async ({page}) => {
    await page.goto(SLUG);
    await page.getByRole("button", {name: "Report campaign"}).click();
    await page.getByLabel("What is wrong with this campaign?").fill("This looks like a scam to me.");
    await page.getByRole("button", {name: "Send report"}).click();
    await expect(page.getByText("Our moderators will review your report")).toBeVisible();
});

const stripeCampaign = process.env.E2E_DONATE_CAMPAIGN_URL;
test("a guest can start a donation and is sent to Stripe Checkout", async ({page}) => {
    test.skip(!stripeCampaign, "needs a live campaign with a connected Stripe test account");
    await page.goto(stripeCampaign!);
    await page.getByLabel(/^Amount/).fill("10");
    await page.getByLabel("Your name (optional)").fill("E2E Donor");
    await page.getByRole("button", {name: "Donate now"}).click();
    await page.waitForURL(/checkout\.stripe\.com/);
});
```

**Also update `e2e/reports.spec.ts`:** replace the first test's click line `await page.getByRole("button", {name: "Report campaign"}).first().click();` with `await page.getByRole("button", {name: "Report campaign"}).click();` (there is now exactly one such button). Change nothing else in that file.

**Check the encoding**, then run:

```bash
file e2e/donate.spec.ts e2e/reports.spec.ts
set -a && . ./.env.local && set +a
pnpm build
pnpm test:e2e e2e/donate.spec.ts e2e/reports.spec.ts e2e/campaigns.spec.ts e2e/smoke.spec.ts
```

Expected: `file` says ASCII or UTF-8 text (not UTF-16); Playwright reports all tests passed, with the Stripe one **skipped** (so about 5 donate + 2 reports + 6 campaigns + 3 smoke, and 1 skipped).

If `campaigns.spec.ts` fails on its last assertion about the campaign heading, it is the test from Task 4 that now has a real heading to check: open `e2e/campaigns.spec.ts`, find the comment line `// The campaign page itself is rebuilt in Task 5, which restores its heading assertion.` and **replace that comment with** `await expect(page.getByRole("heading", {name: "Community kitchen in Ealing", level: 1})).toBeVisible();`. That is the only edit allowed to that file.


Kill any server still on port 4173.

**COMMIT** `test(e2e): cover the campaign page, built-in donate form and report dialog`

---

## Step E: look at it in a browser

Start the production server once and check the page by eye and by script, in **both widths** and **both themes**:

```bash
set -a && . ./.env.local && set +a
PORT=4173 pnpm exec react-router-serve ./build/server/index.js
```

(Run it in the background and wait up to 30 seconds for `http://localhost:4173` to answer.) Open `http://localhost:4173/campaigns/community-kitchen-ealing`. Use the Playwright MCP browser tools if you have them, otherwise a manual browser. For each of 1280x900 and 390x844, and for light and dark (toggle with the theme button):

1. No horizontal scrollbar (`document.documentElement.scrollWidth <= clientWidth`).
2. Exactly one `h1`.
3. On the 390px width, the donate panel appears **before** the tabs.
4. On 1280px, the donate card stays visible while scrolling.
5. No console errors other than a failed image request for the seeded fake image URL (which now falls back to a placeholder).

Write what you saw, per width and theme, in the report. Kill the server when done.

## Step F: write the report

Create `docs/superpowers/plans/2026-10-17-handover-task-5-report.md` (do not commit it):

1. Baseline and final numbers (lint, test files, tests, build).
2. Commit hashes (`git log --oneline -6`).
3. Anything you changed that is not in this file, and why.
4. Anything that did not work as written, with exact error text.
5. The **real Playwright output lines**: copy the final summary (`N passed`, `N skipped`, `N failed`). Do not summarise from memory.
6. The Step E observations.

Run `git status --short`. Only `.claude/` and the report files may be untracked. Stop. Do not start Task 6.

## When to stop

Stop and report (do not work around it) if: a VERIFY output differs from Expected and one minimal fix does not resolve it; a step needs an edit in a forbidden path; a `src/components/ui/*` file lacks an export used here; a test only passes if you weaken its assertion; `git status` shows files you did not create or edit; or you are about to run `git push`.

## My calls (the owner should check these)

- **One column on mobile with the donate card first.** The donate panel is the point of the page, so on narrow screens it sits above the tabs, not below the story. On desktop it is a sticky right column.
- **Tabs for Story, Updates, Donors** instead of one long scroll: the page stays short, and the donate card is always in view on desktop.
- **Copy link only.** The social share links need an absolute URL, which the route does not have yet (it would need `SITE_URL` from the server). `shareLinks()` and its test are in place for when the route passes one.
- **No "follow" button.** The old page had a fake follow toggle with no server behind it. Not rebuilt.
- **The old "Donation FAQ" accordion and organiser card are dropped.** The panel's last line already says payment goes to the organiser; a real organiser profile belongs with the organisations work.
- **Typography plugin not added.** The story gets a small set of Tailwind variants instead of `@tailwindcss/typography`, to avoid a new dependency for one block.
- **Dates** are formatted `D MMM YYYY` with `dayjs`, in the browser's locale-independent form, so server and client render the same text.
- **Code in this file was written but not compiled.** Expect small type fixes around Base UI props (`DialogTrigger`, `DialogClose`, `render`).
