import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import SupportWorkload from "../pages/SupportWorkload";
import TopBar from "../components/Topbar";

export default function TeamWorkload() {
    const user = getCurrentUser();

    let MainContent;

    if (
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor"
    ) {
        MainContent = <SupportWorkload />;
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

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <TopBar />

                <main className="min-h-0 flex-1 overflow-hidden">
                    {MainContent}
                </main>
            </div>
        </div>
    );
}