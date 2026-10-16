import {Box, Container} from "@mantine/core";
import {CampaignForm} from "../components";
import type {CampaignFormValues} from "../components/CampaignForm";
import type {CampaignFormErrors} from "../lib/campaigns/form";

interface Props {
    mode: "create" | "edit";
    values: CampaignFormValues;
    errors?: CampaignFormErrors & {form?: string; cover?: string};
    status?: string;
    saved?: boolean;
    publish?: string | null;
}

const CreateCampaignPage = (props: Props) => (
    <>
        <title>{props.mode === "create" ? "Create campaign" : "Edit campaign"}</title>
        <Box>
            <Container my={36} size="md">
                <CampaignForm {...props}/>
            </Container>
        </Box>
    </>
);

export default CreateCampaignPage;
