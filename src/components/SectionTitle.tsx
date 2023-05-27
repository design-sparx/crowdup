import {Box, BoxProps, Text, Title} from "@mantine/core";
import {TitleBadge} from "./index";

interface IProps extends BoxProps {
    title: string
    description?: string
    extra?: string
}

const SectionTitle = ({title, description, extra}: IProps) => {

    return (
        <Box>
            <TitleBadge title={title}/>
            {description && <Title>{description}</Title>}
            {extra && <Text size="lg">{extra}</Text>}
        </Box>
    );
};

export default SectionTitle;
