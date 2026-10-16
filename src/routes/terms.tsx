import {buildMeta} from "../helpers";

export {TermsPage as default, Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({
        title: "Terms of Service",
        description: "The terms that apply when you use CrowdUp or donate to a campaign.",
    });
}
