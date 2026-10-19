# Handover: Task 4 (home and browse screens)

Audience: an implementing agent with no context. Follow this file literally, top to bottom. Do not improve, refactor or "fix" anything not listed. If a step does not behave as written, **stop and report** (see "When to stop"). Never guess.

Repo: `D:\works\design-sparx\crowdup`. Branch: `main` (the owner wants this). Package manager: `pnpm` only.

This file replaces "Task 4" in `docs/superpowers/plans/2026-10-17-ui-rebuild.md` (its old paths are out of date). Do not edit that file.

## What you are building

Two public screens, both server-rendered from loaders that **already exist and must not change**:

- Home `/` (`src/routes/home.tsx`): hero, featured campaigns, a three-step "how it works".
- Browse `/campaigns` (`src/routes/campaigns.tsx`): search, category filter, campaign cards, pagination, empty state.

Both currently render a "being rebuilt" placeholder. The loaders return plain data (shape in Step C) and money is in **minor units** (cents). Use `formatMinorAmount` to display it.

## Ground rules

1. **Never push.** Never run `git push`, never open a PR. The push remote is disabled on purpose.
2. **Never edit** `src/data-access/**`, `src/components/ui/**` (generated shadcn), `supabase/**`, `src/lib/campaigns/repository.ts`, `src/lib/campaigns/params.ts`, `src/lib/donations/**`, or the `loader`/`meta` functions in the route files. You only add new files and change each route's default export.
3. Files and folders are **kebab-case**. Exported components are PascalCase. Every component gets its own folder under `src/features/donate/` with `name.tsx`, `name.test.tsx` and a one-line `index.ts` (`export {Name} from "./name";`). No other `index.ts` files. No aggregate barrels.
4. Icons: only `@tabler/icons-react`. Class names: only `cn()` from `@/lib/utils`. Colours: only theme tokens (`bg-muted`, `text-muted-foreground`, `border-border`, `text-primary`). Never raw colours.
5. Use `@/` imports outside the current folder. Import from the file, not a barrel: `@/helpers/formatAmount`, never `@/helpers`.
6. Every component test starts with the exact first line `// @vitest-environment jsdom` and uses `renderWithRouter` from `@/test/render-with-router` when the component has links or forms.
7. After every step marked VERIFY run the command. If output differs from "Expected", stop and report.
8. Commit after each step marked COMMIT, with exactly the given message. Commits are local only.
9. Kill any process you start (dev server, preview) before you finish.

## Known baseline

Run once; write the numbers in your report:

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: lint clean, `Test Files  49 passed`, `Tests  358 passed`, build exits 0. If not, stop and report.

---

## Step A: pure helpers (test first)

**Create `src/lib/campaigns/browse.test.ts`:**

```ts
import {describe, expect, it} from "vitest";
import {buildBrowseHref, hasActiveFilters, pageCount} from "./browse";

describe("buildBrowseHref", () => {
    it("is the bare list path for page 1 with no filters", () => {
        expect(buildBrowseHref({page: 1}, 1)).toBe("/campaigns");
    });
    it("keeps the keyword and adds the page", () => {
        expect(buildBrowseHref({q: "kitchen", page: 1}, 2)).toBe("/campaigns?q=kitchen&page=2");
    });
    it("keeps every active filter and encodes them", () => {
        expect(buildBrowseHref({q: "a b", category: "Food", country: "GB", page: 3}, 3)).toBe(
            "/campaigns?q=a+b&category=Food&country=GB&page=3",
        );
    });
    it("drops the page parameter when linking to page 1", () => {
        expect(buildBrowseHref({category: "Food", page: 4}, 1)).toBe("/campaigns?category=Food");
    });
});

describe("pageCount", () => {
    it("is at least 1, even with no results", () => {
        expect(pageCount(0, 12)).toBe(1);
    });
    it("rounds up", () => {
        expect(pageCount(12, 12)).toBe(1);
        expect(pageCount(13, 12)).toBe(2);
    });
});

describe("hasActiveFilters", () => {
    it("is true for a keyword, category or country, false otherwise", () => {
        expect(hasActiveFilters({page: 1})).toBe(false);
        expect(hasActiveFilters({page: 2})).toBe(false);
        expect(hasActiveFilters({q: "x", page: 1})).toBe(true);
        expect(hasActiveFilters({category: "Food", page: 1})).toBe(true);
        expect(hasActiveFilters({country: "GB", page: 1})).toBe(true);
    });
});
```

