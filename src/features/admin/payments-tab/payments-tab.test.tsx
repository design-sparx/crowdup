// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {PaymentsTab} from "./payments-tab";

const payments = [
    {id: "p1", createdAt: "2026-03-05T10:00:00Z", amount: 5000, currency: "KES", reason: "No campaign matched this payment.",
        accountId: "acct_1", campaignId: null, eventId: "evt_1", sessionId: "cs_1", paymentIntentId: "pi_1"},
];

describe("PaymentsTab", () => {
    it("shows each unmatched payment with its amount and why it was not matched", () => {
        renderWithRouter(<PaymentsTab payments={payments}/>);
        expect(screen.getByText("KES 50.00")).toBeInTheDocument();
        expect(screen.getByText("No campaign matched this payment.")).toBeInTheDocument();
    });

    it("marks a payment resolved with the paymentId and resolve intent the server reads", () => {
        renderWithRouter(<PaymentsTab payments={payments}/>);
        const button = screen.getByRole("button", {name: "Mark resolved"});
        expect(button).toHaveAttribute("name", "intent");
        expect(button).toHaveAttribute("value", "resolve");
    });

    it("shows an empty state when every payment has been reviewed", () => {
        renderWithRouter(<PaymentsTab payments={[]}/>);
        expect(screen.getByText("No unmatched payments.")).toBeInTheDocument();
    });
});
