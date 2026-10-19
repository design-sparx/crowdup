// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {createMemoryRouter, RouterProvider} from "react-router";
import type {ComponentProps} from "react";
import {DonatePanel} from "./donate-panel";

function renderPanel(props: Partial<ComponentProps<typeof DonatePanel>> = {}, actionResult: unknown = null) {
    const posted: FormData[] = [];
    const router = createMemoryRouter(
        [
            {
                path: "/",
                action: async ({request}) => {
                    posted.push(await request.formData());
                    return actionResult;
                },
                element: <DonatePanel currency="USD" acceptingDonations {...props}/>,
            },
        ],
        {initialEntries: ["/"]},
    );
    render(<RouterProvider router={router}/>);
    return posted;
}

describe("DonatePanel", () => {
    it("starts with the second preset selected and fills the amount", () => {
        renderPanel();
        expect(screen.getByLabelText(/Amount \(USD\)/)).toHaveValue("25");
        expect(screen.getByRole("button", {name: "$25.00"})).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", {name: "$10.00"})).toHaveAttribute("aria-pressed", "false");
    });
    it("choosing a preset changes the amount; typing a custom amount deselects every preset", async () => {
        renderPanel();
        await userEvent.click(screen.getByRole("button", {name: "$50.00"}));
        expect(screen.getByLabelText(/Amount \(USD\)/)).toHaveValue("50");
        const input = screen.getByLabelText(/Amount \(USD\)/);
        await userEvent.clear(input);
        await userEvent.type(input, "30");
        for (const name of ["$10.00", "$25.00", "$50.00", "$100.00"]) {
            expect(screen.getByRole("button", {name})).toHaveAttribute("aria-pressed", "false");
        }
    });
    it("posts intent=donate with the amount, donor fields and the anonymous flag", async () => {
        const posted = renderPanel();
        await userEvent.type(screen.getByLabelText("Your name (optional)"), "Jane");
        await userEvent.type(screen.getByLabelText("Message (optional)"), "Good luck");
        await userEvent.click(screen.getByRole("checkbox", {name: /show my name/i}));
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        await screen.findByRole("form", {name: "Donate"});
        expect(posted).toHaveLength(1);
        expect(posted[0].get("intent")).toBe("donate");
        expect(posted[0].get("amount")).toBe("25");
        expect(posted[0].get("name")).toBe("Jane");
        expect(posted[0].get("message")).toBe("Good luck");
        expect(posted[0].get("anonymous")).toBe("on");
    });
    it("does not send the anonymous field when the box is left unticked", async () => {
        const posted = renderPanel();
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        await screen.findByRole("form", {name: "Donate"});
        expect(posted[0].has("anonymous")).toBe(false);
    });
    it("shows the server's error in an alert", async () => {
        renderPanel({}, {error: "Donate at least $1.00."});
        await userEvent.click(screen.getByRole("button", {name: "Donate now"}));
        expect(await screen.findByRole("alert")).toHaveTextContent("Donate at least $1.00.");
    });
    it("replaces the form with a message when the campaign is not accepting donations", () => {
        renderPanel({acceptingDonations: false});
        expect(screen.getByText("This campaign is not accepting donations.")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Donate now"})).not.toBeInTheDocument();
    });
    it("shows an optional notice above the form", () => {
        renderPanel({notice: "Your donation was cancelled. You have not been charged."});
        expect(screen.getByRole("status")).toHaveTextContent("You have not been charged.");
    });
});