import { useRouteError } from "react-router-dom";

const DetailError404Page = () => {
    const error: any = useRouteError();

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
