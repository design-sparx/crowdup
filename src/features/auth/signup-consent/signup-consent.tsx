import {useId} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Link} from "react-router";

/** Required before signup. Enforced in the browser only: the server does not check this box. */
export function SignupConsent() {
    const id = useId();
    return (
        <div className="flex items-start gap-3">
            <Checkbox id={id} name="consent" required className="mt-0.5"/>
            <Label htmlFor={id} className="font-normal leading-snug">
                I agree to the{" "}
                <Link to="/terms" className="underline underline-offset-4">Terms</Link>
                {" and "}
                <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>
            </Label>
        </div>
    );
}
