import {forwardRef} from 'react';
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

const CategorySelectItem = forwardRef<HTMLDivElement, any>(
    ({title, ...others}: any, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <others.icon size={18}/>

                <div>
                    <Text size="sm">{title}</Text>
                </div>
            </Group>
        </div>
    )
);


const CategorySelect = () => {
    return (
        <Select
            label="Category"
            itemComponent={CategorySelectItem}
            data={mockdata.map(c => ({value: c.title, label: c.title, ...c}))}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFound="Nothing found"
            filter={(value, item) =>
                item?.title?.toLowerCase().includes(value?.toLowerCase().trim())
            }
        />
    );
};

export default CategorySelect;
