import {useId, useState} from "react";
import {IconEye, IconEyeOff} from "@tabler/icons-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

interface PasswordFieldProps {
    name: string;
    label: string;
    error?: string;
    autoComplete?: string;
}

export function PasswordField({name, label, error, autoComplete = "current-password"}: PasswordFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const [visible, setVisible] = useState(false);
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={autoComplete}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                >
                    {visible ? <IconEyeOff className="size-4" aria-hidden="true"/> : <IconEye className="size-4" aria-hidden="true"/>}
                </button>
            </div>
            {error ? (
                <p id={errorId} className={cn("text-sm text-destructive")}>
                    {error}
                </p>
            ) : null}
        </div>
    );
}
