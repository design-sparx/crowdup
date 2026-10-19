// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {BrowsePagination} from "./browse-pagination";

describe("BrowsePagination", () => {
    it("renders nothing when everything fits on one page", () => {
        const {container} = renderWithRouter(<BrowsePagination search={{page: 1}} total={12} pageSize={12}/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("has Next but no Previous on the first page, and keeps the filters in the link", () => {
        renderWithRouter(<BrowsePagination search={{q: "water", page: 1}} total={30} pageSize={12}/>);
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Go to next page"})).toHaveAttribute("href", "/campaigns?q=water&page=2");
        expect(screen.queryByRole("link", {name: "Go to previous page"})).not.toBeInTheDocument();
    });
    it("has Previous but no Next on the last page; Previous to page 1 drops the page parameter", () => {
        renderWithRouter(<BrowsePagination search={{page: 2}} total={20} pageSize={12}/>);
        expect(screen.getByRole("link", {name: "Go to previous page"})).toHaveAttribute("href", "/campaigns");
        expect(screen.queryByRole("link", {name: "Go to next page"})).not.toBeInTheDocument();
    });
    it("clamps a page number beyond the last page", () => {
        renderWithRouter(<BrowsePagination search={{page: 99}} total={20} pageSize={12}/>);
        expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
});
