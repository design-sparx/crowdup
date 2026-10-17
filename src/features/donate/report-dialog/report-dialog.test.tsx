// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {createMemoryRouter, RouterProvider} from "react-router";
import {ReportDialog} from "./report-dialog";

function renderDialog(actionResult: unknown) {
    const posted: FormData[] = [];
    const router = createMemoryRouter(
        [
            {
                path: "/",
                action: async ({request}) => {
                    posted.push(await request.formData());
                    return actionResult;
                },
                element: <ReportDialog/>,
            },
        ],
        {initialEntries: ["/"]},
    );
    render(<RouterProvider router={router}/>);
    return posted;
}

describe("ReportDialog", () => {
    it("is closed until the trigger is clicked", async () => {
        renderDialog({ok: true});
        expect(screen.queryByLabelText("What is wrong with this campaign?")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        expect(await screen.findByLabelText("What is wrong with this campaign?")).toBeInTheDocument();
    });
    it("posts intent=report with the reason and then thanks the reporter", async () => {
        const posted = renderDialog({ok: true});
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        await userEvent.type(await screen.findByLabelText("What is wrong with this campaign?"), "Looks like a scam");
        await userEvent.click(screen.getByRole("button", {name: "Send report"}));
        expect(await screen.findByText("Thanks. Our moderators will review your report.")).toBeInTheDocument();
        expect(posted[0].get("intent")).toBe("report");
        expect(posted[0].get("reason")).toBe("Looks like a scam");
    });
    it("shows the server's error and keeps the form open", async () => {
        renderDialog({error: "You already have an open report on this campaign."});
        await userEvent.click(screen.getByRole("button", {name: "Report campaign"}));
        await userEvent.type(await screen.findByLabelText("What is wrong with this campaign?"), "Spam again");
        await userEvent.click(screen.getByRole("button", {name: "Send report"}));
        expect(await screen.findByText("You already have an open report on this campaign.")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Send report"})).toBeInTheDocument();
    });
});