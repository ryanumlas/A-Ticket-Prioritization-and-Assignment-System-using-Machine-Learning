import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import SupportReopenRequest from "../pages/SupportReopenRequest";
import TopBar from "../components/Topbar"

export default function Ticket() {
    const user = getCurrentUser();

    let MainContent;

    if (user?.role === "IT Support Specialist") {
        MainContent = <SupportReopenRequest/>;
    }

    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 h-screen flex flex-col">
            
                <TopBar/>

                <main className="flex-1 h-full">
                    {MainContent}
                </main>

            </div>
        </div>
    );
}