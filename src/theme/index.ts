import {MantineThemeOverride} from "@mantine/core";

export const customTheme: MantineThemeOverride = {
    defaultRadius: 'sm',
    colorScheme: 'light',
    colors: {
        'secondary': ['#fff7e0', '#f0e1bf', '#e3ca9a', '#d7b174', '#ca964e', '#b17935', '#8a6428', '#634c1b', '#3d310d', '#1a1200'],
        'primary': ['#e3fced', '#c0eecf', '#9be3b0', '#74d68e', '#4eca6a', '#35b14c', '#278a41', '#196232', '#0c3c20', '#001606']
    },
    primaryColor: 'primary',
    primaryShade: 6,
    fontFamily: 'Montserrat, sans-serif'
}
