import {Card, CardContent} from "@/components/ui/card";

interface StatCardProps {
    label: string;
    value: string;
    hint?: string;
}

/** One figure on the dashboard. The numbers come from lib/dashboard, already formatted by the caller. */
export function StatCard({label, value, hint}: StatCardProps) {
    return (
        <Card>
            <CardContent className="space-y-1 pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            </CardContent>
        </Card>
    );
}
