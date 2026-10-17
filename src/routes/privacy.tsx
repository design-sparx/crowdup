import {buildMeta} from "../helpers";

export {PrivacyPage as default, Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({
        title: "Privacy Policy",
        description: "What personal data CrowdUp collects, why, and who processes it.",
    });
}
