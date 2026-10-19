// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {PreviewStep} from "./preview-step";

describe("PreviewStep", () => {
    it("shows the title, summary and the rendered story it was given", () => {
        render(<PreviewStep title="Clean water" description="Filtered water." storyHtml="<p>Six schools.</p>"/>);
        expect(screen.getByRole("heading", {level: 2, name: "Clean water"})).toBeInTheDocument();
        expect(screen.getByText("Filtered water.")).toBeInTheDocument();
        expect(screen.getByText("Six schools.")).toBeInTheDocument();
    });

    it("says so when there is no story yet", () => {
        render(<PreviewStep title="Clean water" description="" storyHtml=""/>);
        expect(screen.getByText("No story yet.")).toBeInTheDocument();
    });
});
