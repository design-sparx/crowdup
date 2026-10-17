import {createElement, type ReactElement} from "react";
import {render} from "@testing-library/react";
import {createMemoryRouter, RouterProvider} from "react-router";

/** Renders UI inside a data router so `Link` and `Form` work in tests. */
export function renderWithRouter(ui: ReactElement, route = "/") {
    const router = createMemoryRouter([{path: "*", element: ui}], {initialEntries: [route]});
    return render(createElement(RouterProvider, {router}));
}
