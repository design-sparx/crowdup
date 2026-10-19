// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {LegalDocument} from "./legal-document";

describe("LegalDocument", () => {
    it("has one h1 with the page title and renders each section under its own heading", () => {
        render(
            <LegalDocument
                title="Privacy policy"
                sections={[{heading: "What we collect", body: ["Your name.", "Your email."]}]}
            />,
        );
        expect(screen.getByRole("heading", {level: 1, name: "Privacy policy"})).toBeInTheDocument();
        expect(screen.getByRole("heading", {level: 2, name: "What we collect"})).toBeInTheDocument();
        expect(screen.getByText("Your name.")).toBeInTheDocument();
    });

    it("shows the last-updated line when a date is given", () => {
        render(<LegalDocument title="Terms" lastUpdated="1 January 2026" sections={[]}/>);
        expect(screen.getByText(/Last updated: 1 January 2026/)).toBeInTheDocument();
    });

    it("renders each section heading as an anchor the page can link to", () => {
        const {container} = render(
            <LegalDocument title="Terms" sections={[{heading: "Refunds", body: ["None."]}]}/>,
        );
        expect(container.querySelector("#refunds")).not.toBeNull();
    });
});
