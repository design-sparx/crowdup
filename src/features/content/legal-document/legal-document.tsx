export interface LegalSection {
    heading: string;
    body: string[];
}

interface LegalDocumentProps {
    title: string;
    /** Shown under the title when given, e.g. the date the operator last changed the text. */
    lastUpdated?: string;
    sections: LegalSection[];
}

/** A readable prose page for the terms, privacy and security text. Each section heading is an anchor. */
export function LegalDocument({title, lastUpdated, sections}: LegalDocumentProps) {
    return (
        <article className="mx-auto max-w-prose space-y-8 px-4 py-12">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold">{title}</h1>
                {lastUpdated ? <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p> : null}
            </header>
            {sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                    <h2 id={slug(section.heading)} className="scroll-mt-24 text-xl font-semibold">
                        {section.heading}
                    </h2>
                    {section.body.map((paragraph, i) => (
                        <p key={i} className="leading-relaxed">{paragraph}</p>
                    ))}
                </section>
            ))}
        </article>
    );
}

/** A stable anchor id from a heading, so links such as #refunds work. */
export function slug(heading: string): string {
    return heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
