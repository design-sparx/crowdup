import {Outlet} from "react-router";
export {Error404Page as ErrorBoundary} from "../pages";

export default function Layout() {
    return <Outlet/>;
}
