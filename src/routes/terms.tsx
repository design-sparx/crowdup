import {ComingSoonPage} from "../pages";
import {buildMeta} from "../helpers";

export {Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({
        title: "Terms of Service",
        description: "The terms that apply when you use CrowdUp or donate to a campaign.",
    });
}

export default function Page() {
    return <ComingSoonPage title="Terms of service"/>;
}
