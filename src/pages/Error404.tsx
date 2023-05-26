import { useRouteError } from "react-router-dom";

const Error404Page = () => {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div>
            error 404
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
};

export default Error404Page;
