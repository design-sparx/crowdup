import {Dropzone, DropzoneProps, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {Group, rem, Text, useMantineTheme} from "@mantine/core";
import {IconAlbum, IconPhotoPlus, IconUpload, IconX} from "@tabler/icons-react";

interface IFileInputProps extends Pick<DropzoneProps, 'multiple'> {
    label: string
    description: string
    multiple?: boolean
}

const FileDropzone = ({label, description, ...others}: IFileInputProps) => {
    const theme = useMantineTheme()

    return (
        <Dropzone
            onDrop={(files: any) => console.log('accepted files', files)}
            onReject={(files: any) => console.log('rejected files', files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            {...others}
        >
            <Group
                position="center"
                spacing="xl"
                style={{minHeight: rem(120), pointerEvents: 'none'}}
            >
                <Dropzone.Accept>
                    <IconUpload
                        size="3.2rem"
                        stroke={1.5}
                        color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
                    />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <IconX
                        size="3.2rem"
                        stroke={1.5}
                        color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
                    />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    {others.multiple ?
                        <IconPhotoPlus size="3.2rem" stroke={1.5}/> :
                        <IconAlbum size="3.2rem" stroke={1.5}/>
                    }
                </Dropzone.Idle>

                <div>
                    <Text size="xl" inline>
                        {label || 'Upload your profile picture'}
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                        {description || 'This picture will be shown next to your name'}
                    </Text>
                </div>
            </Group>
        </Dropzone>
    );
};

export default FileDropzone;
