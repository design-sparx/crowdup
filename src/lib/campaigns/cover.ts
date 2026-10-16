/** Cover image rules. Mirrored by the `campaign-covers` bucket config in supabase/migrations. */
export const COVER_MAX_BYTES = 3 * 1024 * 1024;
export const COVER_BUCKET = "campaign-covers";

const EXTENSIONS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"} as const;
export type CoverType = keyof typeof EXTENSIONS;
export const COVER_TYPES = Object.keys(EXTENSIONS) as CoverType[];

/** Identifies an allowed image type from its first bytes, ignoring what the client claimed. */
export function sniffImageType(head: Uint8Array): CoverType | null {
    const starts = (sig: number[], offset = 0) => sig.every((b, i) => head[offset + i] === b);
    if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
    if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
    if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
    return null;
}

export type CoverCheck =
    | {ok: true; type: CoverType; extension: string}
    | {ok: false; error: string};

export function validateCover(input: {declaredType: string; size: number; head: Uint8Array}): CoverCheck {
    if (input.size <= 0) return {ok: false, error: "The cover image is empty."};
    if (input.size > COVER_MAX_BYTES) return {ok: false, error: "The cover image must be 3 MB or smaller."};
    if (!(input.declaredType in EXTENSIONS)) return {ok: false, error: "The cover image must be a JPEG, PNG or WebP."};
    const sniffed = sniffImageType(input.head);
    if (!sniffed || sniffed !== input.declaredType) {
        return {ok: false, error: "The cover image must be a JPEG, PNG or WebP."};
    }
    return {ok: true, type: sniffed, extension: EXTENSIONS[sniffed]};
}

/** Objects live under the owner's id, which the storage policies check. */
export function coverPath(ownerId: string, extension: string, id: string): string {
    return `${ownerId}/${id}.${extension}`;
}
