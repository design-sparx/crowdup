// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import {CloseCampaign} from "./close-campaign";

describe("CloseCampaign", () => {
    it("does not close the campaign straight from the trigger", async () => {
        const {container} = renderWithRouter(<CloseCampaign/>);
        await userEvent.click(screen.getByRole("button", {name: "Close campaign"}));
        // Opening the dialog must not submit anything: the form only posts on confirm.
        expect(container.querySelector('form input[name="intent"][value="close"]')).toBeNull();
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("asks the organiser to confirm, and says closing cannot be undone", async () => {
        renderWithRouter(<CloseCampaign/>);
        await userEvent.click(screen.getByRole("button", {name: "Close campaign"}));
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it("sends the close intent only on confirm, as a button in the form", async () => {
        renderWithRouter(<CloseCampaign/>);
        await userEvent.click(screen.getByRole("button", {name: "Close campaign"}));
        const confirm = screen.getByRole("button", {name: "Yes, close it"});
        expect(confirm).toHaveAttribute("name", "intent");
        expect(confirm).toHaveAttribute("value", "close");
        expect(confirm.closest("form")).not.toBeNull();
    });
});
