import CodePortal from "../components/CodePortal";

export default function Home() {
    return (
        <main className="p-4 bg-[#0D0D0D] h-screen overflow-hidden text-gray-200 flex items-center justify-center">
            <div className="w-full max-w-[95vw] h-full">
                <CodePortal />
            </div>
        </main>
    );
}
