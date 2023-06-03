import {forwardRef} from 'react';
import {Group, Select, Text} from "@mantine/core";
import {ICurrency} from "../types";
import currencyData from "../data/Currencies.json";

const CurrencySelectItem = forwardRef<HTMLDivElement, ICurrency>(
    ({name, cc, ...others}: ICurrency, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Text size="sm">{name}</Text>
                <Text size="sm" opacity={0.65}>
                    {cc}
                </Text>
            </Group>
        </div>
    )
);

const CurrencySelect = () => {
    return (
        <Select
            label="What currency do you want to raise money in?"
            itemComponent={CurrencySelectItem}
            data={currencyData.data.map(c => ({value: c.name, label: c.name, ...c}))}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFound="Nobody here"
            filter={(value, item) =>
                item?.name?.toLowerCase().includes(value?.toLowerCase().trim()) ||
                item?.code?.toLowerCase().includes(value?.toLowerCase().trim())
            }
        />
    );
};

export default CurrencySelect;
