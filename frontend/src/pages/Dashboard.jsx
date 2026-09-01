import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import SupportDashboard from "../pages/SupportDashboard";
import ServiceDeskDashboard from "../pages/ServiceDeskDashboard";
import { motion } from "motion/react";

export default function Dashboard() {
    const user = getCurrentUser();

    let MainContent;

    if (!user) {
        MainContent = (
            <div className="p-6">
                Please log in to view the dashboard.
            </div>
        );
    }
    else if (user.role === "Employee") {
        MainContent = <EmployeeDashboard />;
    }
    else if (user.role === "IT Support Specialist") {
        MainContent = <SupportDashboard />;
    }
    else if (user.role === "IT Service Desk") {
        MainContent = <ServiceDeskDashboard />;
    }
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

            <div className="flex h-screen flex-1 flex-col overflow-y-auto">

                <div className="h-14 shrink-0 border-b border-gray-300 bg-white">
                </div>

                <motion.main
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
                    className="p-6"
                >
                    {MainContent}
                </motion.main>

            </div>
        </div>
    );
}