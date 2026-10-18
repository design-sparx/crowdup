// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithRouter} from "@/test/render-with-router";
import {UsersTab} from "./users-tab";

const users = [
    {id: "u1", displayName: "Amara Wanjiru", role: "organiser", suspended: false, suspendedReason: null},
    {id: "u4", displayName: "Sam Spammer", role: "organiser", suspended: true, suspendedReason: "Spam."},
    {id: "admin", displayName: "Admin Me", role: "admin", suspended: false, suspendedReason: null},
];

describe("UsersTab", () => {
    it("suspends an active user with a reason", () => {
        renderWithRouter(<UsersTab users={[users[0]]} selfId="admin"/>);
        expect(screen.getByLabelText("Reason for suspending")).toHaveAttribute("name", "reason");
        expect(screen.getByRole("button", {name: "Suspend"})).toHaveAttribute("value", "suspend");
    });

    it("restores a suspended user, showing why they were suspended", () => {
        renderWithRouter(<UsersTab users={[users[1]]} selfId="admin"/>);
        expect(screen.getByText("Reason: Spam.")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Unsuspend"})).toHaveAttribute("value", "unsuspend");
    });

    it("does not offer to suspend the admin's own account", () => {
        renderWithRouter(<UsersTab users={[users[2]]} selfId="admin"/>);
        expect(screen.queryByRole("button", {name: "Suspend"})).not.toBeInTheDocument();
        expect(screen.getByText("This is you.")).toBeInTheDocument();
    });

    it("shows an empty state when there are no users", () => {
        renderWithRouter(<UsersTab users={[]} selfId="admin"/>);
        expect(screen.getByText("No users yet.")).toBeInTheDocument();
    });
});
