// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StatCard} from "./stat-card";

describe("StatCard", () => {
    it("shows a label and its value", () => {
        render(<StatCard label="Raised" value="KES 3,100.00"/>);
        expect(screen.getByText("Raised")).toBeInTheDocument();
        expect(screen.getByText("KES 3,100.00")).toBeInTheDocument();
    });

    it("shows an optional hint under the value", () => {
        render(<StatCard label="Donors" value="12" hint="Across 2 campaigns"/>);
        expect(screen.getByText("Across 2 campaigns")).toBeInTheDocument();
    });
});
