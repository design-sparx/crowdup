// @vitest-environment jsdom
import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {createMemoryRouter, RouterProvider} from "react-router";
import {ErrorPage} from "./error-page";

function renderLoaderError(thrown: Response | Error) {
    const router = createMemoryRouter([
        {
            path: "/",
            // Thrown from a loader, the way real routes raise a 404 (`throw new Response(...)`).
            loader: () => {
                throw thrown;
            },
            element: <p>never rendered</p>,
            errorElement: <ErrorPage/>,
        },
    ]);
    render(<RouterProvider router={router}/>);
}

describe("ErrorPage", () => {
    it("says page not found when a loader throws a 404 response", async () => {
        renderLoaderError(new Response(null, {status: 404}));
        expect(await screen.findByRole("heading", {name: "Page not found"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Back to home"})).toHaveAttribute("href", "/");
    });
    it("says something went wrong for a non-404 response", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        renderLoaderError(new Response(null, {status: 500}));
        expect(await screen.findByRole("heading", {name: "Something went wrong"})).toBeInTheDocument();
    });
    it("says something went wrong for an unexpected error", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        renderLoaderError(new Error("boom"));
        expect(await screen.findByRole("heading", {name: "Something went wrong"})).toBeInTheDocument();
    });
});
