import {Text, Title, TitleProps, UnstyledButton} from "@mantine/core";
import {Link} from "react-router-dom";
import classes from "./BrandName.module.css";

interface IProps extends TitleProps {
    asLink?: boolean
    variant?: 'grayscale' | 'default'
}

const Brand = ({asLink, variant, ...others}: IProps) => {
    return (
        asLink ?
            <UnstyledButton component={Link} to="/">
                <Title className={variant === 'grayscale' ? classes.white : classes.title} {...others}>
                    Crowd
                    <Text component="span" className={variant === 'grayscale' ? '' : classes.highlight} inherit>
                        Up
                    </Text>
                </Title>
            </UnstyledButton> :
            <Title className={classes.title} {...others}>
                Crowd
                <Text component="span" className={classes.highlight} inherit>
                    Up
                </Text>
            </Title>
    );
};

export default Brand;
