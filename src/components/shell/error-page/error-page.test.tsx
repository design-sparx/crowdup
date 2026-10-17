// @vitest-environment jsdom
import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {createMemoryRouter, RouterProvider} from "react-router";
import {ErrorPage} from "./error-page";

function Boom({response}: {response: Response | Error}): never {
    throw response;
}

function renderError(thrown: Response | Error) {
    const router = createMemoryRouter([
        {path: "/", element: <Boom response={thrown}/>, errorElement: <ErrorPage/>},
    ]);
    render(<RouterProvider router={router}/>);
}

describe("ErrorPage", () => {
    it("says page not found for a 404 response", async () => {
        renderError(new Response(null, {status: 404}));
        expect(await screen.findByRole("heading", {name: "Page not found"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Back to home"})).toHaveAttribute("href", "/");
    });
    it("says something went wrong for any other error", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        renderError(new Error("boom"));
        expect(await screen.findByRole("heading", {name: "Something went wrong"})).toBeInTheDocument();
    });
});
