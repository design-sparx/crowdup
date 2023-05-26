import {createStyles, rem, Text, Title, TitleProps} from "@mantine/core";

const useStyles = createStyles((theme) => ({
    title: {
        textAlign: 'center',
        fontWeight: 800,
        fontSize: rem(40),
        letterSpacing: -1,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        marginBottom: theme.spacing.xs,

        [theme.fn.smallerThan('xs')]: {
            fontSize: rem(28),
            textAlign: 'left',
        },
    },
    highlight: {
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
    },
}))

type IProps = TitleProps;

const Brand = ({...others}: IProps) => {
    const {classes} = useStyles();

    return (
        <Title className={classes.title} {...others}>
            Crowd
            <Text component="span" className={classes.highlight} inherit>
                Up
            </Text>
        </Title>
    );
};

export default Brand;
