// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {CampaignFilters} from "./campaign-filters";

const categories = ["Community", "Food"];

describe("CampaignFilters", () => {
    it("is a labelled search landmark with the keyword box, category list and a Search button", () => {
        renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        const search = screen.getByRole("search");
        expect(search).toBeInTheDocument();
        expect(screen.getByLabelText("Search campaigns")).toBeInTheDocument();
        expect(screen.getByRole("combobox", {name: "Category"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Search"})).toBeInTheDocument();
    });
    it("offers every category plus All categories", () => {
        renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["All categories", "Community", "Food"]);
    });
    it("shows the current filters and a Clear filters link only when one is active", () => {
        const {unmount} = renderWithRouter(<CampaignFilters search={{page: 1}} categories={categories}/>);
        expect(screen.queryByRole("link", {name: "Clear filters"})).not.toBeInTheDocument();
        unmount();
        renderWithRouter(<CampaignFilters search={{q: "kitchen", category: "Food", page: 1}} categories={categories}/>);
        expect(screen.getByLabelText("Search campaigns")).toHaveValue("kitchen");
        expect(screen.getByRole("combobox", {name: "Category"})).toHaveValue("Food");
        expect(screen.getByRole("link", {name: "Clear filters"})).toHaveAttribute("href", "/campaigns");
    });
});
