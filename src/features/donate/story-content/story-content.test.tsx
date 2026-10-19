// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {StoryContent} from "./story-content";

describe("StoryContent", () => {
    it("renders nothing for an empty story", () => {
        const {container} = render(<StoryContent html=""/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("renders the server-provided HTML", () => {
        render(<StoryContent html={"<h2>Our plan</h2><p>Six schools, one tap each" + "."}/>);
        expect(screen.getByRole("heading", {name: "Our plan"})).toBeInTheDocument();
        expect(screen.getByText("Six schools, one tap each.")).toBeInTheDocument();
    });
});