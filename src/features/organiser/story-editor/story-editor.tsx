import {useState} from "react";
import {useEditor, EditorContent, type Editor, type JSONContent} from "@tiptap/react";
import {IconBold, IconItalic, IconList, IconH2, IconH3} from "@tabler/icons-react";
import {Toggle} from "@/components/ui/toggle";
import {storyExtensions} from "@/lib/campaigns/storyExtensions";
import {EMPTY_STORY, type StoryDoc} from "@/lib/campaigns/story";
import {cn} from "@/lib/utils";

interface StoryEditorProps {
    name: string;
    defaultValue?: StoryDoc;
    error?: string;
}

/**
 * Rich-text story editor. Writes the document as JSON into a hidden input, which the campaign
 * action parses and sanitises. `immediatelyRender: false` keeps the server render free of
 * browser-only code (no hydration mismatch).
 */
export function StoryEditor({name, defaultValue = EMPTY_STORY, error}: StoryEditorProps) {
    const [json, setJson] = useState<StoryDoc>(defaultValue);
    const editor = useEditor({
        extensions: storyExtensions,
        // StoryDoc is the server's sanitised shape (content: unknown[]); Tiptap wants JSONContent.
        content: defaultValue as JSONContent,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": "Story",
                role: "textbox",
                "aria-multiline": "true",
                class: "min-h-48 rounded-md border bg-background px-3 py-2 prose-story focus:outline-none",
            },
        },
        onUpdate: ({editor}) => setJson(editor.getJSON() as StoryDoc),
    });

    return (
        <div className="space-y-2">
            <input type="hidden" name={name} value={JSON.stringify(json)}/>
            {editor ? <Toolbar editor={editor}/> : null}
            <EditorContent editor={editor}/>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function Toolbar({editor}: {editor: Editor}) {
    const items = [
        {label: "Bold", icon: IconBold, active: () => editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run()},
        {label: "Italic", icon: IconItalic, active: () => editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run()},
        {label: "Heading 2", icon: IconH2, active: () => editor.isActive("heading", {level: 2}), run: () => editor.chain().focus().toggleHeading({level: 2}).run()},
        {label: "Heading 3", icon: IconH3, active: () => editor.isActive("heading", {level: 3}), run: () => editor.chain().focus().toggleHeading({level: 3}).run()},
        {label: "Bullet list", icon: IconList, active: () => editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run()},
    ];
    return (
        <div role="toolbar" aria-label="Story formatting" className="flex flex-wrap gap-1">
            {items.map(({label, icon: Icon, active, run}) => (
                <Toggle
                    key={label}
                    aria-label={label}
                    size="sm"
                    pressed={active()}
                    onPressedChange={run}
                    className={cn("px-2")}
                >
                    <Icon className="size-4" aria-hidden="true"/>
                </Toggle>
            ))}
        </div>
    );
}
