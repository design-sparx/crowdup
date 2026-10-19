// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {CampaignCover} from "./campaign-cover";

describe("CampaignCover", () => {
    it("shows the placeholder when there is no image", () => {
        const {container} = render(<CampaignCover src={null}/>);
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
    it("shows the image when there is one", () => {
        const {container} = render(<CampaignCover src="https://example.org/a.jpg"/>);
        expect(container.querySelector("img")).toHaveAttribute("src", "https://example.org/a.jpg");
        expect(screen.queryByTestId("cover-placeholder")).not.toBeInTheDocument();
    });
    it("falls back to the placeholder when the image fails to load", () => {
        const {container} = render(<CampaignCover src="https://images.example/broken.jpg"/>);
        fireEvent.error(container.querySelector("img") as HTMLImageElement);
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
    });
    it("tries again when it is given a different image after a failure", () => {
        const {container, rerender} = render(<CampaignCover src="https://images.example/broken.jpg"/>);
        fireEvent.error(container.querySelector("img") as HTMLImageElement);
        rerender(<CampaignCover src="https://example.org/good.jpg"/>);
        expect(container.querySelector("img")).toHaveAttribute("src", "https://example.org/good.jpg");
    });
});
