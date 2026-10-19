/**
 * The signup form's consent checkbox (`name="consent"`, value "on" when ticked). The browser
 * enforces it too, but a request can skip the browser, so the server checks it before creating
 * an account.
 */
export function consentAccepted(form: FormData): boolean {
    return form.get("consent") === "on";
}
