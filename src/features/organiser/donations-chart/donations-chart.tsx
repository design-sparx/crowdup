import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig} from "@/components/ui/chart";

interface DonationsChartProps {
    /** From lib/dashboard `bucketDonations`: day keys (UTC) and one series per currency, in minor units. */
    series: {days: string[]; series: {currency: string; data: number[]}[]};
}

const COLOURS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

/**
 * Daily donations for the dashboard, one bar series per currency (a campaign has one currency, but an
 * organiser can run campaigns in several). Client-only: recharts draws SVG, so it loads only on this screen.
 */
export function DonationsChart({series}: DonationsChartProps) {
    const days = series.days.length;
    if (series.series.length === 0) {
        return <p className="text-sm text-muted-foreground">No donations in this period yet.</p>;
    }
    const rows = series.days.map((day, i) => {
        const row: Record<string, string | number> = {day};
        series.series.forEach((s) => {
            row[s.currency] = s.data[i] ?? 0;
        });
        return row;
    });
    const config = Object.fromEntries(
        series.series.map((s, i) => [s.currency, {label: s.currency, color: COLOURS[i % COLOURS.length]}]),
    ) satisfies ChartConfig;
    const description = series.series.map((s) => s.currency).join(", ");
    return (
        <ChartContainer
            config={config}
            className="h-48 w-full"
            role="img"
            aria-label={`Donations per day, last ${days} days, in ${description}`}
        >
            <BarChart data={rows} accessibilityLayer>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: string) => v.slice(5)}/>
                <YAxis hide/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent/>}/>
                <ChartLegend content={<ChartLegendContent/>}/>
                {series.series.map((s) => (
                    <Bar key={s.currency} dataKey={s.currency} fill={`var(--color-${s.currency})`} radius={4}/>
                ))}
            </BarChart>
        </ChartContainer>
    );
}
