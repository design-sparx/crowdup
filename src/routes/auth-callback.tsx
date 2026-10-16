import type {LoaderFunctionArgs} from "react-router";
import {exchangeCode} from "../data-access/auth/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
    return exchangeCode(request);
}
