import {MantineThemeOverride} from "@mantine/core";

export const customTheme: MantineThemeOverride = {
    defaultRadius: 'sm',
    colors: {
        'secondary': ['#fff7e0', '#f0e1bf', '#e3ca9a', '#d7b174', '#ca964e', '#b17935', '#8a6428', '#634c1b', '#3d310d', '#1a1200'],
        'primary': ['#e3fced', '#c0eecf', '#9be3b0', '#74d68e', '#4eca6a', '#35b14c', '#278a41', '#196232', '#0c3c20', '#001606']
    },
    primaryColor: 'primary',
    primaryShade: 6,
    fontFamily: 'Montserrat, sans-serif',
    // Mantine 9 changed these defaults; keep the v6 values so spacing is unchanged
    spacing: {xs: '0.625rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem'},
    lineHeights: {xs: '1.55', sm: '1.55', md: '1.55', lg: '1.55', xl: '1.55'},
}
