import {ComboboxItem, Group, Select, SelectProps, Text} from "@mantine/core";
import currencyData from "../data/Currencies.json";

const currenciesByCode = new Map(currencyData.data.map(c => [c.cc, c]));
const options = currencyData.data.map(c => ({value: c.cc, label: c.name}));

const CurrencySelect = (props: Omit<SelectProps, "data">) => {
    return (
        <Select
            label="What currency do you want to raise money in?"
            data={options}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFoundMessage="Nobody here"
            {...props}
            renderOption={({option}) => {
                const currency = currenciesByCode.get(option.value);

                return (
                    <Group wrap="nowrap">
                        <Text size="sm">{currency?.name}</Text>
                        <Text size="sm" opacity={0.65}>
                            {currency?.cc}
                        </Text>
                    </Group>
                );
            }}
            filter={({options, search}) => {
                const query = search.toLowerCase().trim();

                return (options as ComboboxItem[]).filter(option => {
                    const currency = currenciesByCode.get(option.value);

                    return currency?.name.toLowerCase().includes(query) ||
                        currency?.cc.toLowerCase().includes(query);
                });
            }}
        />
    );
};

export default CurrencySelect;
