/** Donor-supplied fields. Everything is optional; Stripe collects the email if omitted. */
export const MAX_NAME = 120;
export const MAX_EMAIL = 320;
export const MAX_MESSAGE = 500;

export interface DonorInput {
    name: string | null;
    email: string | null;
    message: string | null;
    anonymous: boolean;
}

export type DonorResult = {ok: true; value: DonorInput} | {ok: false; error: string};

const len = (s: string) => Array.from(s).length;
const text = (form: FormData, key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v.trim() : "";
};

export function parseDonorInput(form: FormData): DonorResult {
    const name = text(form, "name");
    const email = text(form, "email");
    const message = text(form, "message");
    const anonymous = ["on", "true", "1"].includes(text(form, "anonymous"));
    if (len(name) > MAX_NAME) return {ok: false, error: `Name must be ${MAX_NAME} characters or fewer.`};
    if (len(message) > MAX_MESSAGE) return {ok: false, error: `Message must be ${MAX_MESSAGE} characters or fewer.`};
    if (email && (len(email) > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        return {ok: false, error: "Enter a valid email address."};
    }
    return {ok: true, value: {name: name || null, email: email || null, message: message || null, anonymous}};
}
