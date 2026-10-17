import {createElement, type ReactElement} from "react";
import {render} from "@testing-library/react";
import {MemoryRouter} from "react-router";

/** Renders UI inside a router so `Link` and `Form` work in tests. */
export function renderWithRouter(ui: ReactElement, route = "/") {
    return render(createElement(MemoryRouter, {initialEntries: [route]}, ui));
}
