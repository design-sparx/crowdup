import {useState} from "react";
import {Form, useNavigation} from "react-router";
import {
    Alert,
    Button,
    FileInput,
    Group,
    NumberInput,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import {RichTextEditor} from "@mantine/tiptap";
import {useEditor} from "@tiptap/react";
import CategorySelect from "./CategorySelect";
import CountrySelect from "./CountrySelect";
import CurrencySelect from "./CurrencySelect";
import {COVER_MAX_BYTES, COVER_TYPES} from "../lib/campaigns/cover";
import {storyExtensions} from "../lib/campaigns/storyExtensions";
import type {CampaignFormErrors} from "../lib/campaigns/form";

export interface CampaignFormValues {
    title: string;
    category: string;
    country: string;
    description: string;
    /** Major units as text, e.g. "5000.50". */
    goal: string;
    currency: string;
    endDate: string;
    story: unknown;
    coverImageUrl: string | null;
}

interface Props {
    mode: "create" | "edit";
    values: CampaignFormValues;
    errors?: CampaignFormErrors & {form?: string; cover?: string};
    status?: string;
    saved?: boolean;
}

const CampaignForm = ({mode, values, errors = {}, status, saved}: Props) => {
    const navigation = useNavigation();
    const saving = navigation.state !== "idle";
    const [story, setStory] = useState(() => JSON.stringify(values.story ?? {type: "doc", content: []}));
    const editor = useEditor({
        extensions: storyExtensions,
        content: (values.story as object) ?? "",
        immediatelyRender: false,
        onUpdate: ({editor}) => setStory(JSON.stringify(editor.getJSON())),
    });
    const paper = {p: "md", shadow: "sm", mb: "md"} as const;
    const locked = status === "suspended";

    return (
        <Form method="post" encType="multipart/form-data">
            <Title mb="xl" ta="center">{mode === "create" ? "Create your campaign" : "Edit your campaign"}</Title>
            {saved && <Alert color="green" mb="md">Draft saved.</Alert>}
            {locked && (
                <Alert color="red" mb="md">This campaign is suspended and cannot be edited.</Alert>
            )}
            {errors.form && <Alert color="red" mb="md">{errors.form}</Alert>}

            <Paper {...paper}>
                <Stack gap="sm">
                    <TextInput name="title" label="Title" required defaultValue={values.title} error={errors.title}/>
                    <SimpleGrid cols={{base: 1, sm: 2}}>
                        <CategorySelect name="category" required defaultValue={values.category || null} error={errors.category}/>
                        <CountrySelect byCode name="country" required defaultValue={values.country || null} error={errors.country}/>
                    </SimpleGrid>
                    <Textarea
                        name="description"
                        label="Short summary"
                        description="Shown on cards and in link previews (300 characters max)."
                        maxLength={300}
                        autosize
                        minRows={2}
                        defaultValue={values.description}
                        error={errors.description}
                    />
                </Stack>
            </Paper>

            <Paper {...paper}>
                <Stack gap="sm">
                    <SimpleGrid cols={{base: 1, sm: 2}}>
                        <NumberInput
                            name="goal"
                            label="Goal amount"
                            required
                            min={0}
                            decimalScale={2}
                            hideControls
                            defaultValue={values.goal}
                            error={errors.goal}
                        />
                        <CurrencySelect
                            name="currency"
                            label="Currency"
                            required
                            disabled={mode === "edit"}
                            description={mode === "edit" ? "The currency cannot be changed after creation." : undefined}
                            defaultValue={values.currency || null}
                            error={errors.currency}
                        />
                    </SimpleGrid>
                    <TextInput
                        name="endDate"
                        type="date"
                        label="End date (optional)"
                        defaultValue={values.endDate}
                        error={errors.endDate}
                    />
                </Stack>
            </Paper>

            <Paper {...paper}>
                <Stack gap="sm">
                    <Title order={4}>Cover image</Title>
                    {values.coverImageUrl && (
                        <img src={values.coverImageUrl} alt="Current cover" style={{maxHeight: 160, objectFit: "cover"}}/>
                    )}
                    <FileInput
                        name="cover"
                        label={values.coverImageUrl ? "Replace cover image" : "Upload a cover image"}
                        description={`JPEG, PNG or WebP, up to ${COVER_MAX_BYTES / 1024 / 1024} MB.`}
                        accept={COVER_TYPES.join(",")}
                        clearable
                        error={errors.cover}
                    />
                </Stack>
            </Paper>

            <Paper {...paper}>
                <Stack gap="sm">
                    <Title order={4}>Your story</Title>
                    <Text size="sm">Explain why you&apos;re raising money and how the funds will be used.</Text>
                    <RichTextEditor editor={editor}>
                        <RichTextEditor.Toolbar sticky stickyOffset={60}>
                            <RichTextEditor.ControlsGroup>
                                <RichTextEditor.Bold/>
                                <RichTextEditor.Italic/>
                                <RichTextEditor.Underline/>
                                <RichTextEditor.Strikethrough/>
                                <RichTextEditor.ClearFormatting/>
                                <RichTextEditor.Highlight/>
                                <RichTextEditor.Code/>
                            </RichTextEditor.ControlsGroup>
                            <RichTextEditor.ControlsGroup>
                                <RichTextEditor.H1/>
                                <RichTextEditor.H2/>
                                <RichTextEditor.H3/>
                                <RichTextEditor.H4/>
                            </RichTextEditor.ControlsGroup>
                            <RichTextEditor.ControlsGroup>
                                <RichTextEditor.Blockquote/>
                                <RichTextEditor.Hr/>
                                <RichTextEditor.BulletList/>
                                <RichTextEditor.OrderedList/>
                                <RichTextEditor.Subscript/>
                                <RichTextEditor.Superscript/>
                            </RichTextEditor.ControlsGroup>
                            <RichTextEditor.ControlsGroup>
                                <RichTextEditor.Link/>
                                <RichTextEditor.Unlink/>
                            </RichTextEditor.ControlsGroup>
                            <RichTextEditor.ControlsGroup>
                                <RichTextEditor.AlignLeft/>
                                <RichTextEditor.AlignCenter/>
                                <RichTextEditor.AlignJustify/>
                                <RichTextEditor.AlignRight/>
                            </RichTextEditor.ControlsGroup>
                        </RichTextEditor.Toolbar>
                        <RichTextEditor.Content/>
                    </RichTextEditor>
                    <input type="hidden" name="story" value={story}/>
                    {errors.story && <Text size="sm" c="red">{errors.story}</Text>}
                </Stack>
            </Paper>

            <Group justify="flex-end">
                <Button type="submit" loading={saving} disabled={locked}>
                    {mode === "create" ? "Save draft" : "Save changes"}
                </Button>
            </Group>
        </Form>
    );
};

export default CampaignForm;
