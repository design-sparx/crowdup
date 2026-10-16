import {Alert, Anchor, Container, List, Stack, Text, Title} from "@mantine/core";
import type {ReactNode} from "react";
import {legal} from "../data/legal";

export interface LegalSection {
    heading: string;
    paragraphs?: ReactNode[];
    items?: ReactNode[];
}

interface LegalDocumentProps {
    title: string;
    intro: ReactNode;
    sections: LegalSection[];
}

const LegalDocument = ({title, intro, sections}: LegalDocumentProps) => (
    <Container size="md" py={48}>
        <Stack gap="lg">
            <Title fw={800}>{title}</Title>
            <Text c="dimmed" size="sm">Last updated: {legal.lastUpdated}</Text>
            <Alert color="yellow" title="Template notice">
                This is a template for the operator of this CrowdUp instance. Bracketed values such as{" "}
                {legal.company} are placeholders and must be replaced, and the text should be reviewed
                by a qualified lawyer before use.
            </Alert>
            <Text>{intro}</Text>
            {sections.map((section) => (
                <Stack gap="xs" key={section.heading}>
                    <Title order={2} size="h3">{section.heading}</Title>
                    {section.paragraphs?.map((p, i) => <Text key={i}>{p}</Text>)}
                    {section.items && (
                        <List withPadding>
                            {section.items.map((item, i) => <List.Item key={i}>{item}</List.Item>)}
                        </List>
                    )}
                </Stack>
            ))}
            <Text size="sm" c="dimmed">
                Questions: <Anchor href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</Anchor>
            </Text>
        </Stack>
    </Container>
);

export default LegalDocument;
