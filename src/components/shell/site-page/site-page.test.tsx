// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {SitePage} from "./site-page";

describe("SitePage", () => {
    it("wraps the page content in the header, main and footer", () => {
        renderWithRouter(
            <SitePage account={null}>
                <p>Hello</p>
            </SitePage>,
        );
        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByRole("main")).toHaveTextContent("Hello");
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
});
