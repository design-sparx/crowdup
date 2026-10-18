import {legal} from "@/data/legal";
import {LegalDocument, type LegalSection} from "@/features/content/legal-document";
import {Alert, AlertDescription} from "@/components/ui/alert";

/** Shown until the operator has reviewed the text (see docs/operators-legal.md). */
function TemplateNotice() {
    return (
        <Alert role="status" className="mx-auto max-w-prose">
            <AlertDescription>
                Template notice: this text is a starting point and is not legal advice. The operator must review it
                before accepting real donations.
            </AlertDescription>
        </Alert>
    );
}

function Operator() {
    return (
        <p className="text-sm text-muted-foreground">
            Operated by {legal.company}. Contact: {legal.contactEmail}. Address: {legal.postalAddress}.
        </p>
    );
}

const TERMS: LegalSection[] = [
    {heading: "Donations", body: [
        "CrowdUp lets people donate to campaigns run by organisers. A donation is a one-off payment to the organiser of that campaign.",
        "The platform never holds donation funds. Payments are processed through Stripe Connect as direct charges to the organiser's connected Stripe account.",
    ]},
    {heading: "Campaigns", body: [
        "Organisers describe their campaign, set a goal and publish it. Campaigns may be reviewed, suspended or closed under these terms.",
    ]},
    {heading: "Governing law", body: [`These terms are governed by: ${legal.jurisdiction}.`]},
];

const PRIVACY: LegalSection[] = [
    {heading: "What we collect", body: [
        "Account details you give us (name, email and password, stored by our authentication provider), campaign content you write, and donation records made through Stripe.",
    ]},
    {heading: "Where data is stored", body: [
        "Application data is stored in Supabase. Payments are processed by Stripe.",
    ]},
    {heading: "Emails", body: [
        "This version of CrowdUp does not send application emails. Authentication emails, where enabled, come from the authentication provider.",
    ]},
];

const SECURITY: LegalSection[] = [
    {heading: "How donations are protected", body: [
        "Payments run on Stripe. CrowdUp does not see or store card details, and it never holds donation funds.",
    ]},
    {heading: "How we protect data", body: [
        "Row-level security in the database limits each person to their own records. Server-only secrets never reach the browser.",
    ]},
    {heading: "Report a problem", body: [
        `Report a security problem or abuse to ${legal.contactEmail}.`,
    ]},
];

export function TermsPage() {
    return (
        <>
            <TemplateNotice/>
            <LegalDocument title="Terms of service" sections={TERMS}/>
            <div className="mx-auto max-w-prose px-4 pb-12"><Operator/></div>
        </>
    );
}

export function PrivacyPage() {
    return (
        <>
            <TemplateNotice/>
            <LegalDocument title="Privacy policy" lastUpdated={legal.lastUpdated} sections={PRIVACY}/>
            <div className="mx-auto max-w-prose px-4 pb-12"><Operator/></div>
        </>
    );
}

export function SecurityPage() {
    return (
        <>
            <TemplateNotice/>
            <LegalDocument title="Security and trust" sections={SECURITY}/>
            <div className="mx-auto max-w-prose px-4 pb-12"><Operator/></div>
        </>
    );
}
