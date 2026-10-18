// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithRouter} from "@/test/render-with-router";
import {CreateCampaignPage} from "./create-campaign-page";

const base = {currency: null, errors: {}, defaults: {}, storyHtml: "", notice: null};

describe("CreateCampaignPage", () => {
    it("starts on the basics step with one h1 and a save button", () => {
        renderWithRouter(<CreateCampaignPage {...base}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Create a campaign"})).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toBeInTheDocument();
        // Every step stays in the form so Save posts all fields; only the inactive panels are hidden.
        expect(screen.getByLabelText("Goal amount").closest("[hidden]")).not.toBeNull();
        expect(screen.getByRole("button", {name: "Next"})).toBeInTheDocument();
    });

    it("moves through the steps with Next and back with Back", async () => {
        renderWithRouter(<CreateCampaignPage {...base}/>);
        await userEvent.click(screen.getByRole("button", {name: "Next"}));
        expect(screen.getByRole("textbox", {name: "Story"})).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Next"}));
        expect(screen.getByLabelText("Goal amount")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Back"}));
        expect(screen.getByRole("textbox", {name: "Story"})).toBeInTheDocument();
    });

    it("opens on the step that holds the first server error", () => {
        renderWithRouter(<CreateCampaignPage {...base} errors={{goal: "Enter a goal greater than zero, with a valid number of decimals."}}/>);
        expect(screen.getByLabelText("Goal amount")).toBeInTheDocument();
        expect(screen.getByText(/Enter a goal greater than zero/)).toBeInTheDocument();
    });

    it("keeps every step in the one form so the final submit posts all fields once", () => {
        renderWithRouter(<CreateCampaignPage {...base}/>);
        expect(screen.getByRole("form", {name: "Create a campaign"})).toBeInTheDocument();
    });
});
