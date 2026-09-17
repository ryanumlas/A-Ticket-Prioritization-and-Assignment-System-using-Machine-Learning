import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import PriorityRequestDetailsServiceDesk from "./PriorityRequestDetailsServiceDesk";

export default function PriorityRequestDetails() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "IT Service Desk") {
        MainContent = <PriorityRequestDetailsServiceDesk />;
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

            <div className="flex h-screen flex-1 flex-col">

                <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

                <main className="min-h-0 flex-1">
                    {MainContent}
                </main>

            </div>
        </div>
    );
}