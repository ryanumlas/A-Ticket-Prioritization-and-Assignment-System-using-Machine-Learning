import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import TicketReturnDetailServiceDesk from "./TicketReturnDetailServiceDesk";

export default function TicketDetails() {
    const user = getCurrentUser();
    const navigate = useNavigate();

    if (user?.role !== "IT Service Desk") {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
                <Sidebar />

                <div className="flex h-screen flex-1 flex-col">
                    <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

                    <main className="flex flex-1 items-center justify-center">
                        <p className="text-sm text-gray-500">
                            Access Denied / Invalid Role
                        </p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen flex-1 flex-col">
                <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

                <main className="flex min-h-0 flex-1 flex-col p-4">
                    <div className="mb-3 flex h-9 shrink-0 items-center">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            <ArrowLeft size={16} />
                            Back to Tickets
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto">
                        <TicketReturnDetailServiceDesk />
                    </div>
                </main>
            </div>
        </div>
    );
}