import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import AuditLogList from "./AuditLogsList";
import Topbar from "../components/Topbar";

export default function AuditLogs() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "System Administrator") {
        MainContent = <AuditLogList />;
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
                <Topbar />

                <main className="flex-1">
                    {MainContent}
                </main>
            </div>
        </div>
    );
}