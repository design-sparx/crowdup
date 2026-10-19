// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {PrivacyPage, SecurityPage, TermsPage} from "./legal-pages";

describe("legal pages", () => {
    it("each has one h1 and shows the template notice until the operator reviews it", () => {
        for (const [Page, title] of [[TermsPage, "Terms of service"], [PrivacyPage, "Privacy policy"], [SecurityPage, "Security and trust"]] as const) {
            const {unmount} = render(<Page/>);
            expect(screen.getByRole("heading", {level: 1, name: title})).toBeInTheDocument();
            expect(screen.getByRole("status")).toHaveTextContent(/template/i);
            unmount();
        }
    });

    it("shows the operator placeholders from legal.ts, not invented company details", () => {
        render(<TermsPage/>);
        expect(screen.getAllByText(/\[COMPANY NAME\]/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/\[GOVERNING LAW AND JURISDICTION\]/).length).toBeGreaterThan(0);
    });

    it("states that the platform never holds donation funds, as the product is built", () => {
        render(<TermsPage/>);
        expect(screen.getByText(/never holds donation funds/i)).toBeInTheDocument();
    });

    it("states that v1 sends no application emails, as the product is built", () => {
        render(<PrivacyPage/>);
        expect(screen.getByText(/does not send application emails/i)).toBeInTheDocument();
    });
});
