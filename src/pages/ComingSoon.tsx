export default function ComingSoonPage({title}: {title: string}) {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-2 px-4 text-center">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="text-gray-600">This screen is being rebuilt. Check back soon.</p>
        </main>
    );
}
