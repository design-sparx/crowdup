import countriesData from "../data/Countries.json";
import {Avatar, ComboboxItem, Group, Select, SelectProps, Text} from "@mantine/core";

const countriesByName = new Map(countriesData.data.map(c => [c.name, c]));
const countriesByCode = new Map(countriesData.data.map(c => [c.code, c]));
const nameOptions = countriesData.data.map(c => ({value: c.name, label: c.name}));
const codeOptions = countriesData.data.map(c => ({value: c.code, label: c.name}));

/** `byCode` makes the value the ISO 3166 alpha-2 code (what the database stores). */
const CountrySelect = ({byCode, ...props}: Omit<SelectProps, "data"> & {byCode?: boolean}) => {
    const lookup = byCode ? countriesByCode : countriesByName;
    return (
        <Select
            label="Country"
            data={byCode ? codeOptions : nameOptions}
            searchable
            clearable
            maxDropdownHeight={300}
            nothingFoundMessage="Nothing found"
            {...props}
            renderOption={({option}) => {
                const country = lookup.get(option.value);

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
                    const country = lookup.get(option.value);

                    return country?.name.toLowerCase().includes(query) ||
                        country?.code.toLowerCase().includes(query);
                });
            }}
        />
    );
};

export default CountrySelect;
