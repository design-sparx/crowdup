import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {customTheme} from "./theme";
import MontserratFont from "./fonts/MontserratFont";

import './App.css'
import {RouterProvider} from "react-router-dom";
import router from "./routes";

function App() {
    return (
        <>
            <MantineProvider theme={customTheme}>
                <RouterProvider router={router}/>
                <MontserratFont/>
                <Notifications/>
            </MantineProvider>
        </>
    )
}

export default App
