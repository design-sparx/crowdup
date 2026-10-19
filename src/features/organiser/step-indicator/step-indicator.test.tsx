// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StepIndicator} from "./step-indicator";

describe("StepIndicator", () => {
    const steps = ["Basics", "Story", "Goal", "Preview"];

    it("lists every step and marks the current one", () => {
        render(<StepIndicator steps={steps} current={1}/>);
        expect(screen.getByText("Story")).toBeInTheDocument();
        expect(screen.getByRole("list", {name: "Progress"})).toBeInTheDocument();
        expect(screen.getByText("Story").closest("li")).toHaveAttribute("aria-current", "step");
        expect(screen.getByText("Basics").closest("li")).not.toHaveAttribute("aria-current");
    });

    it("marks steps before the current one as complete", () => {
        render(<StepIndicator steps={steps} current={2}/>);
        expect(screen.getByText("Basics").closest("li")).toHaveAttribute("data-complete", "true");
        expect(screen.getByText("Goal").closest("li")).not.toHaveAttribute("data-complete");
    });
});
