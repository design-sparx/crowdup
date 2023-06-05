import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {customTheme} from "./theme";
import MontserratFont from "./fonts/MontserratFont";
import {RouterProvider} from "react-router-dom";
import router from "./routes";

import './App.css'

function App() {
    return (
        <>
            <RouterProvider router={router}/>
            <MantineProvider theme={customTheme}>
                <MontserratFont/>
                <Notifications/>
            </MantineProvider>
        </>
    )
}

export default App
