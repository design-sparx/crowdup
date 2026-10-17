import {Anchor} from "@mantine/core";
import LegalDocument, {type LegalSection} from "../components/LegalDocument";
import {legal} from "../data/legal";

const sections: LegalSection[] = [
    {
        heading: "Payments",
        paragraphs: [
            "Card and bank details are collected and processed by Stripe. They never reach this site's servers. Donations are charged directly to the organizer's connected Stripe account, and the platform never holds donated funds.",
        ],
    },
    {
        heading: "Your data",
        paragraphs: [
            "Account and campaign data is stored in Supabase. Access to the data is restricted with database row-level security policies, and connections use HTTPS.",
        ],
    },
    {
        heading: "Trust and safety",
        paragraphs: [
            "Campaigns are not verified before they are published. Check a campaign carefully before donating, and only donate to people and causes you trust.",
            `To report a suspicious or abusive campaign, email ${legal.contactEmail}. The Operator may remove content or suspend accounts that breach the terms of service.`,
        ],
    },
    {
        heading: "Reporting a vulnerability",
        paragraphs: [
            <>
                Please report security issues privately and do not post them publicly. For the open-source
                project, use{" "}
                <Anchor href="https://github.com/design-sparx/crowdup/security/advisories/new">
                    GitHub private vulnerability reporting
                </Anchor>
                . For issues specific to this instance, email {legal.contactEmail}.
            </>,
        ],
    },
];

const SecurityPage = () => (
    <LegalDocument
        title="Security and Trust"
        intro={`How donations and data are protected on this CrowdUp instance, operated by ${legal.company}, and how to report a problem.`}
        sections={sections}
    />
);

export default SecurityPage;
