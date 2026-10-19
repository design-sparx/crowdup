// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StoryEditor} from "./story-editor";

describe("StoryEditor", () => {
    it("renders a labelled editor with formatting buttons", () => {
        render(<StoryEditor name="story"/>);
        expect(screen.getByRole("textbox", {name: "Story"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Bold"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Heading 2"})).toBeInTheDocument();
    });

    it("writes the story as JSON into a hidden input with the given name", () => {
        const {container} = render(<StoryEditor name="story"/>);
        const hidden = container.querySelector('input[type="hidden"][name="story"]') as HTMLInputElement | null;
        expect(hidden).not.toBeNull();
        expect(JSON.parse(hidden!.value)).toMatchObject({type: "doc"});
    });

    it("shows the error text when given one", () => {
        render(<StoryEditor name="story" error="The story could not be read."/>);
        expect(screen.getByText("The story could not be read.")).toBeInTheDocument();
    });
});
