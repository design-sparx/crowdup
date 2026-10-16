import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {customTheme} from "./theme";
import "./fonts/montserrat.css";

import './App.css'
import {RouterProvider} from "react-router-dom";
import router from "./routes";

function App() {
    return (
        <>
            <MantineProvider theme={customTheme} forceColorScheme="light">
                <RouterProvider router={router}/>
                <Notifications/>
            </MantineProvider>
        </>
    )
}

export default App
