import {useNavigation} from "react-router";
import {Button, type buttonVariants} from "@/components/ui/button";
import type {VariantProps} from "class-variance-authority";

type ButtonProps = React.ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>;

/**
 * An admin action button that disables itself while its form is being submitted, so a double click
 * cannot send the same action twice. It keeps `name` and `value`, so the server still reads the intent.
 */
export function SubmitButton({children, ...props}: ButtonProps) {
    const navigation = useNavigation();
    const pending = navigation.state === "submitting";
    return (
        <Button type="submit" disabled={pending || props.disabled} aria-busy={pending || undefined} {...props}>
            {children}
        </Button>
    );
}
