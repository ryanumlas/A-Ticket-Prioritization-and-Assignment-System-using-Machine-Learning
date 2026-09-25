import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import { getCurrentUser } from "../utils/auth";
import PriorityRequestServiceDesk from "../pages/PriorityRequestServiceDesk";

export default function PriorityRequest() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "IT Service Desk") {
        MainContent = <PriorityRequestServiceDesk />;
    } else {
        MainContent = (
            <div className="p-6">
                Access Denied / Invalid Role
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0">
                    <TopBar />
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto">
                    {MainContent}
                </main>
            </div>
        </div>
    );
}