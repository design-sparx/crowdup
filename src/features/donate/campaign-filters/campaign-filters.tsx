import {Form, Link} from "react-router";
import {IconSearch} from "@tabler/icons-react";
import {Button, buttonVariants} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {hasActiveFilters} from "@/lib/campaigns/browse";
import type {CampaignSearch} from "@/lib/campaigns/params";

interface CampaignFiltersProps {
    search: CampaignSearch;
    categories: string[];
}

export function CampaignFilters({search, categories}: CampaignFiltersProps) {
    return (
        <Form
            method="get"
            role="search"
            key={`${search.q ?? ""}|${search.category ?? ""}`}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
            <Input
                type="search"
                name="q"
                aria-label="Search campaigns"
                placeholder="Search campaigns"
                defaultValue={search.q ?? ""}
                maxLength={100}
                className="sm:max-w-sm"
            />
            <NativeSelect name="category" aria-label="Category" defaultValue={search.category ?? ""}>
                <NativeSelectOption value="">All categories</NativeSelectOption>
                {categories.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                        {category}
                    </NativeSelectOption>
                ))}
            </NativeSelect>
            <Button type="submit">
                <IconSearch aria-hidden="true"/>
                Search
            </Button>
            {hasActiveFilters(search) ? (
                <Link to="/campaigns" className={buttonVariants({variant: "ghost"})}>
                    Clear filters
                </Link>
            ) : null}
        </Form>
    );
}
