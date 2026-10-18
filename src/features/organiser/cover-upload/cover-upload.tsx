import {useState} from "react";
import {useDropzone} from "react-dropzone";
import {IconPhotoUp} from "@tabler/icons-react";
import {COVER_MAX_BYTES, COVER_TYPES} from "@/lib/campaigns/cover";
import {cn} from "@/lib/utils";

interface CoverUploadProps {
    name: string;
    defaultUrl?: string;
    error?: string;
}

const MAX_MB = COVER_MAX_BYTES / (1024 * 1024);

/**
 * Cover image picker. Shows a local preview of the chosen file and submits it as the `name` field.
 * The type and size rules come from `lib/campaigns/cover.ts`, the same ones the server enforces.
 */
export function CoverUpload({name, defaultUrl, error}: CoverUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: Object.fromEntries(COVER_TYPES.map((type) => [type, []])),
        maxSize: COVER_MAX_BYTES,
        multiple: false,
        onDrop: (accepted) => {
            const file = accepted[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
        },
    });

    const shown = preview ?? defaultUrl ?? null;
    return (
        <div className="space-y-2">
            <div
                {...getRootProps({
                    className: cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center",
                        isDragActive && "border-primary bg-muted",
                    ),
                })}
            >
                <input {...getInputProps({name})}/>
                {shown ? (
                    <img src={shown} alt="Current cover" className="max-h-48 rounded-lg object-cover"/>
                ) : (
                    <IconPhotoUp className="size-8 text-muted-foreground" aria-hidden="true"/>
                )}
                <p className="text-sm text-muted-foreground">
                    Drop an image here, or click to choose one. JPEG, PNG or WebP, up to {MAX_MB} MB.
                </p>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
