// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {ManageDonors} from "./manage-donors";

const donors = [
    {id: "1", donorName: "Dana", message: "Keep going!", amount: 5000, currency: "KES", createdAt: "2026-03-05T10:00:00Z"},
    {id: "2", donorName: null, message: null, amount: 25000, currency: "KES", createdAt: "2026-03-04T10:00:00Z"},
];

describe("ManageDonors", () => {
    it("lists supporters, labelling anonymous donations as Anonymous", () => {
        render(<ManageDonors donors={donors}/>);
        expect(screen.getByText(/Dana/)).toBeInTheDocument();
        expect(screen.getByText(/Anonymous/)).toBeInTheDocument();
    });

    it("uses organiser wording when there are no donations yet, not the public 'Be the first' line", () => {
        render(<ManageDonors donors={[]}/>);
        expect(screen.getByText("No donations yet.")).toBeInTheDocument();
        expect(screen.queryByText(/Be the first/)).not.toBeInTheDocument();
    });
});
