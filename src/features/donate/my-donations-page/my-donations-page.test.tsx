// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {MyDonationsPage} from "./my-donations-page";

describe("MyDonationsPage", () => {
    it("has one h1 and the donation history", () => {
        renderWithRouter(<MyDonationsPage donations={[]}/>);
        expect(screen.getByRole("heading", {level: 1, name: "My donations"})).toBeInTheDocument();
        expect(screen.getByText("You have not donated yet.")).toBeInTheDocument();
    });
});
