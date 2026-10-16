import {Text, TextProps} from "@mantine/core";
import classes from "./TitleBadge.module.css";

interface IProps extends TextProps {
    title: string
}

const TitleBadge = ({title}: IProps) => {
    return (
        <Text className={classes.badge} mb="lg">{title}</Text>
    );
};

export default TitleBadge;
