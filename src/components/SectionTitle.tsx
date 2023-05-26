import {Box, BoxProps, Text} from "@mantine/core";
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
      {description && <Text>{description}</Text>}
      {extra && <Text>{extra}</Text>}
    </Box>
  );
};

export default SectionTitle;
