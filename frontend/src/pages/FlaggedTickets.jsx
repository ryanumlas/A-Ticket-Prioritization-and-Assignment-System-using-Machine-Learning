import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import FlaggedTicketsTable from "../components/FlaggedTicketsTable"
import ServiceDeskFlaggedTickets from "./ServiceDeskFlaggedTickets";

export default function FlaggedTickets() {
    const user = getCurrentUser();
    let MainContent;

    if (user?.role === "IT Service Desk") {
        MainContent = <ServiceDeskFlaggedTickets/>
    }
    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }
    return(
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 h-screen flex flex-col">
            
                <div className="h-14 border-b border-gray-300 bg-white mb-20 shrink-0">
                </div>

                <main className="flex-1 h-full p-10">
                    {MainContent}
                </main>

            </div>
        </div>
    );
}