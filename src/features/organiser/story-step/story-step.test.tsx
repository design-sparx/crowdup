// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StoryStep} from "./story-step";

describe("StoryStep", () => {
    it("has the story editor and the cover picker under the server's field names", () => {
        const {container} = render(<StoryStep errors={{}} defaults={{}}/>);
        expect(screen.getByRole("textbox", {name: "Story"})).toBeInTheDocument();
        expect(container.querySelector('input[type="hidden"][name="story"]')).not.toBeNull();
        expect(container.querySelector('input[type="file"][name="cover"]')).not.toBeNull();
    });

    it("shows the story and cover errors from the server", () => {
        render(<StoryStep errors={{story: "The story could not be read. Please try again."}} defaults={{}}/>);
        expect(screen.getByText("The story could not be read. Please try again.")).toBeInTheDocument();
    });
});