**Run:** `pnpm test src/lib/campaigns/browse.test.ts`. Expected: FAIL (module `./browse` not found).

**Create `src/lib/campaigns/browse.ts`:**

```ts
import type {CampaignSearch} from "./params";

/** Link to `page` of the browse list, keeping the active filters. Page 1 has no `page` parameter. */
export function buildBrowseHref(search: CampaignSearch, page: number): string {
    const params = new URLSearchParams();
    if (search.q) params.set("q", search.q);
    if (search.category) params.set("category", search.category);
    if (search.country) params.set("country", search.country);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/campaigns?${query}` : "/campaigns";
}

export function pageCount(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize));
}

export function hasActiveFilters(search: CampaignSearch): boolean {
    return Boolean(search.q || search.category || search.country);
}
```

**VERIFY:** `pnpm test src/lib/campaigns/browse.test.ts`. Expected: all pass.

**COMMIT** `feat(donate): add browse list helpers`

---

## Step B: components

All under `src/features/donate/`. Each folder has `name.tsx`, `name.test.tsx`, `index.ts`.

### B1. `campaign-card/`

`campaign-card.tsx`:

```tsx
import {Link} from "react-router";
import {IconHeartHandshake} from "@tabler/icons-react";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {formatMinorAmount} from "@/helpers/formatAmount";
import type {Campaign} from "@/lib/campaigns/types";

export function CampaignCard({campaign}: {campaign: Campaign}) {
    return (
        <Card className="relative h-full transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-lg">
            {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt="" loading="lazy" className="aspect-video w-full object-cover"/>
            ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
                    <IconHeartHandshake className="size-10" aria-hidden="true"/>
                </div>
            )}
            <CardContent className="flex flex-1 flex-col gap-3">
                <Badge variant="secondary" className="w-fit">
                    {campaign.category}
                </Badge>
                <h3 className="text-lg font-semibold leading-snug">
                    <Link to={`/campaigns/${campaign.slug}`} className="outline-none after:absolute after:inset-0">
                        {campaign.title}
                    </Link>
                </h3>
                <p className="line-clamp-2 text-muted-foreground">{campaign.description}</p>
                <p className="text-xs text-muted-foreground">by {campaign.organizerName}</p>
                <div className="mt-auto space-y-2">
                    <Progress value={campaign.percentFunded} aria-label={`${campaign.title} funding progress`}/>
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold">
                            {formatMinorAmount(campaign.raisedAmount, campaign.currency)} raised
                        </span>
                        <span className="text-muted-foreground">{campaign.percentFunded}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        of {formatMinorAmount(campaign.goalAmount, campaign.currency)} ·{" "}
                        {campaign.donorCount} {campaign.donorCount === 1 ? "donor" : "donors"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
```

`campaign-card.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {CampaignCard} from "./campaign-card";

const campaign: Campaign = {
    id: "c1",
    slug: "clean-water",
    title: "Clean water for schools",
    description: "Filtered water points in six schools.",
    category: "Community",
    country: "KE",
    imageUrl: null,
    goalAmount: 500000,
    raisedAmount: 310000,
    donorCount: 1,
    currency: "KES",
    endDate: null,
    createdAt: "2026-01-01T00:00:00Z",
    organizerName: "Amina",
    organizerAvatarUrl: null,
    percentFunded: 62,
};

describe("CampaignCard", () => {
    it("links the title to the campaign page", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByRole("link", {name: "Clean water for schools"})).toHaveAttribute(
            "href",
            "/campaigns/clean-water",
        );
    });
    it("shows money in major units, the percentage and a singular donor", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByText(/3,100\.00 raised/)).toBeInTheDocument();
        expect(screen.getByText("62%")).toBeInTheDocument();
        expect(screen.getByText(/1 donor$/)).toBeInTheDocument();
    });
    it("uses a plural for several donors", () => {
        renderWithRouter(<CampaignCard campaign={{...campaign, donorCount: 3}}/>);
        expect(screen.getByText(/3 donors$/)).toBeInTheDocument();
    });
    it("exposes progress to assistive tech", () => {
        renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
    });
    it("shows the cover image when there is one, a placeholder otherwise", () => {
        const {container, rerender} = renderWithRouter(<CampaignCard campaign={campaign}/>);
        expect(container.querySelector("img")).toBeNull();
        rerender(<CampaignCard campaign={{...campaign, imageUrl: "https://example.org/a.jpg"}}/>);
        expect(container.querySelector("img")).toHaveAttribute("src", "https://example.org/a.jpg");
    });
});
```

(`rerender` from `renderWithRouter` re-renders without the router wrapper. If `Link` then throws "useHref() may be used only in the context of a <Router>", change that last test to use two separate `renderWithRouter` calls with `unmount()` between them, like `site-header.test.tsx` does.)

`index.ts`: `export {CampaignCard} from "./campaign-card";`

### B2. `campaign-grid/`

`campaign-grid.tsx`:

```tsx
import {Link} from "react-router";
import {IconSearchOff} from "@tabler/icons-react";
import {buttonVariants} from "@/components/ui/button";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {CampaignCard} from "@/features/donate/campaign-card";
import type {Campaign} from "@/lib/campaigns/types";

