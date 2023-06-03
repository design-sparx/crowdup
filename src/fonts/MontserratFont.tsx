import { Global } from '@mantine/core';
import black from './Montserrat-Black.woff2';
import extraBold from './Montserrat-ExtraBold.woff2';
import bold from './Montserrat-Bold.woff2';
import semiBold from './Montserrat-SemiBold.woff2';
import medium from './Montserrat-Medium.woff2';
import regular from './Montserrat-Regular.woff2';
import light from './Montserrat-Light.woff2';
import extraLight from './Montserrat-ExtraLight.woff2';
import thin from './Montserrat-Thin.woff2';

export default function MontserratFont() {
    return (
        <Global
            styles={[
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${black}') format("woff2")`,
                        fontWeight: 900,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${extraBold}') format("woff2")`,
                        fontWeight: 800,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${bold}') format("woff2")`,
                        fontWeight: 700,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${semiBold}') format("woff2")`,
                        fontWeight: 600,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${medium}') format("woff2")`,
                        fontWeight: 500,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${regular}') format("woff2")`,
                        fontWeight: 400,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${light}') format("woff2")`,
                        fontWeight: 300,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${extraLight}') format("woff2")`,
                        fontWeight: 200,
                        fontStyle: 'normal',
                    },
                },
                {
                    '@font-face': {
                        fontFamily: 'Montserrat',
                        src: `url('${thin}') format("woff2")`,
                        fontWeight: 100,
                        fontStyle: 'normal',
                    },
                },
            ]}
        />
    );
}
