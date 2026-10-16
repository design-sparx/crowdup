import { useRouteError } from "react-router";

const DetailError404Page = () => {
    const error = useRouteError() as { statusText?: string; message?: string } | undefined;

    return (
        <div>
            campaign error 404
            <p>
                <i>{error?.statusText || error?.message}</i>
            </p>
        </div>
    );
};

export default DetailError404Page;