interface CampaignGridProps {
    campaigns: Campaign[];
    /** Where the "show all" button in the empty state goes; null hides the button. */
    resetHref: string | null;
}

export function CampaignGrid({campaigns, resetHref}: CampaignGridProps) {
    if (campaigns.length === 0) {
        return (
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconSearchOff/>
                    </EmptyMedia>
                    <EmptyTitle>No campaigns found</EmptyTitle>
                    <EmptyDescription>Try a different search, or look at everything that is live.</EmptyDescription>
                </EmptyHeader>
                {resetHref ? (
                    <EmptyContent>
                        <Link to={resetHref} className={buttonVariants({variant: "outline"})}>
                            Show all campaigns
                        </Link>
                    </EmptyContent>
                ) : null}
            </Empty>
        );
    }
    return (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
                <li key={campaign.id}>
                    <CampaignCard campaign={campaign}/>
                </li>
            ))}
        </ul>
    );
}
```

If `IconSearchOff` does not exist in `@tabler/icons-react` (check with `node -e "console.log(typeof require('@tabler/icons-react').IconSearchOff)"`), use `IconSearch` instead.

`campaign-grid.test.tsx`: build one campaign object (copy the `campaign` constant from the card test; it is fine to repeat it in the test file).

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {CampaignGrid} from "./campaign-grid";

const base: Campaign = {
    id: "c1", slug: "one", title: "One", description: "d", category: "Food", country: "GB",
    imageUrl: null, goalAmount: 1000, raisedAmount: 0, donorCount: 0, currency: "GBP",
    endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "A", organizerAvatarUrl: null, percentFunded: 0,
};

describe("CampaignGrid", () => {
    it("lists one card per campaign", () => {
        renderWithRouter(<CampaignGrid campaigns={[base, {...base, id: "c2", slug: "two", title: "Two"}]} resetHref={null}/>);
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
    it("shows an empty state with a way back when resetHref is given", () => {
        renderWithRouter(<CampaignGrid campaigns={[]} resetHref="/campaigns"/>);
        expect(screen.getByText("No campaigns found")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toHaveAttribute("href", "/campaigns");
    });
    it("hides the way back when resetHref is null", () => {
        renderWithRouter(<CampaignGrid campaigns={[]} resetHref={null}/>);
        expect(screen.queryByRole("link", {name: "Show all campaigns"})).not.toBeInTheDocument();
    });
});
```

`index.ts`: `export {CampaignGrid} from "./campaign-grid";`

### B3. `campaign-filters/`

This is a plain GET form: submitting it navigates to `/campaigns?q=...&category=...`, which re-runs the loader. Do not add client state.

`campaign-filters.tsx`:

```tsx
import {Form, Link} from "react-router";
import {IconSearch} from "@tabler/icons-react";
import {Button, buttonVariants} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {hasActiveFilters} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";

interface CampaignFiltersProps {
    search: CampaignSearch;
    categories: string[];
}

export function CampaignFilters({search, categories}: CampaignFiltersProps) {
    return (
        <Form
            method="get"
            role="search"
            // Remount when the URL filters change so the uncontrolled fields show the new values.
            key={`${search.q ?? ""}|${search.category ?? ""}`}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
            <Input
                type="search"
                name="q"
                aria-label="Search campaigns"
                placeholder="Search campaigns"
                defaultValue={search.q ?? ""}
                maxLength={100}
                className="sm:max-w-sm"
            />
            <NativeSelect name="category" aria-label="Category" defaultValue={search.category ?? ""}>
                <NativeSelectOption value="">All categories</NativeSelectOption>
                {categories.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                        {category}
                    </NativeSelectOption>
                ))}
            </NativeSelect>
            <Button type="submit">
                <IconSearch aria-hidden="true"/>
                Search
            </Button>
            {hasActiveFilters(search) ? (
                <Link to="/campaigns" className={buttonVariants({variant: "ghost"})}>
                    Clear filters
                </Link>
            ) : null}
        </Form>
    );
}
```

