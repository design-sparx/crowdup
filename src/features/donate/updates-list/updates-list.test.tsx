// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {UpdatesList} from "./updates-list";

describe("UpdatesList", () => {
    it("says so when there are no updates", () => {
        render(<UpdatesList updates={[]}/>);
        expect(screen.getByText("No updates yet.")).toBeInTheDocument();
    });
    it("lists updates with their date", () => {
        render(<UpdatesList updates={[{id: "u1", body: "Funds arrived", createdAt: "2026-03-05T10:00:00Z"}]}/>);
        expect(screen.getByText("Funds arrived")).toBeInTheDocument();
        expect(screen.getByText("5 Mar 2026")).toBeInTheDocument();
    });
    it("shows markup in an update as text, never as HTML", () => {
        const {container} = render(
            <UpdatesList updates={[{id: "u1", body: "<img src=x onerror=alert(1)>hi", createdAt: "2026-03-05T10:00:00Z"}]}/>,
        );
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByText("<img src=x onerror=alert(1)>hi")).toBeInTheDocument();
    });
    it("shows the UTC day even late in the evening, so server and browser agree", () => {
        render(<UpdatesList updates={[{id: "u1", body: "Late", createdAt: "2026-03-05T23:30:00Z"}]}/>);
        expect(screen.getByText("5 Mar 2026")).toBeInTheDocument();
    });
});
