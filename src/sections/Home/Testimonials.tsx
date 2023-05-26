import {Box} from "@mantine/core";
import {Carousel} from "@mantine/carousel";
import testimonialsData from "../../data/Testimonials.json";
import {TestimonialsCard} from "../../components";

const TestimonialsSection = () => {
    const slides = testimonialsData.data.map(t => (
        <Carousel.Slide key={t.id}><TestimonialsCard data={t}/></Carousel.Slide>))

    return (
        <Box>
            <Carousel slideSize="95%" align="start" slideGap="lg">
                {slides}
            </Carousel>
        </Box>
    );
};

export default TestimonialsSection;
