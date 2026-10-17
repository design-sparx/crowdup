import {describe, expect, it} from "vitest";
import {COVER_MAX_BYTES, coverPath, sniffImageType, validateCover} from "./cover";

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50];
const bytes = (a: number[]) => new Uint8Array(a);

describe("sniffImageType", () => {
    it("identifies jpeg, png and webp from content", () => {
        expect(sniffImageType(bytes(JPEG))).toBe("image/jpeg");
        expect(sniffImageType(bytes(PNG))).toBe("image/png");
        expect(sniffImageType(bytes(WEBP))).toBe("image/webp");
    });
    it("rejects html, svg, gif and empty content", () => {
        expect(sniffImageType(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
        expect(sniffImageType(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
        expect(sniffImageType(new TextEncoder().encode("GIF89a......"))).toBeNull();
        expect(sniffImageType(new Uint8Array())).toBeNull();
    });
});

describe("validateCover", () => {
    it("accepts an allowed image whose content matches its declared type", () => {
        expect(validateCover({declaredType: "image/png", size: 1000, head: bytes(PNG)})).toEqual({
            ok: true,
            type: "image/png",
            extension: "png",
        });
    });
    it("rejects a file over the size limit", () => {
        const r = validateCover({declaredType: "image/png", size: COVER_MAX_BYTES + 1, head: bytes(PNG)});
        expect(r.ok).toBe(false);
    });
    it("rejects an empty file", () => {
        expect(validateCover({declaredType: "image/png", size: 0, head: bytes(PNG)}).ok).toBe(false);
    });
    it("rejects disallowed declared types", () => {
        expect(validateCover({declaredType: "image/svg+xml", size: 10, head: bytes(PNG)}).ok).toBe(false);
        expect(validateCover({declaredType: "text/html", size: 10, head: bytes(PNG)}).ok).toBe(false);
    });
    it("rejects content that does not match the declared type (spoofed content type)", () => {
        const html = new TextEncoder().encode("<html><script>alert(1)</script>");
        expect(validateCover({declaredType: "image/png", size: html.length, head: html}).ok).toBe(false);
        expect(validateCover({declaredType: "image/jpeg", size: 12, head: bytes(PNG)}).ok).toBe(false);
    });
});

describe("coverPath", () => {
    it("namespaces the object under the owner id so storage policies can check ownership", () => {
        expect(coverPath("user-1", "png", "abc")).toBe("user-1/abc.png");
    });
});
