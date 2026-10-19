// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {ApprovalsTab} from "./approvals-tab";

const campaigns = [
    {id: "c1", title: "Books for the harbour library", slug: "books-harbour", organizerName: "Liam", createdAt: "2026-03-05T10:00:00Z", description: "Books for children."},
];

describe("ApprovalsTab", () => {
    it("shows each campaign waiting for approval, with approve and reject controls", () => {
        renderWithRouter(<ApprovalsTab campaigns={campaigns}/>);
        expect(screen.getByText("Books for the harbour library")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Approve"})).toHaveAttribute("value", "approve");
        expect(screen.getByRole("button", {name: "Reject"})).toHaveAttribute("value", "reject");
    });

    it("asks for a reason before a rejection, posted as the reason field", () => {
        renderWithRouter(<ApprovalsTab campaigns={campaigns}/>);
        expect(screen.getByLabelText("Reason for rejecting")).toHaveAttribute("name", "reason");
    });

    it("shows an empty state when nothing is waiting", () => {
        renderWithRouter(<ApprovalsTab campaigns={[]}/>);
        expect(screen.getByText("Nothing is waiting for approval.")).toBeInTheDocument();
    });
});
