import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import EmployeeTicket from "../pages/EmployeeTicket";
import SupportTicket from  "../pages/SupportTicket";

export default function Ticket() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = <EmployeeTicket/>;
    }
    else if (user?.role === "IT Support Specialist") {
        MainContent = <SupportTicket/>;
    }
    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 h-screen flex flex-col">
            
                <div className="h-20 border-b border-gray-300 bg-white mb-20 shrink-0">
                </div>

                <main className="flex-1 h-full p-6">
                    {MainContent}
                </main>

            </div>
        </div>
    );
}