`campaign-filters.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {CampaignFilters} from "./campaign-filters";

const categories = ["Community", "Food"];

describe("CampaignFilters", () => {
    it("is a labelled search landmark with the keyword box, category list and a Search button", () => {
        renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        const search = screen.getByRole("search");
        expect(search).toBeInTheDocument();
        expect(screen.getByLabelText("Search campaigns")).toBeInTheDocument();
        expect(screen.getByRole("combobox", {name: "Category"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Search"})).toBeInTheDocument();
    });
    it("offers every category plus All categories", () => {
        renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["All categories", "Community", "Food"]);
    });
    it("shows the current filters and a Clear filters link only when one is active", () => {
        const {unmount} = renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        expect(screen.queryByRole("link", {name: "Clear filters"})).not.toBeInTheDocument();
        unmount();
        renderWithRouter(<CampaignFilters search={{q: "kitchen", category: "Food", page: 1}} categories={categories}/>);
        expect(screen.getByLabelText("Search campaigns")).toHaveValue("kitchen");
        expect(screen.getByRole("combobox", {name: "Category"})).toHaveValue("Food");
        expect(screen.getByRole("link", {name: "Clear filters"})).toHaveAttribute("href", "/campaigns");
    });
});
```

`index.ts`: `export {CampaignFilters} from "./campaign-filters";`

### B4. `browse-pagination/`

`browse-pagination.tsx`:

```tsx
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {buildBrowseHref, pageCount} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";

interface BrowsePaginationProps {
    search: CampaignSearch;
    total: number;
    pageSize: number;
}

export function BrowsePagination({search, total, pageSize}: BrowsePaginationProps) {
    const pages = pageCount(total, pageSize);
    if (pages <= 1) return null;
    const current = Math.min(search.page, pages);
    return (
        <Pagination aria-label="Pagination">
            <PaginationContent>
                {current > 1 ? (
                    <PaginationItem>
                        <PaginationPrevious href={buildBrowseHref(search, current - 1)}/>
                    </PaginationItem>
                ) : null}
                <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                        Page {current} of {pages}
                    </span>
                </PaginationItem>
                {current < pages ? (
                    <PaginationItem>
                        <PaginationNext href={buildBrowseHref(search, current + 1)}/>
                    </PaginationItem>
                ) : null}
            </PaginationContent>
        </Pagination>
    );
}
```

`browse-pagination.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {BrowsePagination} from "./browse-pagination";

describe("BrowsePagination", () => {
    it("renders nothing when everything fits on one page", () => {
        const {container} = render(<BrowsePagination search={{page: 1}} total={12} pageSize={12}/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("has Next but no Previous on the first page, and keeps the filters in the link", () => {
        render(<BrowsePagination search={{q: "water", page: 1}} total={30} pageSize={12}/>);
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Go to next page"})).toHaveAttribute("href", "/campaigns?q=water&page=2");
        expect(screen.queryByRole("link", {name: "Go to previous page"})).not.toBeInTheDocument();
    });
    it("has Previous but no Next on the last page; Previous to page 1 drops the page parameter", () => {
        render(<BrowsePagination search={{page: 2}} total={20} pageSize={12}/>);
        expect(screen.getByRole("link", {name: "Go to previous page"})).toHaveAttribute("href", "/campaigns");
        expect(screen.queryByRole("link", {name: "Go to next page"})).not.toBeInTheDocument();
    });
    it("clamps a page number beyond the last page", () => {
        render(<BrowsePagination search={{page: 99}} total={20} pageSize={12}/>);
        expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
});
```

(No router wrapper needed: the shadcn pagination links are plain `<a>` tags.)

`index.ts`: `export {BrowsePagination} from "./browse-pagination";`

### B5. `browse-page/`

`browse-page.tsx`:

