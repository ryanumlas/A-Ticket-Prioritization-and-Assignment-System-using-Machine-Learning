import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SystemAdConfigList from "../components/SystemAdConfigList";

export default function SystemAdSymptomCodes() {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />
                <main className="min-h-0 flex-1 overflow-y-auto">
                    <SystemAdConfigList sectionKey="symptomCodes" />
                </main>
            </div>
        </div>
    );
}