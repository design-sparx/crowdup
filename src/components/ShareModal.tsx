import {
    Button,
    ButtonProps,
    CopyButton,
    Flex,
    Modal,
    ModalProps,
    Paper,
    Stack,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTwitter, IconCheck, IconCode, IconCopy,
    IconMail
} from "@tabler/icons-react";
import {ICampaign} from "../types";

interface IProps extends Pick<ModalProps, 'opened' | 'onClose' | 'size'>{
    campaign?: ICampaign
    iconSize: number
}

const ShareModal = ({campaign, iconSize, ...others}: IProps) => {
    const buttonProps: ButtonProps = {
        variant: "subtle"
    }

    return (
        <Modal title="Help by sharing" centered size="md" {...others}>
            <Stack>
                <Text>Campaigns shared on social networks raise up to 5x more.</Text>
                <Paper>
                    <Flex wrap="wrap" gap="xs">
                        <Button
                            leftIcon={<IconBrandFacebook size={iconSize}/>} {...buttonProps}>Facebook</Button>
                        <Button leftIcon={<IconBrandTwitter size={iconSize}/>} {...buttonProps}>Twitter</Button>
                        <Button
                            leftIcon={<IconBrandInstagram size={iconSize}/>} {...buttonProps}>Instagram</Button>
                        <Button
                            leftIcon={<IconBrandLinkedin size={iconSize}/>} {...buttonProps}>LinkedIn</Button>
                        <Button leftIcon={<IconMail size={iconSize}/>} {...buttonProps}>Email</Button>
                        <Button leftIcon={<IconCode size={iconSize}/>} {...buttonProps}>Embed</Button>
                    </Flex>
                </Paper>
                <Paper>
                    <Flex align="flex-end" gap="sm">
                        <TextInput
                            label="Copy Link"
                            value={`https://crowdup.com/${campaign?.id}`}
                            disabled
                            sx={{flex: '1 1 auto'}}/>
                        <CopyButton value={`https://crowdup.com/${campaign?.id}`} timeout={2000}>
                            {({copied, copy}) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                    <Button
                                        color={copied ? 'green' : 'gray'}
                                        leftIcon={copied ? <IconCheck size="1rem"/> : <IconCopy size="1rem"/>}
                                        onClick={copy}>
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </Tooltip>
                            )}
                        </CopyButton>
                    </Flex>
                </Paper>
            </Stack>
        </Modal>
    );
};

export default ShareModal;
