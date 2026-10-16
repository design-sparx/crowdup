import LegalDocument, {type LegalSection} from "../components/LegalDocument";
import {legal} from "../data/legal";

const sections: LegalSection[] = [
    {
        heading: "1. What CrowdUp is",
        paragraphs: [
            `CrowdUp is open-source crowdfunding software. ${legal.company} (the "Operator") runs this instance. The service lets campaign organizers publish campaigns and lets supporters make donations to them.`,
        ],
    },
    {
        heading: "2. Donations only",
        paragraphs: [
            "CrowdUp supports donations only. A donation is not a purchase, loan, investment or pre-order, and donors receive no equity, reward or product in return unless an organizer arranges one outside the service.",
        ],
    },
    {
        heading: "3. How payments work",
        paragraphs: [
            "Payments are processed by Stripe. Organizers connect their own Stripe account through Stripe Connect, and donations are charged directly to that account. The Operator does not hold, receive or transmit donated funds, and is not a bank or payment institution.",
            "Organizers must accept Stripe's terms and complete Stripe's onboarding and verification. Stripe is responsible for payouts, fees, refunds and disputes on its platform under its own terms.",
        ],
    },
    {
        heading: "4. Accounts",
        items: [
            "You must provide accurate information and keep your credentials secure.",
            "You are responsible for activity under your account.",
            "You must be old enough to enter a binding agreement where you live.",
        ],
    },
    {
        heading: "5. Organizer responsibilities",
        items: [
            "Describe your campaign and intended use of funds truthfully.",
            "Use donations for the purpose you stated.",
            "Comply with the laws that apply to you, including any rules on fundraising, taxes and reporting.",
        ],
    },
    {
        heading: "6. Acceptable use",
        paragraphs: ["You may not use the service to:"],
        items: [
            "run fraudulent or misleading campaigns",
            "raise money for illegal activity or to harm others",
            "post unlawful, hateful, harassing or infringing content",
            "attempt to disrupt, probe or gain unauthorized access to the service",
        ],
    },
    {
        heading: "7. Content and moderation",
        paragraphs: [
            "You keep ownership of the content you post and grant the Operator a license to host and display it to operate the service. The Operator may remove content or suspend campaigns or accounts that appear to breach these terms or the law.",
        ],
    },
    {
        heading: "8. Disclaimers and liability",
        paragraphs: [
            "The service is provided as is. The Operator does not verify campaigns or guarantee that any campaign is genuine, that funds will be used as stated, or that the service will be uninterrupted. Donors give at their own discretion. Liability is limited to the extent permitted by applicable law.",
        ],
    },
    {
        heading: "9. Changes and termination",
        paragraphs: [
            "The Operator may update these terms; the date above shows the latest revision. You may stop using the service at any time, and the Operator may suspend access for breach of these terms.",
        ],
    },
    {
        heading: "10. Governing law and contact",
        paragraphs: [
            `These terms are governed by ${legal.jurisdiction}. Contact: ${legal.contactEmail}, ${legal.postalAddress}.`,
        ],
    },
];

const TermsPage = () => (
    <LegalDocument
        title="Terms of Service"
        intro={`These terms govern your use of this CrowdUp instance operated by ${legal.company}. By creating an account or donating you agree to them.`}
        sections={sections}
    />
);

export default TermsPage;
