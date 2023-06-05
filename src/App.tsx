import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {customTheme} from "./theme";
import MontserratFont from "./fonts/MontserratFont";

import './App.css'

function App() {
    return (
        <>
            <MantineProvider theme={customTheme}>
                <MontserratFont/>
                <Notifications/>
            </MantineProvider>
        </>
    )
}

export default App
