import {MantineProvider} from "@mantine/core";
import {RouterProvider} from "react-router-dom";
import router from "./routes";
import {customTheme} from "./theme";

import './App.css'

function App() {
    return (
        <>
            <MantineProvider theme={customTheme}>
                <RouterProvider router={router}/>
            </MantineProvider>
        </>
    )
}

export default App
