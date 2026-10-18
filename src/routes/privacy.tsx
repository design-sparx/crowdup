import {PrivacyPage} from "@/features/content/legal-pages";
import {buildMeta} from "../helpers";

export {Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({
        title: "Privacy Policy",
        description: "What personal data CrowdUp collects, why, and who processes it.",
    });
}

export default function Page() {
    return <PrivacyPage/>;
}
