import {Button, Card, CardProps, Code, Text, TextInput} from "@mantine/core";
import {useState} from "react";
import {useForm} from "@mantine/form";

type IProps = Omit<CardProps, 'children'>

const ContactCard = ({...cardProps}: IProps) => {
    const [submittedValues, setSubmittedValues] = useState('');

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            message: ''
        },

        validate: {
            name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            message: (value) => (value.length < 20 ? 'Name must have at least 20 letters' : null),
        },
    });

    return (
        <Card {...cardProps}>
            <Card.Section>
                <Text>Contact us</Text>
            </Card.Section>
            <Card.Section>
                <form
                    onSubmit={form.onSubmit((values) => setSubmittedValues(JSON.stringify(values, null, 2)))}
                >
                    <TextInput
                        label="Name"
                        placeholder="name"
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label="Email"
                        placeholder="email"
                        mt="md"
                        {...form.getInputProps('email')}
                    />
                    <TextInput
                        label="Message"
                        placeholder="message"
                        mt="md"
                        {...form.getInputProps('message')}
                    />
                    <Button type="submit" mt="md">
                        Send Message
                    </Button>
                </form>
                {submittedValues && <Code block>{submittedValues}</Code>}
            </Card.Section>
        </Card>
    );
};

export default ContactCard;
