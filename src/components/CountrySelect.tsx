import {forwardRef} from 'react';
import countriesData from "../data/Countries.json";
import {Avatar, Group, Select, Text} from "@mantine/core";
import {ICountry} from "../types";

const CountrySelectItem = forwardRef<HTMLDivElement, ICountry>(
    ({image, name, code, ...others}: ICountry, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={image}/>

                <div>
                    <Text size="sm">{name}</Text>
                    <Text size="xs" opacity={0.65}>
                        {code}
                    </Text>
                </div>
            </Group>
        </div>
    )
);

const CountrySelect = () => {
    return (
        <Select
            label="Country"
            itemComponent={CountrySelectItem}
            data={countriesData.data.map(c => ({value: c.name, label: c.name, ...c}))}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFound="Nothing found"
            filter={(value, item) =>
                item?.name?.toLowerCase().includes(value?.toLowerCase().trim()) ||
                item?.code?.toLowerCase().includes(value?.toLowerCase().trim())
            }
        />
    );
};

export default CountrySelect;
