import {MantineProvider} from "@mantine/core";
import {RouterProvider} from "react-router-dom";
import {Notifications} from "@mantine/notifications";
import router from "./routes";
import {customTheme} from "./theme";

import './App.css'

function App() {
    return (
        <>
            <MantineProvider theme={customTheme}>
                <Notifications />
                <RouterProvider router={router}/>
            </MantineProvider>
        </>
    )
}

export default App
