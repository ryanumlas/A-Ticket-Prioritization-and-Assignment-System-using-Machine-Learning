import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import SupportDashboard from "../pages/SupportDashboard";
import ServiceDeskDashboard from "../pages/ServiceDeskDashboard";
import SystemAdminDashboard from "../pages/SystemAdminDashboard";
import { motion } from "motion/react";
import Topbar from "../components/Topbar";

export default function Dashboard() {
    const user = getCurrentUser();

    let MainContent;

    if (!user) {
        MainContent = (
            <div className="p-6">
                Please log in to view the dashboard.
            </div>
        );
    } else if (user.role === "Employee") {
        MainContent = <EmployeeDashboard />;
    } else if (user.role === "IT Support Specialist") {
        MainContent = <SupportDashboard />;
    } else if (user.role === "IT Service Desk") {
        MainContent = <ServiceDeskDashboard />;
    } else if (user.role === "System Administrator") {
        MainContent = <SystemAdminDashboard />;
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
                    <Topbar />
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeOut",
                        }}
                        className="p-2 sm:p-4 lg:p-6"
                    >
                        {MainContent}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}