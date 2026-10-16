import { useRouteError } from "react-router-dom";

const Error404Page = () => {
    const error = useRouteError() as { statusText?: string; message?: string };
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
