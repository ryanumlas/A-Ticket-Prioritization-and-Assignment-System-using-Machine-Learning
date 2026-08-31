import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import FlaggedTicketDetailsServiceDesk from "../components/FlaggedTicketDetailsServiceDesk";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function FlaggedTicketDetails() {
    const navigate = useNavigate(); 
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
                <div className="h-14 border-b border-gray-300  bg-white shrink-0">
                </div>
                {/* <p className="text-sm">Back to my tickets</p> */}
                <main className="min-h-0 flex-1 overflow-y-auto p-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-3 flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
                    >
                        <ArrowLeft size={16} />
                        Back to Flagged Tickets
                    </button>

                    {MainContent}

                </main>
            </div>
        </div>
    );
}