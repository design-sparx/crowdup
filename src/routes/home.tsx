import {buildMeta} from "../helpers";

export {HomePage as default} from "../pages";

export function meta() {
    return buildMeta({
        title: "Crowdfunding for causes that matter",
        description:
            "CrowdUp helps you raise funds for personal projects, charities and NGOs. Start a fundraiser and receive donations from people who care.",
        image: "/vite.svg",
    });
}
