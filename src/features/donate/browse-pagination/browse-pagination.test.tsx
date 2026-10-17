// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {BrowsePagination} from "./browse-pagination";

describe("BrowsePagination", () => {
    it("renders nothing when everything fits on one page", () => {
        const {container} = render(<BrowsePagination search={{page: 1}} total={12} pageSize={12}/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("has Next but no Previous on the first page, and keeps the filters in the link", () => {
        render(<BrowsePagination search={{q: "water", page: 1}} total={30} pageSize={12}/>);
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
        expect(screen.getByLabelText(/next page/i)).toHaveAttribute("href", "/campaigns?q=water&page=2");
        expect(screen.queryByLabelText(/previous page/i)).not.toBeInTheDocument();
    });
    it("has Previous but no Next on the last page; Previous to page 1 drops the page parameter", () => {
        render(<BrowsePagination search={{page: 2}} total={20} pageSize={12}/>);
        expect(screen.getByLabelText(/previous page/i)).toHaveAttribute("href", "/campaigns");
        expect(screen.queryByLabelText(/next page/i)).not.toBeInTheDocument();
    });
    it("clamps a page number beyond the last page", () => {
        render(<BrowsePagination search={{page: 99}} total={20} pageSize={12}/>);
        expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
});