```tsx
import {BrowsePagination} from "@/features/donate/browse-pagination";
import {CampaignFilters} from "@/features/donate/campaign-filters";
import {CampaignGrid} from "@/features/donate/campaign-grid";
import {hasActiveFilters} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";
import type {Campaign} from "@/lib/campaigns/types";

interface BrowsePageProps {
    items: Campaign[];
    total: number;
    categories: string[];
    search: CampaignSearch;
    pageSize: number;
}

export function BrowsePage({items, total, categories, search, pageSize}: BrowsePageProps) {
    const canReset = hasActiveFilters(search) || search.page > 1;
    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold">Browse campaigns</h1>
                <p className="text-muted-foreground">
                    {total === 1 ? "1 live campaign" : `${total} live campaigns`}
                    {hasActiveFilters(search) ? " match your search" : ""}
                </p>
            </header>
            <CampaignFilters search={search} categories={categories}/>
            <CampaignGrid campaigns={items} resetHref={canReset ? "/campaigns" : null}/>
            <BrowsePagination search={search} total={total} pageSize={pageSize}/>
        </div>
    );
}
```

`browse-page.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {BrowsePage} from "./browse-page";

const props = {items: [], total: 0, categories: ["Food"], pageSize: 12};

describe("BrowsePage", () => {
    it("has a single h1 and the filters", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 1}}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Browse campaigns"})).toBeInTheDocument();
        expect(screen.getByRole("search")).toBeInTheDocument();
    });
    it("offers a way back to the full list when a filter matches nothing", () => {
        renderWithRouter(<BrowsePage {...props} search={{q: "zzz", page: 1}}/>);
        expect(screen.getByText("No campaigns found")).toBeInTheDocument();
        expect(screen.getByText("0 live campaigns match your search")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toBeInTheDocument();
    });
    it("offers a way back when the page number is beyond the results", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 99}}/>);
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toBeInTheDocument();
    });
    it("has no way-back button on an empty unfiltered list", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 1}}/>);
        expect(screen.queryByRole("link", {name: "Show all campaigns"})).not.toBeInTheDocument();
    });
});
```

`index.ts`: `export {BrowsePage} from "./browse-page";`

### B6. `home-page/`

`home-page.tsx`:

```tsx
import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button";
import {CampaignGrid} from "@/features/donate/campaign-grid";
import type {Campaign} from "@/lib/campaigns/types";

const STEPS = [
    {title: "Create your campaign", text: "Tell your story, set a goal and add a photo. It takes a few minutes."},
    {title: "Share it", text: "Send the link to friends, family and your community."},
    {title: "Receive donations", text: "People give by card. Money goes straight to your own Stripe account."},
] as const;

export function HomePage({campaigns}: {campaigns: Campaign[]}) {
    const featured = campaigns.slice(0, 6);
    return (
        <div>
            <section className="border-b border-border bg-muted/40">
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Raise money for what matters</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        CrowdUp is an open-source home for community fundraisers. Donations go straight to the
                        organiser&apos;s own Stripe account.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link to="/campaigns" className={buttonVariants({size: "lg"})}>
                            Donate to a campaign
                        </Link>
                        <Link to="/create-campaign" className={buttonVariants({size: "lg", variant: "outline"})}>
                            Start a campaign
                        </Link>
                    </div>
                </div>
            </section>

            {featured.length > 0 ? (
                <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold">Featured campaigns</h2>
                        <Link to="/campaigns" className={buttonVariants({variant: "link"})}>
                            See all
                        </Link>
                    </div>
                    <CampaignGrid campaigns={featured} resetHref={null}/>
                </section>
            ) : null}

            <section className="border-t border-border bg-muted/40">
                <div className="mx-auto max-w-6xl space-y-8 px-4 py-14">
                    <h2 className="text-2xl font-semibold">How it works</h2>
                    <ol className="grid gap-6 sm:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="space-y-2">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                    {index + 1}
                                </span>
                                <h3 className="font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                    <Link to="/how-it-works" className={buttonVariants({variant: "link", className: "px-0"})}>
                        Learn more
                    </Link>
                </div>
            </section>
        </div>
    );
}
```

`home-page.test.tsx`:

