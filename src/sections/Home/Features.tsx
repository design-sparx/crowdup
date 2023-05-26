import {Box, Button, createStyles, Image, Paper, PaperProps, SimpleGrid, Text, Title} from '@mantine/core';
import {SectionTitle} from "../../components";

const useStyles = createStyles(() => ({
  feature: {},
}));

interface FeatureProps extends PaperProps {
  image: string
  title: string;
  description: string;
  action: string;
}

const mockdata = [
  {
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    title: 'Community',
    description:
      'Together we are stronger than alone. Find your peers and learn from others. Join our founder community or come to an event featuring leading social entrepreneurs from around the world.',
    action: `Check out what's on`
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    title: 'Education',
    description:
      `Make your social enterprise (or “dream project”) a reality. Learn the keys to success and avoid the common missteps through one of our programs, working alongside other founders.`,
    action: 'Learn more about upcoming programs and opportunities'
  },
  {
    image: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    title: 'Crowdfunding',
    description:
      `Ready to rally the resources you need to do good? Crowdup offers project, recurring and debt crowdfunding. We can even help you design a great campaign to give you the highest chance to succeed!`,
    action: 'See crowdfunding options'
  },
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    title: 'Partnerships',
    description:
      `Crowdup partners with leading brands, institutions and governments to support changemakers. We accelerate change through challenges, accelerators and funding programs.`,
    action: 'Find out how we can work together '
  },
];

function Feature({image, title, description, action}: FeatureProps) {
  const {classes} = useStyles();

  return (
    <Paper className={classes.feature}>
      <Image src={image}/>
      <Title>{title}</Title>
      <Text>{description}</Text>
      <Button>{action}</Button>
    </Paper>
  );
}

const FeaturesSection = () => {
  const items = mockdata.map((item) => <Feature {...item} key={item.title}/>);

  return (
    <Box mt={30} mb={30} size="lg">
      <SectionTitle
        title="what to expect"
        description="Crowdup exists to support social impact projects, enterprises and founders. What good can we help you start?"/>
      <SimpleGrid cols={2} breakpoints={[{maxWidth: 'sm', cols: 1}]} spacing={50}>
        {items}
      </SimpleGrid>
    </Box>
  );
}

export default FeaturesSection;
