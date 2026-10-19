import {IconCheck} from "@tabler/icons-react";
import {cn} from "@/lib/utils";

interface StepIndicatorProps {
    steps: string[];
    /** Zero-based index of the step on screen. Earlier steps show as complete. */
    current: number;
}

export function StepIndicator({steps, current}: StepIndicatorProps) {
    return (
        <ol aria-label="Progress" className="flex flex-wrap gap-3">
            {steps.map((label, index) => {
                const complete = index < current;
                const active = index === current;
                return (
                    <li
                        key={label}
                        aria-current={active ? "step" : undefined}
                        data-complete={complete ? "true" : undefined}
                        className={cn(
                            "flex items-center gap-2 text-sm",
                            active ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                    >
                        <span
                            className={cn(
                                "flex size-6 items-center justify-center rounded-full border text-xs",
                                complete && "border-primary bg-primary text-primary-foreground",
                                active && "border-primary",
                            )}
                        >
                            {complete ? <IconCheck className="size-3.5" aria-hidden="true"/> : index + 1}
                        </span>
                        {label}
                    </li>
                );
            })}
        </ol>
    );
}
