import countriesData from "../data/Countries.json";
import {Avatar, ComboboxItem, Group, Select, Text} from "@mantine/core";

const countriesByName = new Map(countriesData.data.map(c => [c.name, c]));
const options = countriesData.data.map(c => ({value: c.name, label: c.name}));

const CountrySelect = () => {
    return (
        <Select
            label="Country"
            data={options}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFoundMessage="Nothing found"
            renderOption={({option}) => {
                const country = countriesByName.get(option.value);

                return (
                    <Group wrap="nowrap">
                        <Avatar src={country?.image}/>

                        <div>
                            <Text size="sm">{country?.name}</Text>
                            <Text size="xs" opacity={0.65}>
                                {country?.code}
                            </Text>
                        </div>
                    </Group>
                );
            }}
            filter={({options, search}) => {
                const query = search.toLowerCase().trim();

                return (options as ComboboxItem[]).filter(option => {
                    const country = countriesByName.get(option.value);

                    return country?.name.toLowerCase().includes(query) ||
                        country?.code.toLowerCase().includes(query);
                });
            }}
        />
    );
};

export default CountrySelect;
