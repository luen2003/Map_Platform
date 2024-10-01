import dynamic from "next/dynamic";

const VietnamMap = dynamic(() => import("../components/MainContent"), {
    ssr: false,
});

export default function Home() {
    return (
        <div>
            <main className="bg-black">
                <VietnamMap />
            </main>
        </div>
    );
}
