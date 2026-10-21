import {buildMeta} from "../helpers";
import {HowItWorksPage} from "@/features/content/how-it-works-page";

export default function Page() {
    return <HowItWorksPage/>;
}

export function meta() {
    return buildMeta({title: "How it works", description: "How to raise money and donate on CrowdUp."});
}
