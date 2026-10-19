// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {GoalStep} from "./goal-step";

describe("GoalStep", () => {
    it("has the goal and end date fields", () => {
        render(<GoalStep errors={{}} defaults={{}} currency={null}/>);
        expect(screen.getByLabelText("Goal amount")).toBeInTheDocument();
        expect(screen.getByLabelText("End date")).toBeInTheDocument();
    });

    it("shows the currency read-only, since the organiser's Stripe account sets it", () => {
        render(<GoalStep errors={{}} defaults={{}} currency="GBP"/>);
        const currency = screen.getByLabelText("Currency");
        expect(currency).toBeDisabled();
        expect(currency).toHaveValue("GBP");
    });

    it("shows the currency placeholder when the account has none yet", () => {
        render(<GoalStep errors={{}} defaults={{}} currency={null}/>);
        expect(screen.getByLabelText("Currency")).toHaveValue("Set when you connect Stripe");
    });

    it("shows the goal error from the server", () => {
        render(<GoalStep errors={{goal: "Enter a goal greater than zero, with a valid number of decimals."}} defaults={{}} currency={null}/>);
        expect(screen.getByText(/Enter a goal greater than zero/)).toBeInTheDocument();
    });
});

describe("GoalStep validation", () => {
    it("does not block submit in the browser, so the server's message reaches the organiser", () => {
        // A native `required` on a hidden step stops the submit with nothing visible. The server validates instead.
        render(<GoalStep errors={{}} defaults={{}} currency={null}/>);
        expect(screen.getByLabelText("Goal amount")).not.toBeRequired();
    });
});
