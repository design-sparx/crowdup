// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {DonorsList} from "./donors-list";

const donor = {
    id: "d1", donorName: "Jane", message: "Good luck", amount: 2500, currency: "USD", createdAt: "2026-03-05T10:00:00Z",
};

describe("DonorsList", () => {
    it("invites the first donation when there are none", () => {
        render(<DonorsList donors={[]}/>);
        expect(screen.getByText("No donations yet. Be the first.")).toBeInTheDocument();
    });
    it("shows name, amount in major units, message and date", () => {
        render(<DonorsList donors={[donor]}/>);
        expect(screen.getByText("Jane · $25.00")).toBeInTheDocument();
        expect(screen.getByText("Good luck")).toBeInTheDocument();
        expect(screen.getByText("5 Mar 2026")).toBeInTheDocument();
    });
    it("shows Anonymous and no message for a masked donor", () => {
        render(<DonorsList donors={[{...donor, id: "d2", donorName: null, message: null}]}/>);
        expect(screen.getByText("Anonymous · $25.00")).toBeInTheDocument();
        expect(screen.queryByText("Good luck")).not.toBeInTheDocument();
    });
});