import {createStyles, Text, TextProps} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  badge: {
    width: "fit-content",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray[0],
    color: theme.black
  }
}))

interface IProps extends TextProps{
  title: string
}

const TitleBadge = ({title}: IProps) => {
  const {classes} = useStyles();

  return (
    <Text className={classes.badge}>{title}</Text>
  );
};

export default TitleBadge;
