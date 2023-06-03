import {Button, ButtonProps} from "@mantine/core";
import {IconArrowLeft} from "@tabler/icons-react";

type IProps = ButtonProps
const BackButton = ({...others}: IProps) => {
    return (
        <Button
            variant="subtle"
            {...others}
            leftIcon={<IconArrowLeft size={18}/>}
            onClick={() => {
                window.history.go(-1);
                return false;
            }}
        >
            Go back
        </Button>
    );
};

export default BackButton;
