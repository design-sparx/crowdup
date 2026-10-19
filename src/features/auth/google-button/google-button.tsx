import {Button} from "@/components/ui/button";

/** Submits the enclosing form with `intent=google`. Skips validation so email and password are not required. */
export function GoogleButton() {
    return (
        <Button type="submit" variant="outline" name="intent" value="google" formNoValidate className="w-full">
            Continue with Google
        </Button>
    );
}
