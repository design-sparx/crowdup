import LegalDocument, {type LegalSection} from "../components/LegalDocument";
import {legal} from "../data/legal";

const sections: LegalSection[] = [
    {
        heading: "1. Who is responsible",
        paragraphs: [
            `${legal.company} (the "Operator") runs this CrowdUp instance and decides how personal data is used. Contact: ${legal.contactEmail}, ${legal.postalAddress}.`,
        ],
    },
    {
        heading: "2. Data we collect",
        items: [
            "Account data: your name, email address and authentication details, stored with Supabase.",
            "Campaign data: the titles, descriptions, images and goals organizers publish, and the profile details shown with them.",
            "Donation records: the amount, currency, time and campaign of a donation, and the donor name or message if the donor provides one.",
            "Payment details: card and bank details are entered with Stripe and are not stored by the Operator.",
        ],
    },
    {
        heading: "3. How we use it",
        items: [
            "To create and secure accounts and sign you in.",
            "To publish campaigns and show donation progress.",
            "To process donations through Stripe and keep records of them.",
            "To detect abuse and keep the service secure.",
        ],
    },
    {
        heading: "4. Who processes it",
        items: [
            "Supabase hosts the database and authentication.",
            "Stripe processes payments and, for organizers, handles identity verification under its own privacy policy.",
            "The hosting provider that serves this site.",
        ],
        paragraphs: [
            "The Operator does not send application emails in this version of the service. Your email address is used for sign-in only.",
        ],
    },
    {
        heading: "5. Public information",
        paragraphs: [
            "Campaign pages are public. Anything an organizer publishes, and any donor name or message a donor chooses to show, may be visible to visitors.",
        ],
    },
    {
        heading: "6. Retention and your rights",
        paragraphs: [
            `The Operator keeps data while an account is active and as needed to keep donation records. Depending on where you live you may have rights to access, correct, delete or export your data, or to object to its use. To exercise them, contact ${legal.contactEmail}.`,
        ],
    },
    {
        heading: "7. Changes",
        paragraphs: ["This policy may be updated; the date above shows the latest revision."],
    },
];

const PrivacyPage = () => (
    <LegalDocument
        title="Privacy Policy"
        intro={`This policy explains what personal data this CrowdUp instance, operated by ${legal.company}, collects and why.`}
        sections={sections}
    />
);

export default PrivacyPage;
