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
        MainContent = <FlaggedTicketDetailsServiceDesk />;
    } else {
        MainContent = (
            <div className="p-6 text-sm">
                Access Denied / Invalid Role
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen flex-1 flex-col">
                <div className="h-14 shrink-0 border-b border-gray-300 bg-white">
                </div>

                <main
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        p-4
                        [&::-webkit-scrollbar]:w-px
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-transparent
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                        [&::-webkit-scrollbar-thumb]:rounded-full
                    "
                >
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mb-3
                            flex
                            w-fit
                            cursor-pointer
                            items-center
                            gap-1.5
                            text-xs
                            font-medium
                            text-gray-500
                            transition-colors
                            hover:text-black
                        "
                    >
                        <ArrowLeft size={14} />
                        Back to Flagged Tickets
                    </button>

                    {MainContent}
                </main>
            </div>
        </div>
    );
}