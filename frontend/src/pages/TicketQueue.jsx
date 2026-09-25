import { getCurrentUser } from "../utils/auth";
import TicketQueueSupport from "../pages/TicketQueueSupport";
import TicketQueueServiceDesk from "./TicketQueueServiceDesk";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function TicketQueue() {
    const user = getCurrentUser();

    let MainContent;

    if (!user) {
        MainContent = (
            <div className="p-6">
                Please log in to view the dashboard.
            </div>
        );
    } else if (user.role === "IT Support Specialist") {
        MainContent = <TicketQueueSupport />;
    }
    // else if (user.role === "IT Service Desk") {
    //     MainContent = <TicketQueueServiceDesk />;
    // }
    else {
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
                {/* Fixed Topbar */}
                <div className="shrink-0">
                    <Topbar />
                </div>

                {/* Only this area scrolls */}
                <main className="min-h-0 flex-1 overflow-y-auto">
                    {MainContent}
                </main>
            </div>
        </div>
    );
}