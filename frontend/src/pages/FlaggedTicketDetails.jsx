import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import FlaggedTicketDetailsServiceDesk from "../components/FlaggedTicketDetailsServiceDesk";

export default function FlaggedTicketDetails() {
    const user = getCurrentUser();
    let MainContent;

    if (user?.role === "IT Service Desk") {
        MainContent = <FlaggedTicketDetailsServiceDesk/>
    } else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }
    return(
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar/>
            <div className="flex-1 h-screen flex flex-col">
                <div className="h-14 border-b border-gray-300 mb-4 bg-white shrink-0">
                </div>
                {/* <p className="text-sm">Back to my tickets</p> */}
                <main className="min-h-0 flex-1 overflow-y-auto p-4">
                    {MainContent}
                </main>
            </div>
        </div>
    );
}