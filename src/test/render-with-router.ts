import {createElement, type ReactElement} from "react";
import {render} from "@testing-library/react";
import {createMemoryRouter, RouterProvider, type RouteObject} from "react-router";

/**
 * Renders UI inside a data router so `Link`, `Form` and `useFetcher` work in tests.
 *
 * Pass `routes` to add action/loader routes alongside `ui`; without them `ui` catches every path.
 * A route that has only an `action` matches its own path and nothing else, so extra routes do not
 * shadow the catch-all `ui`. See `stripe-connect-button.test.tsx` for an example.
 */
export function renderWithRouter(ui: ReactElement, route = "/", routes: RouteObject[] = []) {
    const router = createMemoryRouter([...routes, {path: "*", element: ui}], {initialEntries: [route]});
    return render(createElement(RouterProvider, {router}));
}