```tsx
// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import type {Campaign} from "@/lib/campaigns/types";
import {HomePage} from "./home-page";

function campaign(n: number): Campaign {
    return {
        id: `c${n}`, slug: `slug-${n}`, title: `Campaign ${n}`, description: "d", category: "Food", country: "GB",
        imageUrl: null, goalAmount: 1000, raisedAmount: 0, donorCount: 0, currency: "GBP",
        endDate: null, createdAt: "2026-01-01T00:00:00Z", organizerName: "A", organizerAvatarUrl: null, percentFunded: 0,
    };
}

describe("HomePage", () => {
    it("has one h1 and the two main calls to action", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.getByRole("heading", {level: 1})).toHaveTextContent("Raise money for what matters");
        expect(screen.getByRole("link", {name: "Donate to a campaign"})).toHaveAttribute("href", "/campaigns");
        expect(screen.getByRole("link", {name: "Start a campaign"})).toHaveAttribute("href", "/create-campaign");
    });
    it("hides the featured section when there are no campaigns", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.queryByRole("heading", {name: "Featured campaigns"})).not.toBeInTheDocument();
    });
    it("shows at most six featured campaigns", () => {
        renderWithRouter(<HomePage campaigns={Array.from({length: 8}, (_, i) => campaign(i + 1))}/>);
        expect(screen.getByRole("heading", {name: "Featured campaigns"})).toBeInTheDocument();
        expect(screen.getAllByRole("link", {name: /^Campaign \d$/})).toHaveLength(6);
    });
    it("explains how it works in three steps", () => {
        renderWithRouter(<HomePage campaigns={[]}/>);
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });
});
```

`index.ts`: `export {HomePage} from "./home-page";`

### B7. VERIFY and COMMIT

```bash
pnpm lint && pnpm test
```

Expected: lint clean; all test files pass (49 before, plus 8 new files). If a component test fails because `Progress` does not expose `aria-valuenow` the way the test says, look at what attribute Base UI renders (print the DOM with `screen.debug()`), fix the **test assertion** to match, and say so in your report. Do not remove the assertion. If jsdom lacks a browser API (`ResizeObserver`, `matchMedia`), add a minimal stub to `src/test/setup.ts` and say so.

**COMMIT** `feat(donate): add campaign card, grid, filters, pagination and the browse and home pages`

---

## Step C: wire the routes

Loader shapes (read-only, for your reference):

- `home.tsx` loader returns `{campaigns: Campaign[]}`.
- `campaigns.tsx` loader returns `{items, total, categories, search, pageSize}`.

**`src/routes/home.tsx`:** keep `loader` and `meta` untouched. Add imports `import {HomePage} from "@/features/donate/home-page";` and `import type {Route} from "./+types/home";`. Remove the `ComingSoonPage` import. Replace the default export with:

```tsx
export default function Home({loaderData}: Route.ComponentProps) {
    return <HomePage campaigns={loaderData.campaigns}/>;
}
```

**`src/routes/campaigns.tsx`:** keep `loader` and `meta` untouched (it already imports `Route`). Add `import {BrowsePage} from "@/features/donate/browse-page";`. Remove the `ComingSoonPage` import. Replace the default export with:

```tsx
export default function Campaigns({loaderData}: Route.ComponentProps) {
    return <BrowsePage {...loaderData}/>;
}
```

**VERIFY:**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: all pass; build exits 0 (the build runs `react-router typegen` first, which creates the `./+types/home` module). If `tsc` complains about the spread `{...loaderData}`, pass the five props explicitly instead and say so.

**COMMIT** `feat(donate): rebuild home and browse screens`

---

## Step D: end-to-end

**Replace the whole of `e2e/campaigns.spec.ts` with:**

