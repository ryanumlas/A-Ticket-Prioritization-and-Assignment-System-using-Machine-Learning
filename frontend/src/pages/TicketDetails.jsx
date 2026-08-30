import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import TicketDetailsEmployee from "../components/TicketDetailsEmployee";
import TicketDetailsServiceDesk from "../components/TicketDetailsServiceDesk";
// import TicketDetailsSupport from "../components/TicketDetailsSupport";

export default function TicketDetails() {
    const user = getCurrentUser();

    const [ticketDetails, setTicketDetails] = useState(null);

    const { ticketId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await api.get(
                    `/tickets/employee/detail/${ticketId}/`
                );

                setTicketDetails(response.data);

                console.log(
                    "Fetched ticket details:",
                    response.data
                );
            } catch (error) {
                console.error(
                    "Error fetching ticket details:",
                    error
                );
            }
        };

        fetchTicketDetails();
    }, [ticketId]);

    if (!ticketDetails) {
        return <p>Loading...</p>;
    }

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = (
            <TicketDetailsEmployee
                ticketDetails={ticketDetails}
            />
        );
    }
    else if (user?.role === "IT Service Desk") {
        MainContent = (
            <TicketDetailsServiceDesk
                ticketDetails={ticketDetails}
            />
        );
    }
    // else if (user?.role === "IT Support Specialist") {
    //     MainContent = (
    //         <TicketDetailsSupport
    //             ticketDetails={ticketDetails}
    //         />
    //     );
    // }
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

            <div className="flex h-screen flex-1 flex-col">

                {/* TOP BAR */}
                <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

                {/* PAGE */}
                <main className="flex min-h-0 flex-1 flex-col p-4">

                    {/* BACK */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-3 flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
                    >
                        <ArrowLeft size={16} />
                        Back to Tickets
                    </button>

                    {/* DETAILS */}
                    <div className="min-h-0 flex-1">
                        {MainContent}
                    </div>

                </main>

            </div>
        </div>
    );
}