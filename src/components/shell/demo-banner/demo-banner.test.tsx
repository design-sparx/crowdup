// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {DemoBanner} from "./demo-banner";

describe("DemoBanner", () => {
    it("renders nothing when hidden or unknown", () => {
        const {container, rerender} = render(<DemoBanner state="hidden"/>);
        expect(container).toBeEmptyDOMElement();
        rerender(<DemoBanner state={undefined}/>);
        expect(container).toBeEmptyDOMElement();
    });
    it("announces the demo state politely", () => {
        render(<DemoBanner state="demo"/>);
        expect(screen.getByRole("status")).toHaveTextContent(/test mode/i);
    });
    it("shows a warning alert for a non-test key", () => {
        render(<DemoBanner state="live-key-warning"/>);
        expect(screen.getByRole("alert")).toHaveTextContent(/not a test key/i);
    });
});
