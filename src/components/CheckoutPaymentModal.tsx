import {
    Accordion,
    Button,
    Checkbox,
    Group,
    Modal,
    ModalProps,
    NumberInput,
    Paper,
    rem,
    SimpleGrid,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import {CampaignCard} from "./index";
import campaignsData from "../data/Campaigns.json";
import {IconApple, IconBrandGoogle, IconBrandPaypal, IconBrandStripe, IconCreditCard} from "@tabler/icons-react";

type IProps = Pick<ModalProps, 'opened' | 'onClose'>
const CheckoutPaymentModal = ({...others}: IProps) => {
    return (
        <Modal title="Select payment method" {...others}>
            <CampaignCard data={campaignsData.data[0]}/>
            <Paper>
                <NumberInput label="Enter your donation amount"/>
                <Checkbox label="Hide your donation amount on CrowdUp"/>
                <Textarea label="Leave a Comment"/>
            </Paper>
            <Paper>
                <Title>Select payment method</Title>
                <Accordion variant="separated" defaultValue="customization">
                    <Accordion.Item value="customization">
                        <Accordion.Control icon={<IconCreditCard size={rem(18)}/>}>Credit card</Accordion.Control>
                        <Accordion.Panel>
                            <TextInput placeholder="Card number"/>
                            <TextInput placeholder="Account number"/>
                            <SimpleGrid cols={2}>
                                <NumberInput placeholder="Expiration date (MM/YY)" hideControls/>
                                <NumberInput placeholder="CVV" hideControls/>
                            </SimpleGrid>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="flexibility">
                        <Accordion.Control icon={<IconBrandPaypal size={rem(18)}/>}>Paypal</Accordion.Control>
                        <Accordion.Panel>
                            <TextInput label="Enter your PayPal email"/>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                <Group>
                    <Button leftIcon={<IconBrandGoogle size={rem(18)}/>}>Google Pay</Button>
                    <Button leftIcon={<IconApple size={rem(18)}/>}>Apple Pay</Button>
                    <Button leftIcon={<IconBrandStripe size={rem(18)}/>}>Stripe</Button>
                </Group>
            </Paper>
            <Paper>
                <Checkbox label="Save my information for future checkout"/>
            </Paper>
        </Modal>
    );
};

export default CheckoutPaymentModal;
