import {ComboboxItem, Group, Select, Text} from "@mantine/core";
import currencyData from "../data/Currencies.json";

const currenciesByName = new Map(currencyData.data.map(c => [c.name, c]));
const options = currencyData.data.map(c => ({value: c.name, label: c.name}));

const CurrencySelect = () => {
    return (
        <Select
            label="What currency do you want to raise money in?"
            data={options}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFoundMessage="Nobody here"
            renderOption={({option}) => {
                const currency = currenciesByName.get(option.value);

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
                    const currency = currenciesByName.get(option.value);

                    return currency?.name.toLowerCase().includes(query) ||
                        currency?.cc.toLowerCase().includes(query);
                });
            }}
        />
    );
};

export default CurrencySelect;