```ts
import {expect, test} from "@playwright/test";

// Requires a running local Supabase with supabase/seed.sql applied, and SUPABASE_URL /
// SUPABASE_ANON_KEY set for the server (see .env.local).

test("a visitor can browse, search and open a campaign", async ({page}) => {
    await page.goto("/campaigns");
    await expect(page.getByRole("heading", {name: "Browse campaigns"})).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    // Only live campaigns are public.
    await expect(page.getByText("Youth football kit fund")).toHaveCount(0);
    await expect(page.getByText("Quick cash for a great cause")).toHaveCount(0);

    await page.getByLabel("Search campaigns").fill("kitchen");
    await page.getByRole("search").getByRole("button", {name: "Search"}).click();
    await expect(page).toHaveURL(/q=kitchen/);
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toHaveCount(0);

    await page.getByText("Community kitchen in Ealing").click();
    await expect(page).toHaveURL(/\/campaigns\/community-kitchen-ealing$/);
    // The campaign page itself is rebuilt in Task 5, which restores its heading assertion.
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Community kitchen in Ealing/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /Hot meals/);
});

test("a visitor can filter by category and clear the filter", async ({page}) => {
    await page.goto("/campaigns");
    await page.getByRole("combobox", {name: "Category"}).selectOption("Food");
    await page.getByRole("search").getByRole("button", {name: "Search"}).click();
    await expect(page).toHaveURL(/category=Food/);
    await expect(page.getByText("Community kitchen in Ealing")).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toHaveCount(0);

    await page.getByRole("link", {name: "Clear filters"}).click();
    await expect(page).toHaveURL(/\/campaigns$/);
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
});

test("a search with no matches shows an empty state with a way back", async ({page}) => {
    await page.goto("/campaigns?q=zzzzqqqq");
    await expect(page.getByText("No campaigns found")).toBeVisible();
    await page.getByRole("link", {name: "Show all campaigns"}).click();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
});

test("a page number beyond the results shows the empty state, not an error", async ({page}) => {
    const response = await page.goto("/campaigns?page=99");
    expect(response?.status()).toBe(200);
    await expect(page.getByText("No campaigns found")).toBeVisible();
});

test("the home page shows featured campaigns and leads to the list", async ({page}) => {
    await page.goto("/");
    await expect(page.getByRole("heading", {level: 1, name: "Raise money for what matters"})).toBeVisible();
    await expect(page.getByRole("heading", {name: "Featured campaigns"})).toBeVisible();
    await expect(page.getByText("Clean water for Kibera schools")).toBeVisible();
    await page.getByRole("link", {name: "Donate to a campaign"}).click();
    await expect(page).toHaveURL(/\/campaigns$/);
});

test("a non-live campaign is not found", async ({page}) => {
    const response = await page.goto("/campaigns/youth-football-kit");
    expect(response?.status()).toBe(404);
});
```

**Run it. This step is mandatory.** The env file exists in the repo (`.env.local`), so "SUPABASE_URL not set" is not a valid reason to skip:

```bash
pnpm exec supabase status
```

If it prints `Stopped services` for everything or an error, run `pnpm exec supabase start` and wait for it. Then:

```bash
set -a && . ./.env.local && set +a
pnpm build
pnpm test:e2e e2e/campaigns.spec.ts e2e/smoke.spec.ts
```

Expected: all pass (6 in `campaigns.spec.ts`, 3 in `smoke.spec.ts`).

If the first test fails because "Clean water for Kibera schools" is missing, the local database has no seed: run `pnpm exec supabase db reset` (this resets the **local** development database only) and re-run. If it still fails, stop and report the exact output.

Kill any server still holding port 4173 when done.

**COMMIT** `test(e2e): cover browse, filters, empty states and home`

---

## Step E: write the report

Create `docs/superpowers/plans/2026-10-17-handover-task-4-report.md` (do not commit it):

1. Baseline numbers and final numbers (lint, test files, tests, build).
2. Commit hashes (`git log --oneline -6`).
3. Anything you changed that is not in this file, and why.
4. Anything that did not work as written, with exact error text.
5. The e2e result (pass counts, or the exact reason it could not run).

Run `git status --short`. Only `.claude/` and the report file may be untracked. Stop. Do not start Task 5.

## When to stop

Stop and report (do not work around it) if: a VERIFY output differs from Expected and one minimal fix does not resolve it; a step needs an edit in a forbidden path; a `src/components/ui/*` file lacks an export used here; `git status` shows files you did not create or edit; or you are about to run `git push`.

## My calls (the owner should check these)

- **Country filter** is not shown in the UI. The loader supports `?country=XX` and the links keep it, but the old design did not expose it and a country list on a global site is noise at this size. Easy to add later.
- **Featured campaigns** are simply the eight most recently published, capped to six on screen. No curation or ordering rules yet.
- **Empty states** differ on purpose: an empty unfiltered list shows no button (nothing to go back to); a filtered or out-of-range list shows "Show all campaigns".
- **Whole-card link** uses a stretched `after:absolute` link on the title, so each card is one tab stop and one link in the accessibility tree.
- **Cover images** use a plain `<img loading="lazy" alt="">` with a placeholder icon when there is none. The seed's fake image URL will render broken in the browser; that is seed data, not a bug.
- **Copy** ("Raise money for what matters", the three steps) is my wording; edit freely.
- **Code in this file was written but not compiled.** Expect small type fixes, mostly around Base UI props.
