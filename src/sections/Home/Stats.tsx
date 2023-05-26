import {Box, Paper, PaperProps, SimpleGrid, Text} from "@mantine/core";
import {SectionTitle} from "../../components";

const mockData = [
    {
        amount: '5B',
        description: 'We have raised an impressive amounts of funds. Help use continue to grow and reach our ultimate goal.'
    },
    {
        amount: '15K',
        description: 'Over 12K campaigns are funded. Join us and be a part of our success story.'
    },
    {
        amount: '700',
        description: 'We have more than 700 active campaigns. Help us continue to made vision into reality.'
    }
]

interface IStatsProps extends PaperProps {
    amount: string
    description: string
}

function Stats({amount, description}: IStatsProps) {
    return (
        <Paper withBorder>
            <Text>{amount}+</Text>
            <Text>{description}</Text>
        </Paper>
    )
}

const StatsSection = () => {
    const items = mockData.map((item) => <Stats {...item} key={item.description}/>)

    return (
        <Box>
            <SectionTitle
                title="make a difference"
                description="large pool potential investor"
                extra="With our crowdfunding platform, you can support the projects and causes you care about most"/>
            <SimpleGrid cols={3}>
                {items}
            </SimpleGrid>
        </Box>
    );
};

export default StatsSection;
