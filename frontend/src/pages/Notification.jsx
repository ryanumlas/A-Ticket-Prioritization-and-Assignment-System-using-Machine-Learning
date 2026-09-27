import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import EmployeeTicket from "../pages/EmployeeTicket";
import ServiceDeskTicket from "../pages/ServiceDeskTicket";
import SupportTicket from  "../pages/SupportTicket";
import Topbar from "../components/Topbar";
import EmployeeNotification from "./NotificationPages/EmployeeNotification";
import SupportNotification from "./NotificationPages/SupportNotification";

export default function Ticket() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = <EmployeeNotification/>
    }
    else if (user?.role === "IT Support Specialist") {
        MainContent = <SupportNotification/>;
    }
    else if (user?.role === "IT Service Desk") {
        MainContent = <ServiceDeskTicket/>;
    }
    else if (user?.role === "IT Supervisor") {
        MainContent = <ServiceDeskTicket/>;
    }
    else if (user?.role === "System Administrator") {
        MainContent = <ServiceDeskTicket/>;
    }
    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 h-screen flex flex-col">
            
                <Topbar/>

                <main className="flex-1 h-full">
                    {MainContent}
                </main>

            </div>
        </div>
    );
}