import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import EmployeeDashboard from "../pages/EmployeeDashboard"
import SupportDashboard from "../pages/SupportDashboard";
import ServiceDeskDashboard from "../pages/ServiceDeskDashboard";

export default function Dashboard() {
    const user = getCurrentUser();
    
    let MainContent;

    if (user?.role === "Employee") {
        MainContent = <EmployeeDashboard/>;
    }
    else if (user?.role === "IT Support Specialist") {
        MainContent = <SupportDashboard/>;
    }
    else if (user?.role === "IT Service Desk") {
        MainContent = <ServiceDeskDashboard/>;
    }
    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }
    return (
        <div className="flex min-h-screen w-screen overflow-hidden">
            <Sidebar/>

            <main>
                {MainContent}
            </main>
        </div>
    );
}