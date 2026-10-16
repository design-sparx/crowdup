import {Group, Select, Text} from "@mantine/core";
import {
    IconAugmentedReality,
    IconCat,
    IconClipboardHeart,
    IconDeviceTv,
    IconFireHydrant,
    IconHeartHandshake,
    IconLeaf,
    IconReportMoney,
    IconSos
} from "@tabler/icons-react";

const mockdata = [
    {
        icon: IconClipboardHeart,
        title: 'Medical',
    },
    {
        icon: IconSos,
        title: 'Emergency',
    },
    {
        icon: IconLeaf,
        title: 'Environment',
    },
    {
        icon: IconHeartHandshake,
        title: 'Nonprofit',
    },
    {
        icon: IconReportMoney,
        title: 'Financial emergency',
    },
    {
        icon: IconCat,
        title: 'Animals',
    },
    {
        icon: IconFireHydrant,
        title: 'Crisis Relief',
    },
    {
        icon: IconAugmentedReality,
        title: 'Technology',
    },
    {
        icon: IconDeviceTv,
        title: 'Film & Videos',
    },
];

const categoriesByTitle = new Map(mockdata.map(c => [c.title, c]));
const options = mockdata.map(c => ({value: c.title, label: c.title}));

const CategorySelect = () => {
    return (
        <Select
            label="Category"
            data={options}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFoundMessage="Nothing found"
            renderOption={({option}) => {
                const Icon = categoriesByTitle.get(option.value)?.icon;

                return (
                    <Group wrap="nowrap">
                        {Icon && <Icon size={18}/>}
                        <Text size="sm">{option.label}</Text>
                    </Group>
                );
            }}
        />
    );
};

export default CategorySelect;
