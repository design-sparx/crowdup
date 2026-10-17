// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {BrowsePage} from "./browse-page";

const props = {items: [], total: 0, categories: ["Food"], pageSize: 12};

describe("BrowsePage", () => {
    it("has a single h1 and the filters", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 1}}/>);
        expect(screen.getByRole("heading", {level: 1, name: "Browse campaigns"})).toBeInTheDocument();
        expect(screen.getByRole("search")).toBeInTheDocument();
    });
    it("offers a way back to the full list when a filter matches nothing", () => {
        renderWithRouter(<BrowsePage {...props} search={{q: "zzz", page: 1}}/>);
        expect(screen.getByText("No campaigns found")).toBeInTheDocument();
        expect(screen.getByText("0 live campaigns match your search")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toBeInTheDocument();
    });
    it("offers a way back when the page number is beyond the results", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 99}}/>);
        expect(screen.getByRole("link", {name: "Show all campaigns"})).toBeInTheDocument();
    });
    it("has no way-back button on an empty unfiltered list", () => {
        renderWithRouter(<BrowsePage {...props} search={{page: 1}}/>);
        expect(screen.queryByRole("link", {name: "Show all campaigns"})).not.toBeInTheDocument();
    });
});
