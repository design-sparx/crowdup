import {isRouteErrorResponse, Link, useRouteError} from "react-router";
import {buttonVariants} from "@/components/ui/button";

export function ErrorPage() {
    const error = useRouteError();
    const notFound =
        (isRouteErrorResponse(error) && error.status === 404) ||
        (error instanceof Response && error.status === 404);
    if (!notFound) console.error(error);
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">{notFound ? "404" : "Error"}</p>
            <h1 className="text-3xl font-semibold">{notFound ? "Page not found" : "Something went wrong"}</h1>
            <p className="text-muted-foreground">
                {notFound
                    ? "This page does not exist or is no longer available."
                    : "Please try again. If it keeps happening, tell the person who runs this site."}
            </p>
            <Link to="/" className={buttonVariants()}>
                Back to home
            </Link>
        </main>
    );
}
