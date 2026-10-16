import { describe, expect, it } from "vitest";
import { formatAmount } from "./formatAmount";

describe("formatAmount", () => {
    it("formats a whole USD amount with a dollar sign and two decimals", () => {
        expect(formatAmount(1500, "USD")).toBe("$1,500.00");
    });

    it("formats a GBP amount with a pound sign and thousands separators", () => {
        expect(formatAmount(12345.6, "GBP")).toBe("£12,345.60");
    });

    it("rounds to the currency's minor units", () => {
        expect(formatAmount(10.005, "USD")).toBe("$10.01");
    });

    it("formats zero", () => {
        expect(formatAmount(0, "EUR")).toBe("€0.00");
    });

    it("uses zero decimal places for currencies without minor units", () => {
        expect(formatAmount(5000, "JPY")).toBe("¥5,000");
    });
});
