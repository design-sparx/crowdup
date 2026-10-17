import {Box} from "@mantine/core";
import ReactApexChart from "react-apexcharts";
import type {ApexOptions} from "apexcharts";
import {minorUnitExponent} from "../lib/donations/amount";
import {bucketDonations, type DashboardDonation} from "../lib/dashboard/dashboard";

const DAYS = 30;

interface Props {
    donations: DashboardDonation[];
    now: string;
}

/** Daily donations for the last 30 days, one series per currency (minor units shown as major). */
const DonationsChart = ({donations, now}: Props) => {
    const {days, series} = bucketDonations(donations, DAYS, new Date(now));
    const options: ApexOptions = {
        chart: {type: "bar", height: 320, stacked: true, toolbar: {show: false}},
        plotOptions: {bar: {borderRadius: 4}},
        xaxis: {type: "datetime", categories: days},
        yaxis: {labels: {formatter: (v: number) => v.toLocaleString("en-US")}},
        legend: {position: "bottom"},
        dataLabels: {enabled: false},
        fill: {opacity: 1},
    };
    return (
        <Box>
            <ReactApexChart
                options={options}
                series={series.map((s) => ({name: s.currency, data: s.data.map((v) => v / 10 ** minorUnitExponent(s.currency))}))}
                type="bar"
                height={320}
            />
        </Box>
    );
};

export default DonationsChart;
