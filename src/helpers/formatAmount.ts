export function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {style: "currency", currency}).format(amount);
}
