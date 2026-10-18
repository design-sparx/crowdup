import {SecurityPage} from "@/features/content/legal-pages";
import {buildMeta} from "../helpers";

export {Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({
        title: "Security and Trust",
        description: "How CrowdUp protects donations and data, and how to report a problem.",
    });
}

export default function Page() {
    return <SecurityPage/>;
}
